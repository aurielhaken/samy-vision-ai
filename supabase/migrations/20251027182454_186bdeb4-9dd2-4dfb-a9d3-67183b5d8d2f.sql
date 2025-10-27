-- Modifier les politiques RLS pour permettre un accès public temporaire
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view their own memory entries" ON public.memory_entries;
DROP POLICY IF EXISTS "Users can insert their own memory entries" ON public.memory_entries;
DROP POLICY IF EXISTS "Users can delete their own memory entries" ON public.memory_entries;

-- Créer des politiques publiques pour les tests
-- Permettre à tout le monde de voir les entrées sans user_id (publiques)
CREATE POLICY "Public entries are viewable by everyone"
  ON public.memory_entries
  FOR SELECT
  USING (user_id IS NULL);

-- Permettre à tout le monde d'insérer des entrées sans user_id
CREATE POLICY "Anyone can insert public entries"
  ON public.memory_entries
  FOR INSERT
  WITH CHECK (user_id IS NULL);

-- Permettre à tout le monde de supprimer des entrées sans user_id
CREATE POLICY "Anyone can delete public entries"
  ON public.memory_entries
  FOR DELETE
  USING (user_id IS NULL);