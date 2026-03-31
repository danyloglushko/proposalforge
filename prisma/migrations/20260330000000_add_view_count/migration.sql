-- AlterTable (idempotent)
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0;
