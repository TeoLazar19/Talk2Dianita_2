/*
  Warnings:

  - You are about to drop the column `language` on the `UserPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `UserPreferences` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "image" TEXT,
ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "UserPreferences" DROP COLUMN "language",
DROP COLUMN "theme",
ADD COLUMN     "themeJson" JSONB;
