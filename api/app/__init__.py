# modal based api to call gpt-3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .prompts import run_conversation

import modal

web_app = FastAPI()

origins = [
    "*",
]

web_app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Term(BaseModel):
    citation: str
    tag: str
    explanation: str


class ProofreadRequest(BaseModel):
    text: str


class ProofreadResponse(BaseModel):
    terms: list[Term]


@web_app.post("/proofread")
async def proofread(req: ProofreadRequest) -> ProofreadResponse:
    response = run_conversation(req.text)

    print(response)

    return ProofreadResponse(
        terms=[
            Term(
                citation="commitment to responsible and environmentally-friendly design",
                tag="orange",
                explanation="Generic environmental claims are prohibited when they are not based on recognized excellent environmental performance relevant to the claim.",
            )
        ]
    )


@modal.asgi_app()
def fastapi_app():
    return web_app
