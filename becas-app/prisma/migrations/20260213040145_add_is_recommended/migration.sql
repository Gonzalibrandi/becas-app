/*
  Warnings:

  - You are about to drop the column `areas` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `scholarships` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "scholarships" DROP COLUMN "areas",
DROP COLUMN "country",
ADD COLUMN     "is_recommended" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "emails" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isoCode" TEXT,
    "slug" TEXT NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CountryToScholarship" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "countries_name_key" ON "countries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "countries_isoCode_key" ON "countries"("isoCode");

-- CreateIndex
CREATE UNIQUE INDEX "countries_slug_key" ON "countries"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_CountryToScholarship_AB_unique" ON "_CountryToScholarship"("A", "B");

-- CreateIndex
CREATE INDEX "_CountryToScholarship_B_index" ON "_CountryToScholarship"("B");

-- CreateIndex
CREATE INDEX "scholarship_alerts_user_id_idx" ON "scholarship_alerts"("user_id");

-- CreateIndex
CREATE INDEX "scholarship_alerts_is_active_idx" ON "scholarship_alerts"("is_active");

-- CreateIndex
CREATE INDEX "scholarships_status_created_at_idx" ON "scholarships"("status", "created_at");

-- CreateIndex
CREATE INDEX "scholarships_funding_type_idx" ON "scholarships"("funding_type");

-- CreateIndex
CREATE INDEX "scholarships_education_level_idx" ON "scholarships"("education_level");

-- CreateIndex
CREATE INDEX "scholarships_deadline_idx" ON "scholarships"("deadline");

-- AddForeignKey
ALTER TABLE "_CountryToScholarship" ADD CONSTRAINT "_CountryToScholarship_A_fkey" FOREIGN KEY ("A") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToScholarship" ADD CONSTRAINT "_CountryToScholarship_B_fkey" FOREIGN KEY ("B") REFERENCES "scholarships"("id") ON DELETE CASCADE ON UPDATE CASCADE;
