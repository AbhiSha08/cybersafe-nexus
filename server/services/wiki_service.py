import httpx
from fastapi import HTTPException

async def fetch_wiki_intel(topic: str):
    """
    Fetches raw intelligence from Wikipedia for a specific security topic.
    """
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{topic.replace(' ', '_')}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Topic not found in global archives.")
        
        data = response.json()
        return {
            "title": data.get("title"),
            "summary": data.get("extract"),
            "source": "Wikipedia Intelligence Feed"
        }