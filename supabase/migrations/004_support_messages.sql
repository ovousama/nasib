-- 004_support_messages.sql
-- Backs the Contact Us form in /dashboard/contact

CREATE TABLE IF NOT EXISTS support_messages (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category             TEXT         NOT NULL DEFAULT 'general',
  subject              TEXT         NOT NULL,
  message              TEXT         NOT NULL,
  status               TEXT         NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  admin_response       TEXT,
  admin_responded_at   TIMESTAMPTZ,
  admin_responded_by   UUID         REFERENCES auth.users(id),
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_messages_user
  ON support_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_status
  ON support_messages(status);

ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own support messages"
  ON support_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own support messages"
  ON support_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can read all support messages"
  ON support_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_app_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin can update support messages"
  ON support_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_app_meta_data->>'role' = 'admin'
    )
  );

NOTIFY pgrst, 'reload schema';
