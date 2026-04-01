-- AlterTable (idempotent)
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "lastViewedAt" TIMESTAMP(3);
