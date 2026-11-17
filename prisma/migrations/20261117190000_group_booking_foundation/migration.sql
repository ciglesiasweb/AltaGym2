-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'MONITOR', 'RECEPTION');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('AUTH0', 'MOCK');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CatalogStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "GroupScheduleStatus" AS ENUM ('ACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "GroupSessionStatus" AS ENUM ('SCHEDULED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GroupBookingStatus" AS ENUM ('ACTIVE', 'CANCELLED_BY_CLIENT', 'CANCELLED_BY_GYM');

-- CreateEnum
CREATE TYPE "PrivateSessionStatus" AS ENUM ('CONFIRMED', 'CANCELLED_BY_CLIENT', 'CANCELLED_BY_GYM');

-- CreateTable
CREATE TABLE "user_account" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "role" "UserRole" NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "user_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_identity" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_account_id" UUID NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "external_subject" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_identity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_account_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_names" VARCHAR(200) NOT NULL,
    "status" "ProfileStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discipline" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "status" "CatalogStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "discipline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitor" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "first_name" VARCHAR(100) NOT NULL,
    "last_names" VARCHAR(200) NOT NULL,
    "status" "ProfileStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "monitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "status" "CatalogStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_schedule" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "status" "GroupScheduleStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "group_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_schedule_revision" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "group_schedule_id" UUID NOT NULL,
    "discipline_id" UUID NOT NULL,
    "monitor_id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "weekday" INTEGER NOT NULL,
    "local_start_time" TIME(0) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "effective_from" DATE NOT NULL,
    "effective_until" DATE,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_schedule_revision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_session" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "group_schedule_id" UUID NOT NULL,
    "schedule_revision_id" UUID NOT NULL,
    "discipline_id" UUID NOT NULL,
    "monitor_id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "occurrence_date" DATE NOT NULL,
    "starts_at" TIMESTAMPTZ(3) NOT NULL,
    "ends_at" TIMESTAMPTZ(3) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "active_booking_count" INTEGER NOT NULL DEFAULT 0,
    "status" "GroupSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "group_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_booking" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "group_session_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "booked_by_user_id" UUID NOT NULL,
    "status" "GroupBookingStatus" NOT NULL DEFAULT 'ACTIVE',
    "booked_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "group_booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private_session" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "client_id" UUID NOT NULL,
    "monitor_id" UUID NOT NULL,
    "booked_by_user_id" UUID NOT NULL,
    "starts_at" TIMESTAMPTZ(3) NOT NULL,
    "ends_at" TIMESTAMPTZ(3) NOT NULL,
    "status" "PrivateSessionStatus" NOT NULL DEFAULT 'CONFIRMED',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "private_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_occupancy" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "client_id" UUID NOT NULL,
    "group_booking_id" UUID,
    "private_session_id" UUID,
    "starts_at" TIMESTAMPTZ(3) NOT NULL,
    "ends_at" TIMESTAMPTZ(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "released_at" TIMESTAMPTZ(3),

    CONSTRAINT "schedule_occupancy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_identity_provider_external_subject_key" ON "auth_identity"("provider", "external_subject");

-- CreateIndex
CREATE UNIQUE INDEX "auth_identity_user_account_id_provider_key" ON "auth_identity"("user_account_id", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "client_user_account_id_key" ON "client"("user_account_id");

-- CreateIndex
CREATE INDEX "group_schedule_revision_group_schedule_id_effective_from_ef_idx" ON "group_schedule_revision"("group_schedule_id", "effective_from", "effective_until");

-- CreateIndex
CREATE INDEX "group_session_starts_at_status_idx" ON "group_session"("starts_at", "status");

-- CreateIndex
CREATE INDEX "group_session_discipline_id_starts_at_idx" ON "group_session"("discipline_id", "starts_at");

-- CreateIndex
CREATE UNIQUE INDEX "group_session_group_schedule_id_occurrence_date_key" ON "group_session"("group_schedule_id", "occurrence_date");

-- CreateIndex
CREATE INDEX "group_booking_client_id_status_booked_at_idx" ON "group_booking"("client_id", "status", "booked_at");

-- CreateIndex
CREATE INDEX "private_session_client_id_status_starts_at_idx" ON "private_session"("client_id", "status", "starts_at");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_occupancy_group_booking_id_key" ON "schedule_occupancy"("group_booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_occupancy_private_session_id_key" ON "schedule_occupancy"("private_session_id");

-- CreateIndex
CREATE INDEX "schedule_occupancy_client_id_active_starts_at_idx" ON "schedule_occupancy"("client_id", "active", "starts_at");

-- AddForeignKey
ALTER TABLE "auth_identity" ADD CONSTRAINT "auth_identity_user_account_id_fkey" FOREIGN KEY ("user_account_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_user_account_id_fkey" FOREIGN KEY ("user_account_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_schedule_revision" ADD CONSTRAINT "group_schedule_revision_group_schedule_id_fkey" FOREIGN KEY ("group_schedule_id") REFERENCES "group_schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_schedule_revision" ADD CONSTRAINT "group_schedule_revision_discipline_id_fkey" FOREIGN KEY ("discipline_id") REFERENCES "discipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_schedule_revision" ADD CONSTRAINT "group_schedule_revision_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "monitor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_schedule_revision" ADD CONSTRAINT "group_schedule_revision_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_session" ADD CONSTRAINT "group_session_group_schedule_id_fkey" FOREIGN KEY ("group_schedule_id") REFERENCES "group_schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_session" ADD CONSTRAINT "group_session_schedule_revision_id_fkey" FOREIGN KEY ("schedule_revision_id") REFERENCES "group_schedule_revision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_session" ADD CONSTRAINT "group_session_discipline_id_fkey" FOREIGN KEY ("discipline_id") REFERENCES "discipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_session" ADD CONSTRAINT "group_session_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "monitor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_session" ADD CONSTRAINT "group_session_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_booking" ADD CONSTRAINT "group_booking_group_session_id_fkey" FOREIGN KEY ("group_session_id") REFERENCES "group_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_booking" ADD CONSTRAINT "group_booking_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_booking" ADD CONSTRAINT "group_booking_booked_by_user_id_fkey" FOREIGN KEY ("booked_by_user_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_session" ADD CONSTRAINT "private_session_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_session" ADD CONSTRAINT "private_session_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "monitor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_session" ADD CONSTRAINT "private_session_booked_by_user_id_fkey" FOREIGN KEY ("booked_by_user_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_occupancy" ADD CONSTRAINT "schedule_occupancy_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_occupancy" ADD CONSTRAINT "schedule_occupancy_group_booking_id_fkey" FOREIGN KEY ("group_booking_id") REFERENCES "group_booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_occupancy" ADD CONSTRAINT "schedule_occupancy_private_session_id_fkey" FOREIGN KEY ("private_session_id") REFERENCES "private_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "group_schedule_revision"
  ADD CONSTRAINT "group_schedule_revision_weekday_check" CHECK ("weekday" BETWEEN 1 AND 7),
  ADD CONSTRAINT "group_schedule_revision_capacity_check" CHECK ("capacity" > 0),
  ADD CONSTRAINT "group_schedule_revision_effective_range_check"
    CHECK ("effective_until" IS NULL OR "effective_until" >= "effective_from"),
  ADD CONSTRAINT "group_schedule_revision_start_time_check"
    CHECK ("local_start_time" BETWEEN TIME '08:00' AND TIME '21:00');

ALTER TABLE "group_session"
  ADD CONSTRAINT "group_session_capacity_check" CHECK ("capacity" > 0),
  ADD CONSTRAINT "group_session_booking_count_check"
    CHECK ("active_booking_count" BETWEEN 0 AND "capacity"),
  ADD CONSTRAINT "group_session_duration_check"
    CHECK ("ends_at" = "starts_at" + INTERVAL '45 minutes');

CREATE UNIQUE INDEX "group_booking_active_session_client_key"
  ON "group_booking" ("group_session_id", "client_id")
  WHERE "status" = 'ACTIVE';

ALTER TABLE "private_session"
  ADD CONSTRAINT "private_session_duration_check"
    CHECK ("ends_at" = "starts_at" + INTERVAL '45 minutes');

ALTER TABLE "schedule_occupancy"
  ADD CONSTRAINT "schedule_occupancy_interval_check" CHECK ("ends_at" > "starts_at"),
  ADD CONSTRAINT "schedule_occupancy_source_check"
    CHECK (num_nonnulls("group_booking_id", "private_session_id") = 1);

ALTER TABLE "schedule_occupancy"
  ADD CONSTRAINT "schedule_occupancy_client_no_overlap"
  EXCLUDE USING gist (
    "client_id" WITH =,
    tstzrange("starts_at", "ends_at", '[)') WITH &&
  )
  WHERE ("active");

