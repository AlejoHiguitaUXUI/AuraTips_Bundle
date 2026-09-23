import asyncio
from livekit.plugins import google
async def main():
    stt = google.STT()
    print(stt)
asyncio.run(main())
