"""API routes for the One Night Werewolf Assistant application."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "One Night Werewolf Assistant API is running"}


@router.get("/api/info")
async def get_info():
    """Get application information."""
    return {
        "app": "One Night Werewolf Assistant",
        "version": "1.0.0",
        "description": "A web assistant for playing One Night Werewolf"
    }
