from typing import Optional
import httpx
from pathlib import Path
import logging

class LocalCoverStorage():
    def __init__(self) -> None:
        self._logger = logging.getLogger(__name__)
        self._http = httpx.AsyncClient(timeout=10.0)

    async def save_cover_from_url(self, url: str, isbn: str) -> Optional[str]:
        if not url:
            self._logger.error("URL is empty for ISBN: %s", isbn)
            return None
            
        path = Path(__file__).parent.parent.parent.parent / "storage" / "covers"

        if not path.exists():
            path.mkdir(parents=True, exist_ok=True)
        
        file_path = path / f"{isbn}.jpg"
        try: 
            response = await self._http.get(url)
            response.raise_for_status()
            file_path.write_bytes(response.content)      
        except Exception:
            self._logger.exception("Failed to download cover for ISBN %s from %s", isbn, url)
            return None

        return f"storage/covers/{isbn}.jpg"  
