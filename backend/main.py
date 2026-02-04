"""FastAPI application entry point with event loop fix for uvloop compatibility."""

import asyncio
import sys

# Fix for uvloop compatibility with Python 3.8
# Set event loop policy BEFORE importing uvicorn
if sys.platform != 'win32':
    # Use the default event loop policy (not uvloop)
    asyncio.set_event_loop_policy(asyncio.DefaultEventLoopPolicy())

# Now import the app
from src.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
