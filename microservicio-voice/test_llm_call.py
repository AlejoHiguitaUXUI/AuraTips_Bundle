import asyncio
import os
from livekit.plugins import google
from livekit.agents.llm import ChatContext, ChatMessage
from dotenv import load_dotenv

load_dotenv()

async def main():
    llm = google.LLM(
        model=os.getenv("GEMINI_MODEL", "gemini-3.6-flash"),
        api_key=os.getenv("GEMINI_API_KEY")
    )
    context = ChatContext()
    context.messages.append(ChatMessage(role="user", content="Hola"))
    try:
        stream = await llm.chat(chat_ctx=context)
        async for chunk in stream:
            pass
        print("Success")
    except Exception as e:
        print("API Error:", e)

asyncio.run(main())
