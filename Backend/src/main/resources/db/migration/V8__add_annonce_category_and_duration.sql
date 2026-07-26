ALTER TABLE annonces ADD COLUMN categorie VARCHAR(50);
ALTER TABLE annonces ADD COLUMN duree INTEGER;

-- Update existing records to default values
UPDATE annonces SET categorie = 'ETUDIANT', duree = 12 WHERE categorie IS NULL;
