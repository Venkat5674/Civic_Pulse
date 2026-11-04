-- The pre-Prisma production schema was missing fields that are already
-- represented by the application schema. Keep existing rows intact.
ALTER TABLE "categories"
    ADD COLUMN "department" TEXT NOT NULL DEFAULT 'Municipal Department';

ALTER TABLE "issues"
    ADD COLUMN "is_live_capture" BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN "captured_latitude" DOUBLE PRECISION,
    ADD COLUMN "captured_longitude" DOUBLE PRECISION,
    ADD COLUMN "captured_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "issue_images"
    ADD COLUMN "is_live_camera" BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN "latitude" DOUBLE PRECISION,
    ADD COLUMN "longitude" DOUBLE PRECISION,
    ADD COLUMN "captured_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
