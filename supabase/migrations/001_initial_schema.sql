-- ============================================================
-- Nasib — Islamic Matrimonial Platform
-- Migration: 001_initial_schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Enums
-- ============================================================

CREATE TYPE gender_type            AS ENUM ('brother', 'sister');
CREATE TYPE profile_status_type    AS ENUM ('pending_verification', 'verified', 'active', 'inactive');
CREATE TYPE religiosity_type       AS ENUM ('practicing', 'moderately_practicing', 'learning');
CREATE TYPE contact_method_type    AS ENUM ('phone', 'email', 'whatsapp');
CREATE TYPE reference_status_type  AS ENUM ('pending', 'completed');
CREATE TYPE match_status_type      AS ENUM ('active', 'expired');
CREATE TYPE interest_status_type   AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE connection_status_type AS ENUM ('active', 'closed');
CREATE TYPE meeting_format_type    AS ENUM ('virtual', 'in_person');
CREATE TYPE meeting_status_type    AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE checkin_outcome_type   AS ENUM ('continue', 'nikah_planning', 'close');

-- ============================================================
-- Tables
-- ============================================================

-- 1. profiles
CREATE TABLE profiles (
  id                 UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gender             gender_type          NOT NULL,
  status             profile_status_type  NOT NULL DEFAULT 'pending_verification',
  verification_badge BOOLEAN              NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ          NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ          NOT NULL DEFAULT now()
);

-- 2. brother_profiles
CREATE TABLE brother_profiles (
  id                           UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  full_name                    TEXT        NOT NULL,
  age                          INTEGER     NOT NULL CHECK (age >= 18),
  location                     TEXT,
  ethnicity                    TEXT,
  languages                    TEXT[],
  religiosity_level            religiosity_type,
  madhab                       TEXT,
  prayer_frequency             TEXT,
  islamic_knowledge_level      TEXT,
  has_beard                    BOOLEAN,
  occupation                   TEXT,
  education_level              TEXT,
  living_situation             TEXT,
  willing_to_relocate          BOOLEAN,
  financial_readiness          TEXT,
  polygamy_openness            BOOLEAN,
  previously_married           BOOLEAN,
  has_children                 BOOLEAN,
  wants_children               BOOLEAN,
  timeline_to_marry            TEXT,
  spouse_religiosity_preference TEXT,
  spouse_age_min               INTEGER,
  spouse_age_max               INTEGER,
  dealbreakers                 TEXT[],
  character_description        TEXT,
  goals                        TEXT,
  photo_url                    TEXT,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. sister_profiles
CREATE TABLE sister_profiles (
  id                           UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  full_name                    TEXT        NOT NULL,
  age                          INTEGER     NOT NULL CHECK (age >= 18),
  location                     TEXT,
  ethnicity                    TEXT,
  languages                    TEXT[],
  religiosity_level            religiosity_type,
  madhab                       TEXT,
  prayer_frequency             TEXT,
  islamic_knowledge_level      TEXT,
  wears_hijab                  TEXT,
  occupation                   TEXT,
  education_level              TEXT,
  living_situation             TEXT,
  willing_to_relocate          BOOLEAN,
  previously_married           BOOLEAN,
  has_children                 BOOLEAN,
  wants_children               BOOLEAN,
  timeline_to_marry            TEXT,
  spouse_religiosity_preference TEXT,
  spouse_age_min               INTEGER,
  spouse_age_max               INTEGER,
  dealbreakers                 TEXT[],
  character_description        TEXT,
  goals                        TEXT,
  photo_urls                   TEXT[],
  photos_uploaded              BOOLEAN     NOT NULL DEFAULT false,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT photo_urls_max_5 CHECK (array_length(photo_urls, 1) IS NULL OR array_length(photo_urls, 1) <= 5)
);

-- 4. wali_profiles
CREATE TABLE wali_profiles (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sister_id                UUID                 NOT NULL REFERENCES sister_profiles(id) ON DELETE CASCADE,
  full_name                TEXT                 NOT NULL,
  relationship             TEXT                 NOT NULL,
  phone                    TEXT,
  email                    TEXT,
  preferred_contact_method contact_method_type  NOT NULL DEFAULT 'email',
  notified_at              TIMESTAMPTZ,
  created_at               TIMESTAMPTZ          NOT NULL DEFAULT now()
);

-- 5. references (quoted — reserved keyword)
CREATE TABLE "references" (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id                  UUID                  NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referee_name                TEXT                  NOT NULL,
  referee_relationship        TEXT,
  referee_email               TEXT,
  referee_phone               TEXT,
  questionnaire_sent_at       TIMESTAMPTZ,
  questionnaire_completed_at  TIMESTAMPTZ,
  how_long_known              TEXT,
  character_description       TEXT,
  islamic_practice_description TEXT,
  ready_for_marriage          BOOLEAN,
  ready_for_marriage_comment  TEXT,
  would_recommend             BOOLEAN,
  additional_notes            TEXT,
  status                      reference_status_type NOT NULL DEFAULT 'pending',
  created_at                  TIMESTAMPTZ           NOT NULL DEFAULT now()
);

-- 6. matches
CREATE TABLE matches (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brother_id         UUID                NOT NULL REFERENCES brother_profiles(id) ON DELETE CASCADE,
  sister_id          UUID                NOT NULL REFERENCES sister_profiles(id)  ON DELETE CASCADE,
  assigned_by_admin  UUID                REFERENCES auth.users(id),
  compatibility_note TEXT,
  status             match_status_type   NOT NULL DEFAULT 'active',
  created_at         TIMESTAMPTZ         NOT NULL DEFAULT now()
);

-- 7. interests
CREATE TABLE interests (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brother_id    UUID                  NOT NULL REFERENCES brother_profiles(id) ON DELETE CASCADE,
  sister_id     UUID                  NOT NULL REFERENCES sister_profiles(id)  ON DELETE CASCADE,
  intro_message TEXT,
  status        interest_status_type  NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ           NOT NULL DEFAULT now(),
  responded_at  TIMESTAMPTZ
);

-- 8. connections
CREATE TABLE connections (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brother_id         UUID                   NOT NULL REFERENCES brother_profiles(id) ON DELETE CASCADE,
  sister_id          UUID                   NOT NULL REFERENCES sister_profiles(id)  ON DELETE CASCADE,
  interest_id        UUID                   REFERENCES interests(id),
  status             connection_status_type NOT NULL DEFAULT 'active',
  photos_released    BOOLEAN                NOT NULL DEFAULT false,
  photos_released_at TIMESTAMPTZ,
  photos_revoked_at  TIMESTAMPTZ,
  created_at         TIMESTAMPTZ            NOT NULL DEFAULT now(),
  closed_at          TIMESTAMPTZ
);

-- 9. messages
CREATE TABLE messages (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id        UUID        NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  sender_id            UUID        NOT NULL REFERENCES profiles(id)    ON DELETE CASCADE,
  content              TEXT        NOT NULL,
  is_suggested_question BOOLEAN    NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. meeting_requests
CREATE TABLE meeting_requests (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id    UUID                 NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  requested_by     UUID                 NOT NULL REFERENCES profiles(id),
  format           meeting_format_type  NOT NULL,
  slot_1           TIMESTAMPTZ,
  slot_2           TIMESTAMPTZ,
  slot_3           TIMESTAMPTZ,
  confirmed_slot   TIMESTAMPTZ,
  location_or_link TEXT,
  status           meeting_status_type  NOT NULL DEFAULT 'pending',
  wali_notified    BOOLEAN              NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ          NOT NULL DEFAULT now(),
  confirmed_at     TIMESTAMPTZ
);

-- 11. post_meeting_checkins
CREATE TABLE post_meeting_checkins (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID                  NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  profile_id    UUID                  NOT NULL REFERENCES profiles(id),
  outcome       checkin_outcome_type  NOT NULL,
  notes         TEXT,
  created_at    TIMESTAMPTZ           NOT NULL DEFAULT now()
);

-- 12. notifications
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL,
  title      TEXT        NOT NULL,
  body       TEXT        NOT NULL,
  read       BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Helper Functions (defined after tables they reference)
-- ============================================================

-- Admin check: role stored in app_metadata (only writeable by service role)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- Returns the sister_id linked to the currently authenticated wali (matched by email)
CREATE OR REPLACE FUNCTION wali_sister_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT sister_id
  FROM wali_profiles
  WHERE email = (auth.jwt() ->> 'email')
  LIMIT 1;
$$;

-- ============================================================
-- updated_at Trigger
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_brother_profiles_updated_at
  BEFORE UPDATE ON brother_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sister_profiles_updated_at
  BEFORE UPDATE ON sister_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE brother_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sister_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE wali_profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "references"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches               ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests             ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections           ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_requests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_meeting_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications         ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies
-- ============================================================

-- profiles ---------------------------------------------------
CREATE POLICY "profiles: own select" ON profiles FOR SELECT
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "profiles: own insert" ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR is_admin());

CREATE POLICY "profiles: own update" ON profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "profiles: admin delete" ON profiles FOR DELETE
  USING (is_admin());

-- brother_profiles -------------------------------------------
CREATE POLICY "brother_profiles: select" ON brother_profiles FOR SELECT
  USING (
    is_admin()
    OR auth.uid() = id
    -- sister in an active connection can see this brother's profile
    OR EXISTS (
      SELECT 1 FROM connections c
      WHERE c.brother_id = brother_profiles.id
        AND c.sister_id  = auth.uid()
        AND c.status     = 'active'
    )
  );

CREATE POLICY "brother_profiles: own insert" ON brother_profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR is_admin());

CREATE POLICY "brother_profiles: own update" ON brother_profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "brother_profiles: admin delete" ON brother_profiles FOR DELETE
  USING (is_admin());

-- sister_profiles --------------------------------------------
CREATE POLICY "sister_profiles: select" ON sister_profiles FOR SELECT
  USING (
    is_admin()
    OR auth.uid() = id
    -- wali can view their linked sister's profile
    OR sister_profiles.id = wali_sister_id()
    -- brother in an active connection can see this sister's profile
    OR EXISTS (
      SELECT 1 FROM connections c
      WHERE c.sister_id  = sister_profiles.id
        AND c.brother_id = auth.uid()
        AND c.status     = 'active'
    )
  );

CREATE POLICY "sister_profiles: own insert" ON sister_profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR is_admin());

CREATE POLICY "sister_profiles: own update" ON sister_profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "sister_profiles: admin delete" ON sister_profiles FOR DELETE
  USING (is_admin());

-- wali_profiles ----------------------------------------------
CREATE POLICY "wali_profiles: select" ON wali_profiles FOR SELECT
  USING (
    is_admin()
    OR sister_id = auth.uid()                        -- sister views her own wali
    OR email = (auth.jwt() ->> 'email')              -- wali views their own record
  );

CREATE POLICY "wali_profiles: sister insert" ON wali_profiles FOR INSERT
  WITH CHECK (sister_id = auth.uid() OR is_admin());

CREATE POLICY "wali_profiles: sister update" ON wali_profiles FOR UPDATE
  USING (sister_id = auth.uid() OR is_admin());

CREATE POLICY "wali_profiles: sister delete" ON wali_profiles FOR DELETE
  USING (sister_id = auth.uid() OR is_admin());

-- references -------------------------------------------------
CREATE POLICY "references: own select" ON "references" FOR SELECT
  USING (
    profile_id = auth.uid()
    OR is_admin()
    OR EXISTS (
      SELECT 1 FROM connections c
      WHERE c.status = 'active'
        AND (
          (c.brother_id = auth.uid() AND c.sister_id = profile_id)
          OR (c.sister_id = auth.uid() AND c.brother_id = profile_id)
        )
    )
  );

CREATE POLICY "references: own insert" ON "references" FOR INSERT
  WITH CHECK (profile_id = auth.uid() OR is_admin());

CREATE POLICY "references: own update" ON "references" FOR UPDATE
  USING (profile_id = auth.uid() OR is_admin());

CREATE POLICY "references: admin delete" ON "references" FOR DELETE
  USING (is_admin());

-- matches ----------------------------------------------------
CREATE POLICY "matches: select" ON matches FOR SELECT
  USING (
    is_admin()
    OR brother_id = auth.uid()
    OR sister_id  = auth.uid()
    OR sister_id  = wali_sister_id()   -- wali read-only
  );

CREATE POLICY "matches: admin insert" ON matches FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "matches: admin update" ON matches FOR UPDATE
  USING (is_admin());

CREATE POLICY "matches: admin delete" ON matches FOR DELETE
  USING (is_admin());

-- interests --------------------------------------------------
CREATE POLICY "interests: select" ON interests FOR SELECT
  USING (
    is_admin()
    OR brother_id = auth.uid()
    OR sister_id  = auth.uid()
    OR sister_id  = wali_sister_id()   -- wali read-only
  );

CREATE POLICY "interests: brother insert" ON interests FOR INSERT
  WITH CHECK (brother_id = auth.uid() OR is_admin());

-- Sister accepts or declines; admin can update anything
CREATE POLICY "interests: sister/admin update" ON interests FOR UPDATE
  USING (sister_id = auth.uid() OR is_admin());

CREATE POLICY "interests: admin delete" ON interests FOR DELETE
  USING (is_admin());

-- connections ------------------------------------------------
CREATE POLICY "connections: select" ON connections FOR SELECT
  USING (
    is_admin()
    OR brother_id = auth.uid()
    OR sister_id  = auth.uid()
    OR sister_id  = wali_sister_id()   -- wali read-only
  );

CREATE POLICY "connections: admin insert" ON connections FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "connections: participant/admin update" ON connections FOR UPDATE
  USING (
    is_admin()
    OR brother_id = auth.uid()
    OR sister_id  = auth.uid()
  );

CREATE POLICY "connections: admin delete" ON connections FOR DELETE
  USING (is_admin());

-- messages ---------------------------------------------------
CREATE POLICY "messages: select" ON messages FOR SELECT
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM connections c
      WHERE c.id = messages.connection_id
        AND (c.brother_id = auth.uid() OR c.sister_id = auth.uid())
    )
    -- wali read-only for their sister's connections
    OR EXISTS (
      SELECT 1 FROM connections c
      WHERE c.id        = messages.connection_id
        AND c.sister_id = wali_sister_id()
    )
  );

CREATE POLICY "messages: participant insert" ON messages FOR INSERT
  WITH CHECK (
    is_admin()
    OR (
      sender_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM connections c
        WHERE c.id     = connection_id
          AND (c.brother_id = auth.uid() OR c.sister_id = auth.uid())
          AND c.status = 'active'
      )
    )
  );

CREATE POLICY "messages: admin delete" ON messages FOR DELETE
  USING (is_admin());

-- meeting_requests -------------------------------------------
CREATE POLICY "meeting_requests: select" ON meeting_requests FOR SELECT
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM connections c
      WHERE c.id = meeting_requests.connection_id
        AND (c.brother_id = auth.uid() OR c.sister_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM connections c
      WHERE c.id = meeting_requests.connection_id
        AND c.sister_id = wali_sister_id()
    )
  );

CREATE POLICY "meeting_requests: participant insert" ON meeting_requests FOR INSERT
  WITH CHECK (
    is_admin()
    OR (
      requested_by = auth.uid()
      AND EXISTS (
        SELECT 1 FROM connections c
        WHERE c.id     = connection_id
          AND (c.brother_id = auth.uid() OR c.sister_id = auth.uid())
          AND c.status = 'active'
      )
    )
  );

CREATE POLICY "meeting_requests: participant/admin update" ON meeting_requests FOR UPDATE
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM connections c
      WHERE c.id = meeting_requests.connection_id
        AND (c.brother_id = auth.uid() OR c.sister_id = auth.uid())
    )
  );

CREATE POLICY "meeting_requests: admin delete" ON meeting_requests FOR DELETE
  USING (is_admin());

-- post_meeting_checkins --------------------------------------
CREATE POLICY "checkins: own select" ON post_meeting_checkins FOR SELECT
  USING (profile_id = auth.uid() OR is_admin());

CREATE POLICY "checkins: participant insert" ON post_meeting_checkins FOR INSERT
  WITH CHECK (
    is_admin()
    OR (
      profile_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM connections c
        WHERE c.id = connection_id
          AND (c.brother_id = auth.uid() OR c.sister_id = auth.uid())
      )
    )
  );

CREATE POLICY "checkins: admin delete" ON post_meeting_checkins FOR DELETE
  USING (is_admin());

-- notifications ----------------------------------------------
CREATE POLICY "notifications: own select" ON notifications FOR SELECT
  USING (profile_id = auth.uid() OR is_admin());

CREATE POLICY "notifications: own update" ON notifications FOR UPDATE
  USING (profile_id = auth.uid() OR is_admin());

CREATE POLICY "notifications: admin insert" ON notifications FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "notifications: admin delete" ON notifications FOR DELETE
  USING (is_admin());
