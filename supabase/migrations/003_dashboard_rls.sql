-- ============================================================
-- Nasib — Migration 003: Dashboard RLS additions
-- ============================================================
-- Grants users visibility into match/interest/connection
-- participants so dashboard cards can display profile data.
-- ============================================================

-- Allow users to read the profile row (for verification_badge)
-- of anyone they share a match, interest, or active connection with.
CREATE POLICY "profiles: participant view" ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.status = 'active'
        AND (
          (m.brother_id = profiles.id AND m.sister_id  = auth.uid())
          OR (m.sister_id  = profiles.id AND m.brother_id = auth.uid())
        )
    )
    OR EXISTS (
      SELECT 1 FROM interests i
      WHERE (
          (i.brother_id = profiles.id AND i.sister_id  = auth.uid())
          OR (i.sister_id  = profiles.id AND i.brother_id = auth.uid())
      )
    )
    OR EXISTS (
      SELECT 1 FROM connections c
      WHERE c.status = 'active'
        AND (
          (c.brother_id = profiles.id AND c.sister_id  = auth.uid())
          OR (c.sister_id  = profiles.id AND c.brother_id = auth.uid())
        )
    )
  );

-- Brothers can see sister profile info for their active matches
CREATE POLICY "sister_profiles: brother match view" ON sister_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.sister_id  = sister_profiles.id
        AND m.brother_id = auth.uid()
        AND m.status     = 'active'
    )
  );

-- Brothers can see sister profile info for interests they sent
CREATE POLICY "sister_profiles: brother interest view" ON sister_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM interests i
      WHERE i.sister_id  = sister_profiles.id
        AND i.brother_id = auth.uid()
    )
  );

-- Sisters can see brother profile info for their active matches
CREATE POLICY "brother_profiles: sister match view" ON brother_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.brother_id = brother_profiles.id
        AND m.sister_id  = auth.uid()
        AND m.status     = 'active'
    )
  );

-- Sisters can see brother profile info for pending/historical interests
CREATE POLICY "brother_profiles: sister interest view" ON brother_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM interests i
      WHERE i.brother_id = brother_profiles.id
        AND i.sister_id  = auth.uid()
    )
  );
