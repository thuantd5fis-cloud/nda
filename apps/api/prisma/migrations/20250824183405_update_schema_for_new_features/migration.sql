/*
  Warnings:

  - You are about to drop the column `content` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `countdown_at` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `end_at` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `start_at` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `degree_title` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `org` on the `members` table. All the data in the column will be lost.
  - You are about to drop the `experts` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `mime_type` to the `assets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `assets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_name` to the `assets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `assets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `faqs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by` to the `faqs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `tags` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MentoringStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('HELPFUL', 'NOT_HELPFUL');

-- DropForeignKey
ALTER TABLE "experts" DROP CONSTRAINT "experts_member_id_fkey";

-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "alt" TEXT,
ADD COLUMN     "caption" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "download_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "mime_type" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "original_name" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "thumbnail_url" TEXT,
ADD COLUMN     "url" TEXT NOT NULL,
ADD COLUMN     "usage_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "events" DROP COLUMN "content",
DROP COLUMN "countdown_at",
DROP COLUMN "end_at",
DROP COLUMN "start_at",
ADD COLUMN     "attendees_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "contact_email" TEXT,
ADD COLUMN     "contact_phone" TEXT,
ADD COLUMN     "created_by" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "is_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_public" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "max_attendees" INTEGER,
ADD COLUMN     "organizer" TEXT,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "registration_deadline" TIMESTAMP(3),
ADD COLUMN     "requires_registration" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'UPCOMING',
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "venue" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "faqs" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "created_by" TEXT NOT NULL,
ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "like_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "search_keywords" TEXT[],
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "view_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "members" DROP COLUMN "degree_title",
DROP COLUMN "org",
ADD COLUMN     "articles_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "certifications" TEXT[],
ADD COLUMN     "company" TEXT,
ADD COLUMN     "experience" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "expertise" TEXT[],
ADD COLUMN     "github" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_expert" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "join_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "mentoring_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "twitter" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "color" TEXT NOT NULL DEFAULT 'blue',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "github" TEXT,
ADD COLUMN     "last_login_at" TIMESTAMP(3),
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "login_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "organization" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "twitter" TEXT,
ADD COLUMN     "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "website" TEXT;

-- DropTable
DROP TABLE "experts";

-- CreateTable
CREATE TABLE "mentoring_sessions" (
    "id" TEXT NOT NULL,
    "mentor_id" TEXT NOT NULL,
    "mentee_name" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" "MentoringStatus" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentoring_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registrations" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_feedback" (
    "id" TEXT NOT NULL,
    "faq_id" TEXT NOT NULL,
    "user_id" TEXT,
    "type" "FeedbackType" NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faq_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_usage" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_registrations_event_id_user_id_key" ON "event_registrations"("event_id", "user_id");

-- AddForeignKey
ALTER TABLE "mentoring_sessions" ADD CONSTRAINT "mentoring_sessions_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faq_feedback" ADD CONSTRAINT "faq_feedback_faq_id_fkey" FOREIGN KEY ("faq_id") REFERENCES "faqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faq_feedback" ADD CONSTRAINT "faq_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_usage" ADD CONSTRAINT "asset_usage_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
