"""Streamlit entry point for GitAI Dashboard (Legacy / Course Demo Bridge)."""

import streamlit as st

st.set_page_config(
    page_title="GitAI — GitHub Intelligence & Trend Prediction",
    page_icon="📊",
    layout="wide"
)

st.title("📊 GitAI: Data-Driven GitHub Intelligence & Trend Prediction")
st.markdown("""
### Welcome to GitAI (Phase 6 Production Release)

The full **interactive GitAI web experience** (featuring the WebGL Silk Cascade background, Apple-inspired spring transitions, and 7-tab Bento Grid dashboard) is hosted on the React + FastAPI web server.

**To launch the full GitAI application:**
```bash
./.venv/bin/uvicorn app.server:app --host 127.0.0.1 --port 8000 --reload
```
Then open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.
""")
