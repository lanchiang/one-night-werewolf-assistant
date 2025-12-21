"""Main application entry point for One Night Werewolf Assistant."""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from backend.routes import router

# Initialize FastAPI app
app = FastAPI(
    title="One Night Werewolf Assistant",
    description="A web assistant for playing One Night Werewolf",
    version="1.0.0"
)

# Include API routes
app.include_router(router)

# Mount static files directory
static_dir = Path(__file__).parent / "frontend" / "static"
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


@app.get("/")
async def read_root():
    """Serve the main HTML page."""
    html_file = Path(__file__).parent / "frontend" / "index.html"
    return FileResponse(html_file)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
