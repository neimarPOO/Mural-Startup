-- ============================================================
-- FORÇAR BUCKET MURAL_MEDIA A SER PÚBLICO E AJUSTAR POLICIES
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

-- 1. Forçar o bucket a ser público (caso tenha sido criado como privado)
UPDATE storage.buckets
SET public = true
WHERE id = 'mural_media';

-- Se por algum motivo o bucket não existia, cria como público
INSERT INTO storage.buckets (id, name, public)
VALUES ('mural_media', 'mural_media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Recriar políticas públicas de acesso no storage.objects
DROP POLICY IF EXISTS "mural_media_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "mural_media_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "mural_media_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "mural_media_delete_policy" ON storage.objects;

-- Criar políticas sem restrição de role para permitir acesso anônimo (anon key)
CREATE POLICY "mural_media_select_policy" ON storage.objects 
  FOR SELECT USING (bucket_id = 'mural_media');

CREATE POLICY "mural_media_insert_policy" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'mural_media');

CREATE POLICY "mural_media_update_policy" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'mural_media');

CREATE POLICY "mural_media_delete_policy" ON storage.objects 
  FOR DELETE USING (bucket_id = 'mural_media');
