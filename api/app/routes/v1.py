from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class Tab(BaseModel):
    url: str
    bodyInnerText: str
    highlightedText: str


class ChatRequest(BaseModel):
    prompt: ChatMessage
    history: list[ChatMessage]
    tab: Tab


class ChatResponse(BaseModel):
    role: str
    content: str


@router.post("/chat")
async def chat(request: ChatRequest):
    """Endpoint that proxies the OpenAI chat endpoint

    Args:
        request (ChatRequest): a user providing the chat history so far including the last message

    Returns:
        response (ChatResponse): the response from the chat endpoint
    """
    import openai

    url = request.tab.url
    highlighted_text = request.tab.highlightedText
    message_role = request.prompt.role
    message_content = request.prompt.content

    if len(message_content) > 1000:
        raise HTTPException(
            status_code=400, detail="Message must be less than 1000 characters"
        )

    prev_messages = list(
        map(
            lambda message: {"role": message.role, "content": message.content},
            request.history,
        )
    )

    # Create system message that informs setting of the chat
    system_message = create_system_message(url)

    # Create new message that contains the users question and
    # relevant chunks from the page and highlighted text
    new_message = create_new_message(
        role=message_role,
        prompt=message_content,
        system_message=system_message,
        full_page_content=request.tab.bodyInnerText,
        prev_messages=prev_messages,
        highlighted_text=highlighted_text,
    )

    total_message = [system_message] + prev_messages + [new_message]

    completion = openai.ChatCompletion.create(
        model="gpt-4", messages=total_message, stream=True
    )

    def stream_completion(completion):
        for chunk in completion:
            try:
                yield chunk.choices[0]["delta"]["content"]
            except:
                continue

    return StreamingResponse(
        stream_completion(completion), media_type="text/event-stream"
    )
