from pydantic import BaseModel, EmailStr, Field
from app.schemas.common import ORMModel

class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RoleRequest(BaseModel):
    role: str

class UserOut(ORMModel):
    id: int
    name: str
    email: str
    is_verified: bool | None = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
