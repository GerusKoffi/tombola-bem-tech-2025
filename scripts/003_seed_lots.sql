-- Create lots table for prizes
CREATE TABLE IF NOT EXISTS public.lots (
  id SERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  numero INTEGER NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anyone can view lots" ON public.lots;

-- Everyone can view lots
CREATE POLICY "Anyone can view lots"
  ON public.lots FOR SELECT
  TO public
  USING (true);

-- Supprimer les lots existants
DELETE FROM lots;

-- Insérer les nouveaux lots
INSERT INTO lots (numero, nom, icon) VALUES
(1, 'Airpods', '🎧'),
(2, 'Bons d''achats Librairie de France', '📚'),
(3, 'Abonnement SnapChat+', '👻'),
(4, 'Abonnement Spotify', '🎵'),
(5, 'Paquet pour fille (Gloss et autres)', '💄');

-- Mettre à jour les séquences si nécessaire
SELECT setval('lots_id_seq', (SELECT MAX(id) FROM lots));
