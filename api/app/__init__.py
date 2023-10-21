# modal based api to call gpt-3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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

stub = modal.Stub("controlk-api")

image = modal.Image.debian_slim().pip_install_from_requirements("requirements.txt")


class Alternative(BaseModel):
    original: str
    alternative: str


class Term(BaseModel):
    citation: str
    tag: list[str]
    explanation: str
    alternative: list[Alternative]


class ProofreadRequest(BaseModel):
    text: str


class ProofreadResponse(BaseModel):
    terms: list[Term]


@web_app.get("/proofread")
async def proofread(req: ProofreadRequest) -> ProofreadResponse:
    return ProofreadResponse(
        terms=[
            Term(
                citation="https://www.google.com",
                tag=["forbidden_word"],
                explanation="This is a forbidden word",
                alternative=[
                    Alternative(
                        original="lalalala",
                        alternative="lalalalalla",
                    )
                ],
            )
        ]
    )


@stub.function(image=image, secret=modal.Secret.from_name("openai"), keep_warm=1, cpu=2)
@modal.asgi_app()
def fastapi_app():
    return web_app
