from pydantic import BaseModel, HttpUrl

class SearchRequest(BaseModel):
    query: str

class LinkRequest(BaseModel):
    url: HttpUrl