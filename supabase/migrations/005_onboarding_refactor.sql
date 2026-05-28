-- Migration: onboarding refactor (PART 9)
-- Adds new columns and converts boolean fields to text on brother_profiles and sister_profiles.
-- Safe to run repeatedly (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).

-- ─── 1. Add new columns to brother_profiles ───────────────────────────────────

ALTER TABLE public.brother_profiles
  ADD COLUMN IF NOT EXISTS smoking               TEXT,
  ADD COLUMN IF NOT EXISTS strict_halal_diet     TEXT,
  ADD COLUMN IF NOT EXISTS conflict_style        TEXT,
  ADD COLUMN IF NOT EXISTS love_language         TEXT[],
  ADD COLUMN IF NOT EXISTS introvert_extrovert   TEXT,
  ADD COLUMN IF NOT EXISTS do_you_listen_to_music TEXT;

-- ─── 2. Add new columns to sister_profiles ────────────────────────────────────

ALTER TABLE public.sister_profiles
  ADD COLUMN IF NOT EXISTS smoking               TEXT,
  ADD COLUMN IF NOT EXISTS strict_halal_diet     TEXT,
  ADD COLUMN IF NOT EXISTS conflict_style        TEXT,
  ADD COLUMN IF NOT EXISTS love_language         TEXT[],
  ADD COLUMN IF NOT EXISTS introvert_extrovert   TEXT,
  ADD COLUMN IF NOT EXISTS do_you_listen_to_music TEXT;

-- ─── 3. Convert boolean → text on brother_profiles ───────────────────────────
-- We preserve existing boolean values as 'yes'/'no' strings.

DO $$
BEGIN
  -- willing_to_relocate
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'brother_profiles'
      AND column_name = 'willing_to_relocate'
      AND data_type = 'boolean'
  ) THEN
    ALTER TABLE public.brother_profiles
      ALTER COLUMN willing_to_relocate TYPE TEXT
      USING CASE
        WHEN willing_to_relocate IS TRUE  THEN 'yes'
        WHEN willing_to_relocate IS FALSE THEN 'no'
        ELSE NULL
      END;
  END IF;

  -- wants_children
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'brother_profiles'
      AND column_name = 'wants_children'
      AND data_type = 'boolean'
  ) THEN
    ALTER TABLE public.brother_profiles
      ALTER COLUMN wants_children TYPE TEXT
      USING CASE
        WHEN wants_children IS TRUE  THEN 'yes'
        WHEN wants_children IS FALSE THEN 'no'
        ELSE NULL
      END;
  END IF;

  -- previously_married
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'brother_profiles'
      AND column_name = 'previously_married'
      AND data_type = 'boolean'
  ) THEN
    ALTER TABLE public.brother_profiles
      ALTER COLUMN previously_married TYPE TEXT
      USING CASE
        WHEN previously_married IS TRUE  THEN 'yes'
        WHEN previously_married IS FALSE THEN 'no'
        ELSE NULL
      END;
  END IF;

  -- has_children
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'brother_profiles'
      AND column_name = 'has_children'
      AND data_type = 'boolean'
  ) THEN
    ALTER TABLE public.brother_profiles
      ALTER COLUMN has_children TYPE TEXT
      USING CASE
        WHEN has_children IS TRUE  THEN 'yes'
        WHEN has_children IS FALSE THEN 'no'
        ELSE NULL
      END;
  END IF;

  -- polygamy_openness
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'brother_profiles'
      AND column_name = 'polygamy_openness'
      AND data_type = 'boolean'
  ) THEN
    ALTER TABLE public.brother_profiles
      ALTER COLUMN polygamy_openness TYPE TEXT
      USING CASE
        WHEN polygamy_openness IS TRUE  THEN 'open'
        WHEN polygamy_openness IS FALSE THEN 'not_for_me'
        ELSE NULL
      END;
  END IF;
END $$;

-- ─── 4. Convert boolean → text on sister_profiles ────────────────────────────

DO $$
BEGIN
  -- willing_to_relocate
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'sister_profiles'
      AND column_name = 'willing_to_relocate'
      AND data_type = 'boolean'
  ) THEN
    ALTER TABLE public.sister_profiles
      ALTER COLUMN willing_to_relocate TYPE TEXT
      USING CASE
        WHEN willing_to_relocate IS TRUE  THEN 'yes'
        WHEN willing_to_relocate IS FALSE THEN 'no'
        ELSE NULL
      END;
  END IF;

  -- wants_children
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'sister_profiles'
      AND column_name = 'wants_children'
      AND data_type = 'boolean'
  ) THEN
    ALTER TABLE public.sister_profiles
      ALTER COLUMN wants_children TYPE TEXT
      USING CASE
        WHEN wants_children IS TRUE  THEN 'yes'
        WHEN wants_children IS FALSE THEN 'no'
        ELSE NULL
      END;
  END IF;

  -- previously_married
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'sister_profiles'
      AND column_name = 'previously_married'
      AND data_type = 'boolean'
  ) THEN
    ALTER TABLE public.sister_profiles
      ALTER COLUMN previously_married TYPE TEXT
      USING CASE
        WHEN previously_married IS TRUE  THEN 'yes'
        WHEN previously_married IS FALSE THEN 'no'
        ELSE NULL
      END;
  END IF;

  -- has_children
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'sister_profiles'
      AND column_name = 'has_children'
      AND data_type = 'boolean'
  ) THEN
    ALTER TABLE public.sister_profiles
      ALTER COLUMN has_children TYPE TEXT
      USING CASE
        WHEN has_children IS TRUE  THEN 'yes'
        WHEN has_children IS FALSE THEN 'no'
        ELSE NULL
      END;
  END IF;

  -- polygamy_openness
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'sister_profiles'
      AND column_name = 'polygamy_openness'
      AND data_type = 'boolean'
  ) THEN
    ALTER TABLE public.sister_profiles
      ALTER COLUMN polygamy_openness TYPE TEXT
      USING CASE
        WHEN polygamy_openness IS TRUE  THEN 'open'
        WHEN polygamy_openness IS FALSE THEN 'not_for_me'
        ELSE NULL
      END;
  END IF;
END $$;
