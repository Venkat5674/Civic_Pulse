CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");
CREATE UNIQUE INDEX "departments_slug_key" ON "departments"("slug");

ALTER TABLE "users" ADD COLUMN "department_id" TEXT;
ALTER TABLE "categories" ADD COLUMN "department_id" TEXT;
ALTER TABLE "issues" ADD COLUMN "department_id" TEXT;

ALTER TABLE "users"
    ADD CONSTRAINT "users_department_id_fkey"
    FOREIGN KEY ("department_id") REFERENCES "departments"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "categories"
    ADD CONSTRAINT "categories_department_id_fkey"
    FOREIGN KEY ("department_id") REFERENCES "departments"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "issues"
    ADD CONSTRAINT "issues_department_id_fkey"
    FOREIGN KEY ("department_id") REFERENCES "departments"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
