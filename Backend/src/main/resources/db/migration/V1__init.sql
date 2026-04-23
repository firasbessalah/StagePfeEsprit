CREATE TABLE users (
                       id           BIGSERIAL PRIMARY KEY,
                       nom          VARCHAR(100) NOT NULL,
                       prenom       VARCHAR(100) NOT NULL,
                       email        VARCHAR(150) NOT NULL UNIQUE,
                       password     VARCHAR(255) NOT NULL,
                       telephone    VARCHAR(20),
                       photo_profil VARCHAR(255),
                       role         VARCHAR(20) NOT NULL DEFAULT 'ETUDIANT'
);

CREATE TABLE annonces (
                          id                  BIGSERIAL PRIMARY KEY,
                          titre               VARCHAR(200) NOT NULL,
                          description         TEXT,
                          prix                NUMERIC(10,2),
                          localisation        VARCHAR(255),
                          latitude            DOUBLE PRECISION,
                          longitude           DOUBLE PRECISION,
                          disponibilite_debut DATE,
                          disponibilite_fin   DATE,
                          statut              VARCHAR(20) DEFAULT 'EN_ATTENTE',
                          created_at          TIMESTAMP DEFAULT NOW(),
                          user_id             BIGINT REFERENCES users(id)
);

CREATE TABLE logements (
                           id          BIGSERIAL PRIMARY KEY,
                           nb_chambres INTEGER,
                           superficie  DOUBLE PRECISION,
                           description TEXT,
                           duree_min   INTEGER,
                           duree_max   INTEGER,
                           annonce_id  BIGINT REFERENCES annonces(id)
);

CREATE TABLE reservations (
                              id          BIGSERIAL PRIMARY KEY,
                              date_debut  DATE,
                              date_fin    DATE,
                              message     TEXT,
                              prix_total  NUMERIC(10,2),
                              statut      VARCHAR(20) DEFAULT 'EN_ATTENTE',
                              created_at  TIMESTAMP DEFAULT NOW(),
                              user_id     BIGINT REFERENCES users(id),
                              annonce_id  BIGINT REFERENCES annonces(id)
);

CREATE TABLE avis (
                      id          BIGSERIAL PRIMARY KEY,
                      note        INTEGER CHECK (note BETWEEN 1 AND 5),
                      commentaire TEXT,
                      is_modere   BOOLEAN DEFAULT FALSE,
                      created_at  TIMESTAMP DEFAULT NOW(),
                      user_id     BIGINT REFERENCES users(id),
                      annonce_id  BIGINT REFERENCES annonces(id)
);

CREATE TABLE messages (
                          id               BIGSERIAL PRIMARY KEY,
                          contenu          TEXT,
                          is_lu            BOOLEAN DEFAULT FALSE,
                          is_modere        BOOLEAN DEFAULT FALSE,
                          created_at       TIMESTAMP DEFAULT NOW(),
                          expediteur_id    BIGINT REFERENCES users(id),
                          destinataire_id  BIGINT REFERENCES users(id)
);

CREATE TABLE notifications (
                               id         BIGSERIAL PRIMARY KEY,
                               titre      VARCHAR(200),
                               message    TEXT,
                               is_lu      BOOLEAN DEFAULT FALSE,
                               type       VARCHAR(20),
                               created_at TIMESTAMP DEFAULT NOW(),
                               user_id    BIGINT REFERENCES users(id)
);