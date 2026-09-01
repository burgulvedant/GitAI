"""Vercel Serverless Function entrypoint for GitAI FastAPI backend.

Exposes the verified FastAPI application from app.server.
"""

import sys
from pathlib import Path

# Ensure repository root is on Python path for serverless imports
project_root = Path(__file__).resolve().parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from app.server import app

# Export app instance for Vercel Python runtime
__all__ = ["app"]
