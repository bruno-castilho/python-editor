-- Rename column avatarUrl → avatar and clear default
ALTER TABLE "users" RENAME COLUMN "avatarUrl" TO "avatar";
ALTER TABLE "users" ALTER COLUMN "avatar" SET DEFAULT NULL;

-- Update any existing empty-string values to null
UPDATE "users" SET "avatar" = NULL WHERE "avatar" = '';
