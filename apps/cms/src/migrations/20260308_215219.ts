import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_notes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__notes_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_media_types_now_category" AS ENUM('none', 'watching', 'reading', 'playing', 'listening');
  CREATE TYPE "public"."enum_site_identity_status" AS ENUM('active', 'away', 'inactive');
  CREATE TABLE "notes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"filename" varchar,
  	"content" varchar,
  	"published_at" timestamp(3) with time zone,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_notes_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_notes_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_filename" varchar,
  	"version_content" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__notes_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "media_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"icon_id" integer,
  	"glyph" varchar,
  	"now_category" "enum_media_types_now_category" DEFAULT 'none' NOT NULL,
  	"now_label" varchar,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media_statuses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"icon_id" integer,
  	"glyph" varchar,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "project_statuses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"color" varchar,
  	"icon_id" integer,
  	"glyph" varchar,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_identity_aliases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"alias" varchar NOT NULL
  );
  
  CREATE TABLE "site_identity_bio" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"paragraph" varchar NOT NULL
  );
  
  CREATE TABLE "site_identity_inspirations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar NOT NULL
  );
  
  CREATE TABLE "site_identity_nav_guide_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"line" varchar
  );
  
  CREATE TABLE "site_identity" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'Templ3',
  	"site_domain" varchar DEFAULT 'sigterm.vodka',
  	"site_email" varchar DEFAULT 'hello@sigterm.vodka',
  	"site_description" varchar DEFAULT 'Sigterm''s personal web: DevSecOps, hacking, hardware, AI, and a retro cyberpunk aesthetic.',
  	"wallpaper_id" integer,
  	"handle" varchar DEFAULT 'Sigterm',
  	"role" varchar DEFAULT 'DevSecOps / DevOps / Pentester',
  	"specialty" varchar DEFAULT 'Cloud Infrastructure, Pentesting, Hardware',
  	"status" "enum_site_identity_status" DEFAULT 'active',
  	"claim" varchar DEFAULT 'Architecting secure cloud environments, breaking systems, and hacking stuff.',
  	"intro" varchar DEFAULT 'Cloud infrastructure, offensive security, hacking stuff, and a retro-cyberpunk terminal aesthetic.',
  	"avatar_id" integer,
  	"nav_guide_title" varchar DEFAULT 'README.txt — How to navigate Templ3',
  	"terminal_prompt" varchar DEFAULT 'sigterm@templ3:~$',
  	"terminal_pwd" varchar DEFAULT '/home/sigterm',
  	"terminal_uname" varchar DEFAULT 'Templ3 OS 0.6.6.6 sigterm-sanctum x86_64 GNU/Linux',
  	"whoami_output" varchar DEFAULT 'Handle:    Sigterm / Sigterm015
  Role:      DevSecOps → Red Team
  Status:    ACTIVE
  Specialty: Pentesting, Bug Bounty, Automation
  Domain:    sigterm.vodka
  Codename:  Templ3',
  	"neofetch_output" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "categories" ADD COLUMN "description" varchar;
  ALTER TABLE "projects" ADD COLUMN "project_status_id" integer;
  ALTER TABLE "_projects_v" ADD COLUMN "version_project_status_id" integer;
  ALTER TABLE "favourite_media" ADD COLUMN "media_type_id" integer;
  ALTER TABLE "favourite_media" ADD COLUMN "progress_id" integer;
  ALTER TABLE "_favourite_media_v" ADD COLUMN "version_media_type_id" integer;
  ALTER TABLE "_favourite_media_v" ADD COLUMN "version_progress_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "notes_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "media_types_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "media_statuses_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "project_statuses_id" integer;
  ALTER TABLE "_notes_v" ADD CONSTRAINT "_notes_v_parent_id_notes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."notes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_types" ADD CONSTRAINT "media_types_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_statuses" ADD CONSTRAINT "media_statuses_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "project_statuses" ADD CONSTRAINT "project_statuses_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_identity_aliases" ADD CONSTRAINT "site_identity_aliases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_identity"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_identity_bio" ADD CONSTRAINT "site_identity_bio_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_identity"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_identity_inspirations" ADD CONSTRAINT "site_identity_inspirations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_identity"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_identity_nav_guide_lines" ADD CONSTRAINT "site_identity_nav_guide_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_identity"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_identity" ADD CONSTRAINT "site_identity_wallpaper_id_media_id_fk" FOREIGN KEY ("wallpaper_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_identity" ADD CONSTRAINT "site_identity_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "notes_slug_idx" ON "notes" USING btree ("slug");
  CREATE INDEX "notes_updated_at_idx" ON "notes" USING btree ("updated_at");
  CREATE INDEX "notes_created_at_idx" ON "notes" USING btree ("created_at");
  CREATE INDEX "notes__status_idx" ON "notes" USING btree ("_status");
  CREATE INDEX "_notes_v_parent_idx" ON "_notes_v" USING btree ("parent_id");
  CREATE INDEX "_notes_v_version_version_slug_idx" ON "_notes_v" USING btree ("version_slug");
  CREATE INDEX "_notes_v_version_version_updated_at_idx" ON "_notes_v" USING btree ("version_updated_at");
  CREATE INDEX "_notes_v_version_version_created_at_idx" ON "_notes_v" USING btree ("version_created_at");
  CREATE INDEX "_notes_v_version_version__status_idx" ON "_notes_v" USING btree ("version__status");
  CREATE INDEX "_notes_v_created_at_idx" ON "_notes_v" USING btree ("created_at");
  CREATE INDEX "_notes_v_updated_at_idx" ON "_notes_v" USING btree ("updated_at");
  CREATE INDEX "_notes_v_latest_idx" ON "_notes_v" USING btree ("latest");
  CREATE UNIQUE INDEX "media_types_value_idx" ON "media_types" USING btree ("value");
  CREATE INDEX "media_types_icon_idx" ON "media_types" USING btree ("icon_id");
  CREATE INDEX "media_types_updated_at_idx" ON "media_types" USING btree ("updated_at");
  CREATE INDEX "media_types_created_at_idx" ON "media_types" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_statuses_value_idx" ON "media_statuses" USING btree ("value");
  CREATE INDEX "media_statuses_icon_idx" ON "media_statuses" USING btree ("icon_id");
  CREATE INDEX "media_statuses_updated_at_idx" ON "media_statuses" USING btree ("updated_at");
  CREATE INDEX "media_statuses_created_at_idx" ON "media_statuses" USING btree ("created_at");
  CREATE UNIQUE INDEX "project_statuses_value_idx" ON "project_statuses" USING btree ("value");
  CREATE INDEX "project_statuses_icon_idx" ON "project_statuses" USING btree ("icon_id");
  CREATE INDEX "project_statuses_updated_at_idx" ON "project_statuses" USING btree ("updated_at");
  CREATE INDEX "project_statuses_created_at_idx" ON "project_statuses" USING btree ("created_at");
  CREATE INDEX "site_identity_aliases_order_idx" ON "site_identity_aliases" USING btree ("_order");
  CREATE INDEX "site_identity_aliases_parent_id_idx" ON "site_identity_aliases" USING btree ("_parent_id");
  CREATE INDEX "site_identity_bio_order_idx" ON "site_identity_bio" USING btree ("_order");
  CREATE INDEX "site_identity_bio_parent_id_idx" ON "site_identity_bio" USING btree ("_parent_id");
  CREATE INDEX "site_identity_inspirations_order_idx" ON "site_identity_inspirations" USING btree ("_order");
  CREATE INDEX "site_identity_inspirations_parent_id_idx" ON "site_identity_inspirations" USING btree ("_parent_id");
  CREATE INDEX "site_identity_nav_guide_lines_order_idx" ON "site_identity_nav_guide_lines" USING btree ("_order");
  CREATE INDEX "site_identity_nav_guide_lines_parent_id_idx" ON "site_identity_nav_guide_lines" USING btree ("_parent_id");
  CREATE INDEX "site_identity_wallpaper_idx" ON "site_identity" USING btree ("wallpaper_id");
  CREATE INDEX "site_identity_avatar_idx" ON "site_identity" USING btree ("avatar_id");
  ALTER TABLE "projects" ADD CONSTRAINT "projects_project_status_id_project_statuses_id_fk" FOREIGN KEY ("project_status_id") REFERENCES "public"."project_statuses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_project_status_id_project_statuses_id_fk" FOREIGN KEY ("version_project_status_id") REFERENCES "public"."project_statuses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "favourite_media" ADD CONSTRAINT "favourite_media_media_type_id_media_types_id_fk" FOREIGN KEY ("media_type_id") REFERENCES "public"."media_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "favourite_media" ADD CONSTRAINT "favourite_media_progress_id_media_statuses_id_fk" FOREIGN KEY ("progress_id") REFERENCES "public"."media_statuses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_favourite_media_v" ADD CONSTRAINT "_favourite_media_v_version_media_type_id_media_types_id_fk" FOREIGN KEY ("version_media_type_id") REFERENCES "public"."media_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_favourite_media_v" ADD CONSTRAINT "_favourite_media_v_version_progress_id_media_statuses_id_fk" FOREIGN KEY ("version_progress_id") REFERENCES "public"."media_statuses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notes_fk" FOREIGN KEY ("notes_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_types_fk" FOREIGN KEY ("media_types_id") REFERENCES "public"."media_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_statuses_fk" FOREIGN KEY ("media_statuses_id") REFERENCES "public"."media_statuses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_project_statuses_fk" FOREIGN KEY ("project_statuses_id") REFERENCES "public"."project_statuses"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_project_status_idx" ON "projects" USING btree ("project_status_id");
  CREATE INDEX "_projects_v_version_version_project_status_idx" ON "_projects_v" USING btree ("version_project_status_id");
  CREATE INDEX "favourite_media_media_type_idx" ON "favourite_media" USING btree ("media_type_id");
  CREATE INDEX "favourite_media_progress_idx" ON "favourite_media" USING btree ("progress_id");
  CREATE INDEX "_favourite_media_v_version_version_media_type_idx" ON "_favourite_media_v" USING btree ("version_media_type_id");
  CREATE INDEX "_favourite_media_v_version_version_progress_idx" ON "_favourite_media_v" USING btree ("version_progress_id");
  CREATE INDEX "payload_locked_documents_rels_notes_id_idx" ON "payload_locked_documents_rels" USING btree ("notes_id");
  CREATE INDEX "payload_locked_documents_rels_media_types_id_idx" ON "payload_locked_documents_rels" USING btree ("media_types_id");
  CREATE INDEX "payload_locked_documents_rels_media_statuses_id_idx" ON "payload_locked_documents_rels" USING btree ("media_statuses_id");
  CREATE INDEX "payload_locked_documents_rels_project_statuses_id_idx" ON "payload_locked_documents_rels" USING btree ("project_statuses_id");
  ALTER TABLE "projects" DROP COLUMN "project_status";
  ALTER TABLE "_projects_v" DROP COLUMN "version_project_status";
  ALTER TABLE "favourite_media" DROP COLUMN "media_type";
  ALTER TABLE "favourite_media" DROP COLUMN "progress";
  ALTER TABLE "_favourite_media_v" DROP COLUMN "version_media_type";
  ALTER TABLE "_favourite_media_v" DROP COLUMN "version_progress";
  DROP TYPE "public"."enum_projects_project_status";
  DROP TYPE "public"."enum__projects_v_version_project_status";
  DROP TYPE "public"."enum_favourite_media_media_type";
  DROP TYPE "public"."enum_favourite_media_progress";
  DROP TYPE "public"."enum__favourite_media_v_version_media_type";
  DROP TYPE "public"."enum__favourite_media_v_version_progress";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_project_status" AS ENUM('building', 'active', 'planned', 'concept', 'archived');
  CREATE TYPE "public"."enum__projects_v_version_project_status" AS ENUM('building', 'active', 'planned', 'concept', 'archived');
  CREATE TYPE "public"."enum_favourite_media_media_type" AS ENUM('anime', 'manga', 'game', 'movie', 'series', 'book', 'music', 'other');
  CREATE TYPE "public"."enum_favourite_media_progress" AS ENUM('completed', 'in-progress', 'dropped', 'planned');
  CREATE TYPE "public"."enum__favourite_media_v_version_media_type" AS ENUM('anime', 'manga', 'game', 'movie', 'series', 'book', 'music', 'other');
  CREATE TYPE "public"."enum__favourite_media_v_version_progress" AS ENUM('completed', 'in-progress', 'dropped', 'planned');
  ALTER TABLE "notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_notes_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "media_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "media_statuses" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "project_statuses" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_identity_aliases" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_identity_bio" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_identity_inspirations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_identity_nav_guide_lines" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_identity" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "notes" CASCADE;
  DROP TABLE "_notes_v" CASCADE;
  DROP TABLE "media_types" CASCADE;
  DROP TABLE "media_statuses" CASCADE;
  DROP TABLE "project_statuses" CASCADE;
  DROP TABLE "site_identity_aliases" CASCADE;
  DROP TABLE "site_identity_bio" CASCADE;
  DROP TABLE "site_identity_inspirations" CASCADE;
  DROP TABLE "site_identity_nav_guide_lines" CASCADE;
  DROP TABLE "site_identity" CASCADE;
  ALTER TABLE "projects" DROP CONSTRAINT "projects_project_status_id_project_statuses_id_fk";
  
  ALTER TABLE "_projects_v" DROP CONSTRAINT "_projects_v_version_project_status_id_project_statuses_id_fk";
  
  ALTER TABLE "favourite_media" DROP CONSTRAINT "favourite_media_media_type_id_media_types_id_fk";
  
  ALTER TABLE "favourite_media" DROP CONSTRAINT "favourite_media_progress_id_media_statuses_id_fk";
  
  ALTER TABLE "_favourite_media_v" DROP CONSTRAINT "_favourite_media_v_version_media_type_id_media_types_id_fk";
  
  ALTER TABLE "_favourite_media_v" DROP CONSTRAINT "_favourite_media_v_version_progress_id_media_statuses_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_notes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_media_types_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_media_statuses_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_project_statuses_fk";
  
  DROP INDEX "projects_project_status_idx";
  DROP INDEX "_projects_v_version_version_project_status_idx";
  DROP INDEX "favourite_media_media_type_idx";
  DROP INDEX "favourite_media_progress_idx";
  DROP INDEX "_favourite_media_v_version_version_media_type_idx";
  DROP INDEX "_favourite_media_v_version_version_progress_idx";
  DROP INDEX "payload_locked_documents_rels_notes_id_idx";
  DROP INDEX "payload_locked_documents_rels_media_types_id_idx";
  DROP INDEX "payload_locked_documents_rels_media_statuses_id_idx";
  DROP INDEX "payload_locked_documents_rels_project_statuses_id_idx";
  ALTER TABLE "projects" ADD COLUMN "project_status" "enum_projects_project_status" DEFAULT 'building';
  ALTER TABLE "_projects_v" ADD COLUMN "version_project_status" "enum__projects_v_version_project_status" DEFAULT 'building';
  ALTER TABLE "favourite_media" ADD COLUMN "media_type" "enum_favourite_media_media_type";
  ALTER TABLE "favourite_media" ADD COLUMN "progress" "enum_favourite_media_progress" DEFAULT 'completed';
  ALTER TABLE "_favourite_media_v" ADD COLUMN "version_media_type" "enum__favourite_media_v_version_media_type";
  ALTER TABLE "_favourite_media_v" ADD COLUMN "version_progress" "enum__favourite_media_v_version_progress" DEFAULT 'completed';
  ALTER TABLE "categories" DROP COLUMN "description";
  ALTER TABLE "projects" DROP COLUMN "project_status_id";
  ALTER TABLE "_projects_v" DROP COLUMN "version_project_status_id";
  ALTER TABLE "favourite_media" DROP COLUMN "media_type_id";
  ALTER TABLE "favourite_media" DROP COLUMN "progress_id";
  ALTER TABLE "_favourite_media_v" DROP COLUMN "version_media_type_id";
  ALTER TABLE "_favourite_media_v" DROP COLUMN "version_progress_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "notes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "media_types_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "media_statuses_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "project_statuses_id";
  DROP TYPE "public"."enum_notes_status";
  DROP TYPE "public"."enum__notes_v_version_status";
  DROP TYPE "public"."enum_media_types_now_category";
  DROP TYPE "public"."enum_site_identity_status";`)
}
