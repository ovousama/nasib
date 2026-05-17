-- ─────────────────────────────────────────────────────────────────────────────
-- Wali RLS Policies
-- Run this in the Supabase SQL Editor to allow wali users to read
-- all data belonging to their linked sister.
--
-- The wali_sister_id() function returns the sister's UUID by looking up
-- the current user's email in wali_profiles.
-- ─────────────────────────────────────────────────────────────────────────────

-- Helper function — returns the sister_id linked to the current wali user
CREATE OR REPLACE FUNCTION wali_sister_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT sister_id
  FROM wali_profiles
  WHERE email = (auth.jwt() ->> 'email')
  LIMIT 1;
$$;

-- ── matches ───────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "matches: select" ON matches;
CREATE POLICY "matches: select" ON matches FOR SELECT
  USING (
    is_admin()
    OR brother_id = auth.uid()
    OR sister_id = auth.uid()
    OR sister_id = wali_sister_id()
  );

-- ── interests ─────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "interests: select" ON interests;
CREATE POLICY "interests: select" ON interests FOR SELECT
  USING (
    is_admin()
    OR brother_id = auth.uid()
    OR sister_id = auth.uid()
    OR sister_id = wali_sister_id()
  );

-- ── connections ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "connections: select" ON connections;
CREATE POLICY "connections: select" ON connections FOR SELECT
  USING (
    is_admin()
    OR brother_id = auth.uid()
    OR sister_id = auth.uid()
    OR sister_id = wali_sister_id()
  );

-- ── messages ──────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "messages: select" ON messages;
CREATE POLICY "messages: select" ON messages FOR SELECT
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM connections c
      WHERE c.id = messages.connection_id
        AND (c.brother_id = auth.uid() OR c.sister_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM connections c
      WHERE c.id = messages.connection_id
        AND c.sister_id = wali_sister_id()
    )
  );

-- ── sister_profiles ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "sister_profiles: select" ON sister_profiles;
CREATE POLICY "sister_profiles: select" ON sister_profiles FOR SELECT
  USING (
    is_admin()
    OR auth.uid() = id
    OR id = wali_sister_id()
    OR EXISTS (
      SELECT 1 FROM connections c
      WHERE c.sister_id = sister_profiles.id
        AND c.brother_id = auth.uid()
        AND c.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM matches m
      WHERE m.sister_id = sister_profiles.id
        AND m.brother_id = auth.uid()
        AND m.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM interests i
      WHERE i.sister_id = sister_profiles.id
        AND i.brother_id = auth.uid()
        AND i.status = 'pending'
    )
  );

-- ── notifications ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "notifications: own select" ON notifications;
CREATE POLICY "notifications: own select" ON notifications FOR SELECT
  USING (
    profile_id = auth.uid()
    OR is_admin()
    OR profile_id = wali_sister_id()
  );

-- ── wali_profiles (allow wali to read their own row) ─────────────────────────

DROP POLICY IF EXISTS "wali_profiles: select own" ON wali_profiles;
CREATE POLICY "wali_profiles: select own" ON wali_profiles FOR SELECT
  USING (
    is_admin()
    OR email = (auth.jwt() ->> 'email')
    OR sister_id = auth.uid()
  );

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
