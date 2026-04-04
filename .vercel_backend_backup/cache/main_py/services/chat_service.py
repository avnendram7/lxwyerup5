import uuid

# In-memory session history (simple, ephemeral)
_sessions: dict = {}


async def send_chat_message(message: str, session_id: str, system_prompt: str = None) -> str:
    """AI chat is currently disabled. Returns a friendly unavailable message."""
    return '{"cards":[{"type":"warning","title":"AI Unavailable","content":"The AI assistant is currently unavailable. Please use the Find Lawyer feature to connect with a verified lawyer."} ]}'


def generate_guest_session_id() -> str:
    """Generate a unique session ID for guest users"""
    return f"guest_{uuid.uuid4()}"
