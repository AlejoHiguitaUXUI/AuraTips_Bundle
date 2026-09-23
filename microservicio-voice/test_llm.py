import asyncio
import os
from livekit.plugins import google
from dotenv import load_dotenv

load_dotenv()

async def main():
    try:
        llm = google.LLM(
            model=os.getenv("GEMINI_MODEL", "gemini-3.6-flash"),
            api_key=os.getenv("GEMINI_API_KEY")
        )
        print("LLM model:", llm)
    except Exception as e:
        print("Error initializing LLM:", e)

asyncio.run(main())
