-- Migration: convert Proposal.content from TEXT to JSONB
-- Existing markdown strings are wrapped as { "executiveSummary": "<old content>" }
-- so they remain readable via ProposalDocument's executiveSummary field.

ALTER TABLE "Proposal"
  ALTER COLUMN "content" TYPE JSONB
  USING jsonb_build_object('executiveSummary', content);
