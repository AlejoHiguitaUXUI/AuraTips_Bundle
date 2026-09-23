import asyncio
import os
from livekit import api
from dotenv import load_dotenv

load_dotenv()

async def main():
    print("Conectando a LiveKit Cloud...")
    livekit_api = api.LiveKitAPI(
        os.getenv("LIVEKIT_URL"),
        os.getenv("LIVEKIT_API_KEY"),
        os.getenv("LIVEKIT_API_SECRET")
    )
    
    print("Creando regla de enrutamiento (Dispatch Rule) para 'edy-voice-agent'...")
    try:
        # Create a dispatch rule that routes to 'edy-voice-agent' when a room is created
        await livekit_api.room.create_sip_participant(
            api.CreateSIPParticipantRequest(
                sip_trunk_id="",
                sip_call_to="",
                room_name="",
                participant_identity=""
            )
        )
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await livekit_api.aclose()

asyncio.run(main())
