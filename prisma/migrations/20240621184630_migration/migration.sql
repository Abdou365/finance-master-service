-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('email');

-- CreateEnum
CREATE TYPE "LoginType" AS ENUM ('password');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "Recurrence" AS ENUM ('day', 'week', 'month', 'year');

-- CreateEnum
CREATE TYPE "ObjectifType" AS ENUM ('savings', 'income');

-- CreateEnum
CREATE TYPE "ObjectifStatus" AS ENUM ('active', 'completed', 'archived', 'deleted');

-- AlterEnum
ALTER TYPE "ItemStatus" ADD VALUE 'archived';

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_accountId_fkey";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "status" "ItemStatus" NOT NULL DEFAULT 'published',
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "userId" TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Authentication" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "refreshToken" TEXT,
    "refreshExpiresAt" TIMESTAMP(3),
    "recoveryToken" TEXT,
    "recoveryExpiresAt" TIMESTAMP(3),
    "confirmToken" TEXT,
    "confirmExpiresAt" TIMESTAMP(3),
    "confirmCode" INTEGER,
    "recoveryCode" INTEGER,
    "emailUpdatedAt" TIMESTAMP(3),
    "provider" "Provider" NOT NULL DEFAULT 'email',
    "loginType" "LoginType" NOT NULL DEFAULT 'password',
    "lastLogin" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3),
    "password" TEXT,
    "userId" TEXT,

    CONSTRAINT "Authentication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmedAt" TIMESTAMP(3),
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Objectif" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT DEFAULT '',
    "description" TEXT,
    "from" TIMESTAMP(3),
    "to" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "targetAmount" DOUBLE PRECISION NOT NULL,
    "categories" TEXT[],
    "isRecurrent" BOOLEAN NOT NULL DEFAULT false,
    "recurrence" "Recurrence",
    "recurrenceInterval" INTEGER DEFAULT 1,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "type" "ObjectifType" NOT NULL DEFAULT 'savings',
    "status" "ObjectifStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "Objectif_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Authentication_userId_key" ON "Authentication"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Authentication" ADD CONSTRAINT "Authentication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objectif" ADD CONSTRAINT "Objectif_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objectif" ADD CONSTRAINT "Objectif_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
