CREATE TABLE IF NOT EXISTS itineraries (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    budget NUMERIC(12,2),
    currency VARCHAR(3) NOT NULL DEFAULT 'NPR',
    travel_style VARCHAR(50),
    status VARCHAR(30) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT itineraries_dates_valid CHECK (end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS itinerary_days (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    itinerary_id INTEGER NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    date TIMESTAMP NOT NULL,
    title VARCHAR(255) NOT NULL,
    estimated_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    UNIQUE(itinerary_id, day_number)
);

CREATE TABLE IF NOT EXISTS itinerary_items (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    day_id INTEGER NOT NULL REFERENCES itinerary_days(id) ON DELETE CASCADE,
    sequence INTEGER NOT NULL,
    start_time VARCHAR(10),
    end_time VARCHAR(10),
    item_type VARCHAR(30) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    estimated_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    entity_id INTEGER,
    location VARCHAR(255),
    UNIQUE(day_id, sequence)
);

CREATE INDEX IF NOT EXISTS idx_itineraries_user ON itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_days_itinerary ON itinerary_days(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_day ON itinerary_items(day_id);
