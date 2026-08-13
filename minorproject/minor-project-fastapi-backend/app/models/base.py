from datetime import datetime
from decimal import Decimal
from sqlalchemy import (
    Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, Float,
    UniqueConstraint, Enum as SAEnum, func
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import ENUM

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    password_hash: Mapped[str | None] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    is_verified: Mapped[bool | None] = mapped_column(Boolean, default=False)
    provider: Mapped[str | None] = mapped_column(ENUM("credentials", "google", name="provider", create_type=False), default="google")
    verify_code: Mapped[str | None] = mapped_column(String(10))
    verify_code_expiry: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    roles: Mapped[list["UserRole"]] = relationship(back_populates="user", cascade="all, delete-orphan")

class Role(Base):
    __tablename__ = "roles"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(ENUM("tourist", "hotelOwner", "restaurantOwner", "guide", "admin", name="role", create_type=False), unique=True)
    users: Mapped[list["UserRole"]] = relationship(back_populates="role")

class UserRole(Base):
    __tablename__ = "user_roles"
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True)
    approval_status: Mapped[str] = mapped_column(ENUM("pending", "approved", "rejected", "suspended", name="approval_status", create_type=False), default="pending")
    user: Mapped[User] = relationship(back_populates="roles")
    role: Mapped[Role] = relationship(back_populates="users")

class Hotel(Base):
    __tablename__ = "hotels"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    established_year: Mapped[int | None] = mapped_column("establishedYear", Integer)
    phone_number: Mapped[str] = mapped_column(String(255))
    website: Mapped[str | None] = mapped_column(String(255))
    province: Mapped[str] = mapped_column(String(100))
    district: Mapped[str] = mapped_column(String(100))
    municipality: Mapped[str] = mapped_column(String(100))
    ward: Mapped[str] = mapped_column(String(20))
    street: Mapped[str] = mapped_column(String(255))
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    cover_image_url: Mapped[str | None] = mapped_column(Text)
    cover_image_public_id: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime | None] = mapped_column("updated_at", DateTime)
    rooms: Mapped[list["Room"]] = relationship(back_populates="hotel", cascade="all, delete-orphan")

class Room(Base):
    __tablename__ = "rooms"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    hotel_id: Mapped[int] = mapped_column(ForeignKey("hotels.id", ondelete="CASCADE"))
    room_number: Mapped[str] = mapped_column(String(20))
    room_type: Mapped[str] = mapped_column(ENUM("single", "double", "twin", "family", "suite", name="room_type", create_type=False))
    description: Mapped[str] = mapped_column(Text)
    price_per_night: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    capacity: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(ENUM("available", "maintenance", "inactive", name="room_status", create_type=False), default="available")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    hotel: Mapped[Hotel] = relationship(back_populates="rooms")

class Restaurant(Base):
    __tablename__ = "restaurants"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    description: Mapped[str] = mapped_column(String(255))
    restaurant_image_url: Mapped[str] = mapped_column(String(255))
    location: Mapped[str] = mapped_column(String(255))
    phone_number: Mapped[str] = mapped_column(String(255))
    cuisine: Mapped[str] = mapped_column(String(255))
    menus: Mapped[list["Menu"]] = relationship(back_populates="restaurant", cascade="all, delete-orphan")

class Menu(Base):
    __tablename__ = "menus"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    restaurant_id: Mapped[int] = mapped_column(ForeignKey("restaurants.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(String(255))
    menus_image_url: Mapped[str] = mapped_column(String(255))
    price: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    restaurant: Mapped[Restaurant] = relationship(back_populates="menus")

class Guide(Base):
    __tablename__ = "guides"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    description: Mapped[str] = mapped_column(String(255))
    location: Mapped[str] = mapped_column(String(255))
    phone_number: Mapped[str] = mapped_column(String(255))
    guide_image_url: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

class Place(Base):
    __tablename__ = "places"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    location: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(String(255))
    place_image_url: Mapped[str] = mapped_column(String(255))
    map_url: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

class Expense(Base):
    __tablename__ = "expenses"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255))
    amount: Mapped[int] = mapped_column(Integer)
    location: Mapped[str] = mapped_column(String(255))
    type: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

class Itinerary(Base):
    __tablename__ = "itineraries"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    destination: Mapped[str] = mapped_column(String(255))
    start_date: Mapped[datetime] = mapped_column(DateTime)
    end_date: Mapped[datetime] = mapped_column(DateTime)
    budget: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3), default="NPR")
    travel_style: Mapped[str | None] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(30), default="draft")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    days: Mapped[list["ItineraryDay"]] = relationship(back_populates="itinerary", cascade="all, delete-orphan")

class ItineraryDay(Base):
    __tablename__ = "itinerary_days"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    itinerary_id: Mapped[int] = mapped_column(ForeignKey("itineraries.id", ondelete="CASCADE"))
    day_number: Mapped[int] = mapped_column(Integer)
    date: Mapped[datetime] = mapped_column(DateTime)
    title: Mapped[str] = mapped_column(String(255))
    estimated_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    itinerary: Mapped[Itinerary] = relationship(back_populates="days")
    items: Mapped[list["ItineraryItem"]] = relationship(back_populates="day", cascade="all, delete-orphan")

class ItineraryItem(Base):
    __tablename__ = "itinerary_items"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    day_id: Mapped[int] = mapped_column(ForeignKey("itinerary_days.id", ondelete="CASCADE"))
    sequence: Mapped[int] = mapped_column(Integer)
    start_time: Mapped[str | None] = mapped_column(String(10))
    end_time: Mapped[str | None] = mapped_column(String(10))
    item_type: Mapped[str] = mapped_column(String(30))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    estimated_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    entity_id: Mapped[int | None] = mapped_column(Integer)
    location: Mapped[str | None] = mapped_column(String(255))
    day: Mapped[ItineraryDay] = relationship(back_populates="items")
