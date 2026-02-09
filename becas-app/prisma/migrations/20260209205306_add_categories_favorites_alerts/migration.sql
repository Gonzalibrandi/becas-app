-- CreateEnum
CREATE TYPE "AlertFrequency" AS ENUM ('DAILY', 'WEEKLY');

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarship_alerts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Mi Alerta',
    "criteria" JSONB NOT NULL DEFAULT '{}',
    "frequency" "AlertFrequency" NOT NULL DEFAULT 'WEEKLY',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_sent_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scholarship_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SavedScholarships" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CategoryToScholarship" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_SavedScholarships_AB_unique" ON "_SavedScholarships"("A", "B");

-- CreateIndex
CREATE INDEX "_SavedScholarships_B_index" ON "_SavedScholarships"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToScholarship_AB_unique" ON "_CategoryToScholarship"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToScholarship_B_index" ON "_CategoryToScholarship"("B");

-- AddForeignKey
ALTER TABLE "scholarship_alerts" ADD CONSTRAINT "scholarship_alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SavedScholarships" ADD CONSTRAINT "_SavedScholarships_A_fkey" FOREIGN KEY ("A") REFERENCES "scholarships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SavedScholarships" ADD CONSTRAINT "_SavedScholarships_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToScholarship" ADD CONSTRAINT "_CategoryToScholarship_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToScholarship" ADD CONSTRAINT "_CategoryToScholarship_B_fkey" FOREIGN KEY ("B") REFERENCES "scholarships"("id") ON DELETE CASCADE ON UPDATE CASCADE;
