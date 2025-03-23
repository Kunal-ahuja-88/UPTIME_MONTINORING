/*
  Warnings:

  - Changed the type of `enum` on the `WebsiteTick` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "WebsiteStatus" AS ENUM ('Good', 'Bad');

-- AlterTable
ALTER TABLE "WebsiteTick" DROP COLUMN "enum",
ADD COLUMN     "enum" "WebsiteStatus" NOT NULL;

-- DropEnum
DROP TYPE "WebisteStatus";
