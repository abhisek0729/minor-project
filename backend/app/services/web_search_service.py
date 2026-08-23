import os
import re
import httpx
from urllib.parse import quote_plus

class WebSearchService:
    def __init__(self):
        self.tavily_api_key = os.getenv("TAVILY_API_KEY")

    async def search(self, query: str, max_results: int = 4) -> list[dict]:
        """Performs a web search using Tavily (if configured) or DuckDuckGo as fallback."""
        if not query or not query.strip():
            return []

        # 1. Try Tavily Search API if key is set
        if self.tavily_api_key:
            try:
                async with httpx.AsyncClient(timeout=6.0) as client:
                    resp = await client.post(
                        "https://api.tavily.com/search",
                        json={
                            "api_key": self.tavily_api_key,
                            "query": f"{query} Nepal tourism",
                            "max_results": max_results,
                            "search_depth": "basic",
                        },
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        results = []
                        for item in data.get("results", []):
                            results.append({
                                "title": item.get("title", "Web Result"),
                                "snippet": item.get("content", ""),
                                "url": item.get("url", ""),
                            })
                        if results:
                            return results
            except Exception as e:
                print("Tavily Search error:", e)

        # 2. DuckDuckGo Search API fallback
        try:
            url = f"https://api.duckduckgo.com/?q={quote_plus(query + ' Nepal')}&format=json&no_html=1&skip_disambig=1"
            async with httpx.AsyncClient(timeout=6.0, follow_redirects=True) as client:
                resp = await client.get(url, headers={"User-Agent": "TravelNepal-AI/1.0"})
                if resp.status_code == 200:
                    data = resp.json()
                    results = []
                    
                    # Abstract
                    if data.get("AbstractText"):
                        results.append({
                            "title": data.get("Heading") or query.title(),
                            "snippet": data.get("AbstractText"),
                            "url": data.get("AbstractURL") or f"https://duckduckgo.com/?q={quote_plus(query)}",
                        })

                    # Related Topics
                    for topic in data.get("RelatedTopics", [])[:max_results]:
                        if isinstance(topic, dict) and topic.get("Text"):
                            results.append({
                                "title": topic.get("Text").split(" - ")[0] if " - " in topic.get("Text") else "Travel Insight",
                                "snippet": topic.get("Text"),
                                "url": topic.get("FirstURL") or f"https://duckduckgo.com/?q={quote_plus(query)}",
                            })

                    if results:
                        return results
        except Exception as e:
            print("DuckDuckGo Search error:", e)

        # 3. Final lightweight DuckDuckGo Lite HTML Scrape
        try:
            lite_url = f"https://lite.duckduckgo.com/lite/"
            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.post(
                    lite_url,
                    data={"q": f"{query} Nepal tourism"},
                    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"},
                )
                if resp.status_code == 200:
                    html = resp.text
                    snippets = re.findall(r'<td class="result-snippet">\s*(.*?)\s*</td>', html, re.DOTALL)
                    links = re.findall(r'<a class="result-link" href="([^"]+)">\s*(.*?)\s*</a>', html, re.DOTALL)
                    
                    results = []
                    for i in range(min(len(snippets), max_results)):
                        clean_snippet = re.sub(r"<[^>]+>", "", snippets[i]).strip()
                        title = re.sub(r"<[^>]+>", "", links[i][1]).strip() if i < len(links) else query.title()
                        link = links[i][0] if i < len(links) else f"https://duckduckgo.com/?q={quote_plus(query)}"
                        if clean_snippet:
                            results.append({
                                "title": title,
                                "snippet": clean_snippet,
                                "url": link,
                            })
                    if results:
                        return results
        except Exception as e:
            print("DuckDuckGo Lite fallback error:", e)

        return []
