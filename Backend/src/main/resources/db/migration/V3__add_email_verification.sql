-- Add enabled column to users table (default false for new registrations)
ALTER TABLE users ADD COLUMN enabled BOOLEAN NOT NULL DEFAULT true;

-- Create verification_tokens table
CREATE TABLE verification_tokens (
    id          BIGSERIAL PRIMARY KEY,
    token       VARCHAR(255) NOT NULL UNIQUE,
    user_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expiry_date TIMESTAMP    NOT NULL
);

CREATE INDEX idx_verification_tokens_token ON verification_tokens(token);
