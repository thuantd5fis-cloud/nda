-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "color" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0;
