from fastapi import FastAPI
from send_mail import send_verification_email

app = FastAPI()

@app.get("/")
async def home():
    return {"message": "MiitVerse API Running"}

@app.get("/send_mail")
async def send_mail():
    await send_verification_email(
        "kyawtheintun.m.4501@gmail.com",  # Change to your email
        "http://127.0.0.1:8000/verify/token123"
    )

    return {"message": "Verification email sent successfully"}