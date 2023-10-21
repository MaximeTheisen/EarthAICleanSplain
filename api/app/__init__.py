# modal based api to call gpt-3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


@web_app.get("/proofread")
async def root():
    return {"message": "Hello World"}


@stub.function(image=image, secret=modal.Secret.from_name("openai"), keep_warm=1, cpu=2)
@modal.asgi_app()
def fastapi_app():
    return web_app
