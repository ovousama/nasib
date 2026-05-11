-- ============================================================
-- Nasib — Storage Buckets & Policies
-- Migration: 002_storage
-- ============================================================

-- brother-photos: public read
INSERT INTO storage.buckets (id, name, public)
VALUES ('brother-photos', 'brother-photos', true)
ON CONFLICT (id) DO NOTHING;

-- sister-photos: private
INSERT INTO storage.buckets (id, name, public)
VALUES ('sister-photos', 'sister-photos', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- brother-photos policies
-- File path convention: {userId}/{filename}
-- ============================================================

CREATE POLICY "brother-photos: public select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'brother-photos');

CREATE POLICY "brother-photos: owner insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'brother-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "brother-photos: owner update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'brother-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "brother-photos: owner delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'brother-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- sister-photos policies (private — no public URL access)
-- File path convention: {userId}/{filename}
-- ============================================================

CREATE POLICY "sister-photos: owner or admin select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'sister-photos'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR COALESCE((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
    )
  );

CREATE POLICY "sister-photos: owner insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'sister-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "sister-photos: owner update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'sister-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "sister-photos: owner delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'sister-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
