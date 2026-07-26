CREATE TABLE alertes_logement (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    localisation VARCHAR(255),
    prix_max NUMERIC(38, 2),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT fk_alertes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE favoris (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    annonce_id BIGINT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT fk_favoris_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_favoris_annonce FOREIGN KEY (annonce_id) REFERENCES annonces (id) ON DELETE CASCADE,
    CONSTRAINT uk_favoris_user_annonce UNIQUE (user_id, annonce_id)
);
