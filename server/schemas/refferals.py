# schemas.py

from pydantic import BaseModel

class ReferralResponse(BaseModel):
    username: str
