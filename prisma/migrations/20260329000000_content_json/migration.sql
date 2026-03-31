-- Migration: content column stays as TEXT (schema reverted from Json back to String @db.Text).
-- This migration is intentionally a no-op to preserve the plain-text markdown storage format.
SELECT 1;
