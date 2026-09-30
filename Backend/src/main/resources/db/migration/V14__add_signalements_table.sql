CREATE TABLE IF NOT EXISTS signalements (
    id BIGSERIAL PRIMARY KEY,
    annonce_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    
    CONSTRAINT fk_signalement_annonce
      FOREIGN KEY(annonce_id) 
	  REFERENCES annonces(id)
	  ON DELETE CASCADE,
	  
    CONSTRAINT fk_signalement_user
      FOREIGN KEY(user_id) 
	  REFERENCES users(id)
	  ON DELETE CASCADE
);
