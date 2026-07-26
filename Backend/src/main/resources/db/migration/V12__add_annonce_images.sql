CREATE TABLE annonce_images (
    annonce_id BIGINT NOT NULL,
    image_url TEXT,
    CONSTRAINT fk_annonce_images_annonce_id FOREIGN KEY (annonce_id) REFERENCES annonces (id) ON DELETE CASCADE
);
