/*
  Warnings:

  - You are about to drop the column `key` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `settings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[category]` on the table `settings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `data` to the `settings` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "settings_key_key";

-- AlterTable
ALTER TABLE "settings" DROP COLUMN "key",
DROP COLUMN "value",
ADD COLUMN     "data" JSONB NOT NULL,
ALTER COLUMN "category" DROP DEFAULT;

-- CreateTable
CREATE TABLE "files_upload" (
    "id" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "files_upload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "digital_era" (
    "id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "digital_era_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_category_key" ON "settings"("category");

-- AddForeignKey
ALTER TABLE "files_upload" ADD CONSTRAINT "files_upload_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
