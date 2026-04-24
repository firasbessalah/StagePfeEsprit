CREATE TABLE password_reset_tokens (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code                VARCHAR(6),
    code_expires_at     TIMESTAMP,
    session_token       VARCHAR(255) UNIQUE,
    session_expires_at  TIMESTAMP
);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_session ON password_reset_tokens(session_token);
