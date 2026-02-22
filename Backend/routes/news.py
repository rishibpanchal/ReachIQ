"""
News Routes

GNews API proxy for world news relevant to ReachIQ decision-making.
Keeps API key server-side for security.
"""

import os
import json
import logging
from pathlib import Path

from dotenv import load_dotenv

# Ensure .env is loaded before reading GNEWS_API_KEY
_backend_dir = Path(__file__).resolve().parent.parent
_root = _backend_dir.parent
load_dotenv(_backend_dir / ".env")  # Backend/.env
load_dotenv(_root / ".env")  # project root
load_dotenv(_root / "Frontend" / ".env")  # Frontend/.env

import ssl
from urllib.request import urlopen, Request
from urllib.parse import urlencode
from urllib.error import HTTPError, URLError

import certifi
from fastapi import APIRouter

logger = logging.getLogger(__name__)

router = APIRouter()

GNEWS_BASE = "https://gnews.io/api/v4"
GNEWS_API_KEY = os.getenv("GNEWS_API_KEY", "").strip()

# Use certifi's CA bundle to fix SSL verification on macOS/Windows
_SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())


def _fetch_gnews(endpoint: str, params: dict) -> tuple[list, str | None]:
    """Fetch from GNews API. Returns (articles, error_message)."""
    if not GNEWS_API_KEY or GNEWS_API_KEY == "your_gnews_api_key_here":
        return [], "GNEWS_API_KEY not configured. Add it to Frontend/.env"

    params["apikey"] = GNEWS_API_KEY
    params["max"] = params.get("max", 8)
    url = f"{GNEWS_BASE}/{endpoint}?{urlencode(params)}"

    try:
        req = Request(url, headers={"User-Agent": "ReachIQ/1.0"})
        with urlopen(req, timeout=10, context=_SSL_CONTEXT) as resp:
            data = json.loads(resp.read().decode())
            if "errors" in data:
                err = data["errors"]
                msg = err[0] if isinstance(err, list) and err else str(err)
                logger.error(f"GNews API returned error: {msg}")
                return [], msg
            return data.get("articles") or [], None
    except HTTPError as e:
        body = ""
        try:
            body = e.read().decode() if e.fp else ""
        except Exception:
            pass
        msg = f"GNews HTTP {e.code}: {body[:200]}" if body else str(e)
        logger.error(f"GNews API error: {msg}")
        return [], msg
    except (URLError, json.JSONDecodeError) as e:
        logger.error(f"GNews API error: {e}")
        return [], str(e)


def _normalize_article(a: dict, category: str) -> dict:
    """Normalize GNews article to frontend format."""
    return {
        "id": a.get("url", a.get("title", ""))[:100],
        "title": a.get("title", ""),
        "description": a.get("description", ""),
        "url": a.get("url", ""),
        "image": a.get("image", ""),
        "publishedAt": a.get("publishedAt", ""),
        "source": a.get("source", {}).get("name", "Unknown"),
        "sourceUrl": a.get("source", {}).get("url", ""),
        "category": category,
    }


@router.get("/world")
async def get_world_news():
    """
    Fetch recent world news relevant to ReachIQ decision-making.
    Combines Business, Technology, and B2B/digital marketing headlines.
    """
    articles = []
    seen_urls = set()
    gnews_error = None

    # 0. General/trending headlines
    general, err = _fetch_gnews("top-headlines", {"category": "general", "lang": "en", "max": 6})
    if err:
        gnews_error = err
    for a in general:
        if a.get("url") and a["url"] not in seen_urls:
            seen_urls.add(a["url"])
            articles.append(_normalize_article(a, "general"))

    # 1. Business headlines (skip if we already have enough and had an error)
    biz, _ = _fetch_gnews("top-headlines", {"category": "business", "lang": "en", "max": 5})
    for a in biz:
        if a.get("url") and a["url"] not in seen_urls:
            seen_urls.add(a["url"])
            articles.append(_normalize_article(a, "business"))

    # 2. Technology headlines
    tech, _ = _fetch_gnews("top-headlines", {"category": "technology", "lang": "en", "max": 4})
    for a in tech:
        if a.get("url") and a["url"] not in seen_urls:
            seen_urls.add(a["url"])
            articles.append(_normalize_article(a, "technology"))

    # 3. World headlines
    world, _ = _fetch_gnews("top-headlines", {"category": "world", "lang": "en", "max": 4})
    for a in world:
        if a.get("url") and a["url"] not in seen_urls:
            seen_urls.add(a["url"])
            articles.append(_normalize_article(a, "world"))

    # 4. Science headlines
    science, _ = _fetch_gnews("top-headlines", {"category": "science", "lang": "en", "max": 4})
    for a in science:
        if a.get("url") and a["url"] not in seen_urls:
            seen_urls.add(a["url"])
            articles.append(_normalize_article(a, "science"))

    # 5. Health headlines
    health, _ = _fetch_gnews("top-headlines", {"category": "health", "lang": "en", "max": 4})
    for a in health:
        if a.get("url") and a["url"] not in seen_urls:
            seen_urls.add(a["url"])
            articles.append(_normalize_article(a, "health"))

    # 6. Entertainment headlines
    entertainment, _ = _fetch_gnews("top-headlines", {"category": "entertainment", "lang": "en", "max": 3})
    for a in entertainment:
        if a.get("url") and a["url"] not in seen_urls:
            seen_urls.add(a["url"])
            articles.append(_normalize_article(a, "entertainment"))

    # 7. Search for B2B / digital marketing relevance
    search_terms = ["B2B marketing", "digital marketing", "SaaS", "enterprise sales"]
    for q in search_terms[:2]:  # Limit to avoid rate limits
        search, _ = _fetch_gnews("search", {"q": q, "lang": "en", "max": 4})
        for a in search:
            if a.get("url") and a["url"] not in seen_urls:
                seen_urls.add(a["url"])
                articles.append(_normalize_article(a, "industry"))

    # Sort by publishedAt (newest first), limit to 24
    articles.sort(key=lambda x: x.get("publishedAt", ""), reverse=True)
    articles = articles[:24]

    return {
        "status": "success",
        "data": {
            "articles": articles,
            "total": len(articles),
            "error": gnews_error if not articles and gnews_error else None,
        },
    }
