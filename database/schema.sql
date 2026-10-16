CREATE TABLE IF NOT EXISTS appointments (
 id text PRIMARY KEY,
 owner_id text NOT NULL,
 name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 80),
 phone text NOT NULL,
 service text NOT NULL,
 date date NOT NULL,
 time text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','cancelled')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS appointments_owner ON appointments(owner_id);
CREATE INDEX IF NOT EXISTS appointments_date ON appointments(date);
CREATE UNIQUE INDEX IF NOT EXISTS appointments_confirmed_slot ON appointments(date,time) WHERE status='confirmed';
CREATE TABLE IF NOT EXISTS rate_limits (key text PRIMARY KEY,count integer NOT NULL,reset_at timestamptz NOT NULL);
