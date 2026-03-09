import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor', 'api');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_favourite_media_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__favourite_media_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_notes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__notes_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_guestbook_entries_embed_type" AS ENUM('none', 'spotify', 'youtube');
  CREATE TYPE "public"."enum_guestbook_entries_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum_media_types_now_category" AS ENUM('none', 'watching', 'reading', 'playing', 'listening');
  CREATE TYPE "public"."enum_media_types_lookup_source" AS ENUM('none', 'igdb', 'tmdb', 'anilist-anime', 'anilist-manga', 'openlibrary', 'musicbrainz');
  CREATE TYPE "public"."enum_site_identity_status" AS ENUM('active', 'away', 'inactive');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"display_name" varchar,
  	"avatar_id" integer,
  	"handle" varchar DEFAULT 'sigterm015',
  	"role" "enum_users_role" DEFAULT 'admin' NOT NULL,
  	"totp_secret" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"enable_a_p_i_key" boolean,
  	"api_key" varchar,
  	"api_key_index" varchar,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"credit" varchar,
  	"prefix" varchar DEFAULT 'templ3/media',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"color" varchar DEFAULT '#b00b69',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"icon_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"excerpt" varchar,
  	"hero_image_id" integer,
  	"featured" boolean DEFAULT false,
  	"published_at" timestamp(3) with time zone,
  	"category_id" integer,
  	"content" jsonb,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_canonical_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_excerpt" varchar,
  	"version_hero_image_id" integer,
  	"version_featured" boolean DEFAULT false,
  	"version_published_at" timestamp(3) with time zone,
  	"version_category_id" integer,
  	"version_content" jsonb,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_canonical_url" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "projects_stack" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"summary" varchar,
  	"project_status_id" integer,
  	"featured" boolean DEFAULT false,
  	"order" numeric DEFAULT 0,
  	"repository_url" varchar,
  	"external_url" varchar,
  	"cover_image_id" integer,
  	"content" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "_projects_v_version_stack" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_summary" varchar,
  	"version_project_status_id" integer,
  	"version_featured" boolean DEFAULT false,
  	"version_order" numeric DEFAULT 0,
  	"version_repository_url" varchar,
  	"version_external_url" varchar,
  	"version_cover_image_id" integer,
  	"version_content" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_projects_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "links" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"platform" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"icon" varchar,
  	"logo_id" integer,
  	"featured" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "favourite_media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"creator" varchar,
  	"slug" varchar,
  	"media_type_id" integer,
  	"progress_id" integer,
  	"rating" numeric,
  	"review" varchar,
  	"cover_image_id" integer,
  	"external_cover_url" varchar,
  	"external_id" varchar,
  	"external_source" varchar,
  	"external_url" varchar,
  	"blog_post_id" integer,
  	"external_review_url" varchar,
  	"completed_at" timestamp(3) with time zone,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_favourite_media_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_favourite_media_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_creator" varchar,
  	"version_slug" varchar,
  	"version_media_type_id" integer,
  	"version_progress_id" integer,
  	"version_rating" numeric,
  	"version_review" varchar,
  	"version_cover_image_id" integer,
  	"version_external_cover_url" varchar,
  	"version_external_id" varchar,
  	"version_external_source" varchar,
  	"version_external_url" varchar,
  	"version_blog_post_id" integer,
  	"version_external_review_url" varchar,
  	"version_completed_at" timestamp(3) with time zone,
  	"version_featured" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__favourite_media_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
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
  
  CREATE TABLE "web_apps" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"icon" varchar DEFAULT '◎',
  	"description" varchar,
  	"default_size_width" numeric DEFAULT 80,
  	"default_size_height" numeric DEFAULT 85,
  	"show_address_bar" boolean DEFAULT true,
  	"show_in_desktop" boolean DEFAULT true,
  	"show_in_menu" boolean DEFAULT true,
  	"enabled" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "guestbook_entries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"message" varchar NOT NULL,
  	"author_name" varchar NOT NULL,
  	"author_avatar" varchar,
  	"author_discord_id" varchar,
  	"clerk_user_id" varchar,
  	"image_id" integer NOT NULL,
  	"embed_url" varchar,
  	"embed_type" "enum_guestbook_entries_embed_type" DEFAULT 'none',
  	"status" "enum_guestbook_entries_status" DEFAULT 'pending' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
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
  	"lookup_source" "enum_media_types_lookup_source" DEFAULT 'none',
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
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"tags_id" integer,
  	"categories_id" integer,
  	"posts_id" integer,
  	"projects_id" integer,
  	"links_id" integer,
  	"favourite_media_id" integer,
  	"notes_id" integer,
  	"web_apps_id" integer,
  	"guestbook_entries_id" integer,
  	"media_types_id" integer,
  	"media_statuses_id" integer,
  	"project_statuses_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
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
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_stack" ADD CONSTRAINT "projects_stack_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_project_status_id_project_statuses_id_fk" FOREIGN KEY ("project_status_id") REFERENCES "public"."project_statuses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_stack" ADD CONSTRAINT "_projects_v_version_stack_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_project_status_id_project_statuses_id_fk" FOREIGN KEY ("version_project_status_id") REFERENCES "public"."project_statuses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "links" ADD CONSTRAINT "links_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "favourite_media" ADD CONSTRAINT "favourite_media_media_type_id_media_types_id_fk" FOREIGN KEY ("media_type_id") REFERENCES "public"."media_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "favourite_media" ADD CONSTRAINT "favourite_media_progress_id_media_statuses_id_fk" FOREIGN KEY ("progress_id") REFERENCES "public"."media_statuses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "favourite_media" ADD CONSTRAINT "favourite_media_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "favourite_media" ADD CONSTRAINT "favourite_media_blog_post_id_posts_id_fk" FOREIGN KEY ("blog_post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_favourite_media_v" ADD CONSTRAINT "_favourite_media_v_parent_id_favourite_media_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."favourite_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_favourite_media_v" ADD CONSTRAINT "_favourite_media_v_version_media_type_id_media_types_id_fk" FOREIGN KEY ("version_media_type_id") REFERENCES "public"."media_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_favourite_media_v" ADD CONSTRAINT "_favourite_media_v_version_progress_id_media_statuses_id_fk" FOREIGN KEY ("version_progress_id") REFERENCES "public"."media_statuses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_favourite_media_v" ADD CONSTRAINT "_favourite_media_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_favourite_media_v" ADD CONSTRAINT "_favourite_media_v_version_blog_post_id_posts_id_fk" FOREIGN KEY ("version_blog_post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_notes_v" ADD CONSTRAINT "_notes_v_parent_id_notes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."notes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "guestbook_entries" ADD CONSTRAINT "guestbook_entries_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_types" ADD CONSTRAINT "media_types_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_statuses" ADD CONSTRAINT "media_statuses_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "project_statuses" ADD CONSTRAINT "project_statuses_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_links_fk" FOREIGN KEY ("links_id") REFERENCES "public"."links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_favourite_media_fk" FOREIGN KEY ("favourite_media_id") REFERENCES "public"."favourite_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notes_fk" FOREIGN KEY ("notes_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_web_apps_fk" FOREIGN KEY ("web_apps_id") REFERENCES "public"."web_apps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_guestbook_entries_fk" FOREIGN KEY ("guestbook_entries_id") REFERENCES "public"."guestbook_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_types_fk" FOREIGN KEY ("media_types_id") REFERENCES "public"."media_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_statuses_fk" FOREIGN KEY ("media_statuses_id") REFERENCES "public"."media_statuses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_project_statuses_fk" FOREIGN KEY ("project_statuses_id") REFERENCES "public"."project_statuses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_identity_aliases" ADD CONSTRAINT "site_identity_aliases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_identity"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_identity_bio" ADD CONSTRAINT "site_identity_bio_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_identity"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_identity_inspirations" ADD CONSTRAINT "site_identity_inspirations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_identity"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_identity_nav_guide_lines" ADD CONSTRAINT "site_identity_nav_guide_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_identity"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_identity" ADD CONSTRAINT "site_identity_wallpaper_id_media_id_fk" FOREIGN KEY ("wallpaper_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_identity" ADD CONSTRAINT "site_identity_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_avatar_idx" ON "users" USING btree ("avatar_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_icon_idx" ON "categories" USING btree ("icon_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_hero_image_idx" ON "posts" USING btree ("hero_image_id");
  CREATE INDEX "posts_category_idx" ON "posts" USING btree ("category_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_tags_id_idx" ON "posts_rels" USING btree ("tags_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_hero_image_idx" ON "_posts_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_posts_v_version_version_category_idx" ON "_posts_v" USING btree ("version_category_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_tags_id_idx" ON "_posts_v_rels" USING btree ("tags_id");
  CREATE INDEX "projects_stack_order_idx" ON "projects_stack" USING btree ("_order");
  CREATE INDEX "projects_stack_parent_id_idx" ON "projects_stack" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_project_status_idx" ON "projects" USING btree ("project_status_id");
  CREATE INDEX "projects_cover_image_idx" ON "projects" USING btree ("cover_image_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_tags_id_idx" ON "projects_rels" USING btree ("tags_id");
  CREATE INDEX "_projects_v_version_stack_order_idx" ON "_projects_v_version_stack" USING btree ("_order");
  CREATE INDEX "_projects_v_version_stack_parent_id_idx" ON "_projects_v_version_stack" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_project_status_idx" ON "_projects_v" USING btree ("version_project_status_id");
  CREATE INDEX "_projects_v_version_version_cover_image_idx" ON "_projects_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE INDEX "_projects_v_rels_order_idx" ON "_projects_v_rels" USING btree ("order");
  CREATE INDEX "_projects_v_rels_parent_idx" ON "_projects_v_rels" USING btree ("parent_id");
  CREATE INDEX "_projects_v_rels_path_idx" ON "_projects_v_rels" USING btree ("path");
  CREATE INDEX "_projects_v_rels_tags_id_idx" ON "_projects_v_rels" USING btree ("tags_id");
  CREATE INDEX "links_logo_idx" ON "links" USING btree ("logo_id");
  CREATE INDEX "links_updated_at_idx" ON "links" USING btree ("updated_at");
  CREATE INDEX "links_created_at_idx" ON "links" USING btree ("created_at");
  CREATE UNIQUE INDEX "favourite_media_slug_idx" ON "favourite_media" USING btree ("slug");
  CREATE INDEX "favourite_media_media_type_idx" ON "favourite_media" USING btree ("media_type_id");
  CREATE INDEX "favourite_media_progress_idx" ON "favourite_media" USING btree ("progress_id");
  CREATE INDEX "favourite_media_cover_image_idx" ON "favourite_media" USING btree ("cover_image_id");
  CREATE INDEX "favourite_media_blog_post_idx" ON "favourite_media" USING btree ("blog_post_id");
  CREATE INDEX "favourite_media_updated_at_idx" ON "favourite_media" USING btree ("updated_at");
  CREATE INDEX "favourite_media_created_at_idx" ON "favourite_media" USING btree ("created_at");
  CREATE INDEX "favourite_media__status_idx" ON "favourite_media" USING btree ("_status");
  CREATE INDEX "_favourite_media_v_parent_idx" ON "_favourite_media_v" USING btree ("parent_id");
  CREATE INDEX "_favourite_media_v_version_version_slug_idx" ON "_favourite_media_v" USING btree ("version_slug");
  CREATE INDEX "_favourite_media_v_version_version_media_type_idx" ON "_favourite_media_v" USING btree ("version_media_type_id");
  CREATE INDEX "_favourite_media_v_version_version_progress_idx" ON "_favourite_media_v" USING btree ("version_progress_id");
  CREATE INDEX "_favourite_media_v_version_version_cover_image_idx" ON "_favourite_media_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_favourite_media_v_version_version_blog_post_idx" ON "_favourite_media_v" USING btree ("version_blog_post_id");
  CREATE INDEX "_favourite_media_v_version_version_updated_at_idx" ON "_favourite_media_v" USING btree ("version_updated_at");
  CREATE INDEX "_favourite_media_v_version_version_created_at_idx" ON "_favourite_media_v" USING btree ("version_created_at");
  CREATE INDEX "_favourite_media_v_version_version__status_idx" ON "_favourite_media_v" USING btree ("version__status");
  CREATE INDEX "_favourite_media_v_created_at_idx" ON "_favourite_media_v" USING btree ("created_at");
  CREATE INDEX "_favourite_media_v_updated_at_idx" ON "_favourite_media_v" USING btree ("updated_at");
  CREATE INDEX "_favourite_media_v_latest_idx" ON "_favourite_media_v" USING btree ("latest");
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
  CREATE UNIQUE INDEX "web_apps_slug_idx" ON "web_apps" USING btree ("slug");
  CREATE INDEX "web_apps_updated_at_idx" ON "web_apps" USING btree ("updated_at");
  CREATE INDEX "web_apps_created_at_idx" ON "web_apps" USING btree ("created_at");
  CREATE INDEX "guestbook_entries_author_discord_id_idx" ON "guestbook_entries" USING btree ("author_discord_id");
  CREATE INDEX "guestbook_entries_clerk_user_id_idx" ON "guestbook_entries" USING btree ("clerk_user_id");
  CREATE INDEX "guestbook_entries_image_idx" ON "guestbook_entries" USING btree ("image_id");
  CREATE INDEX "guestbook_entries_status_idx" ON "guestbook_entries" USING btree ("status");
  CREATE INDEX "guestbook_entries_updated_at_idx" ON "guestbook_entries" USING btree ("updated_at");
  CREATE INDEX "guestbook_entries_created_at_idx" ON "guestbook_entries" USING btree ("created_at");
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
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_links_id_idx" ON "payload_locked_documents_rels" USING btree ("links_id");
  CREATE INDEX "payload_locked_documents_rels_favourite_media_id_idx" ON "payload_locked_documents_rels" USING btree ("favourite_media_id");
  CREATE INDEX "payload_locked_documents_rels_notes_id_idx" ON "payload_locked_documents_rels" USING btree ("notes_id");
  CREATE INDEX "payload_locked_documents_rels_web_apps_id_idx" ON "payload_locked_documents_rels" USING btree ("web_apps_id");
  CREATE INDEX "payload_locked_documents_rels_guestbook_entries_id_idx" ON "payload_locked_documents_rels" USING btree ("guestbook_entries_id");
  CREATE INDEX "payload_locked_documents_rels_media_types_id_idx" ON "payload_locked_documents_rels" USING btree ("media_types_id");
  CREATE INDEX "payload_locked_documents_rels_media_statuses_id_idx" ON "payload_locked_documents_rels" USING btree ("media_statuses_id");
  CREATE INDEX "payload_locked_documents_rels_project_statuses_id_idx" ON "payload_locked_documents_rels" USING btree ("project_statuses_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_identity_aliases_order_idx" ON "site_identity_aliases" USING btree ("_order");
  CREATE INDEX "site_identity_aliases_parent_id_idx" ON "site_identity_aliases" USING btree ("_parent_id");
  CREATE INDEX "site_identity_bio_order_idx" ON "site_identity_bio" USING btree ("_order");
  CREATE INDEX "site_identity_bio_parent_id_idx" ON "site_identity_bio" USING btree ("_parent_id");
  CREATE INDEX "site_identity_inspirations_order_idx" ON "site_identity_inspirations" USING btree ("_order");
  CREATE INDEX "site_identity_inspirations_parent_id_idx" ON "site_identity_inspirations" USING btree ("_parent_id");
  CREATE INDEX "site_identity_nav_guide_lines_order_idx" ON "site_identity_nav_guide_lines" USING btree ("_order");
  CREATE INDEX "site_identity_nav_guide_lines_parent_id_idx" ON "site_identity_nav_guide_lines" USING btree ("_parent_id");
  CREATE INDEX "site_identity_wallpaper_idx" ON "site_identity" USING btree ("wallpaper_id");
  CREATE INDEX "site_identity_avatar_idx" ON "site_identity" USING btree ("avatar_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "projects_stack" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "_projects_v_version_stack" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_rels" CASCADE;
  DROP TABLE "links" CASCADE;
  DROP TABLE "favourite_media" CASCADE;
  DROP TABLE "_favourite_media_v" CASCADE;
  DROP TABLE "notes" CASCADE;
  DROP TABLE "_notes_v" CASCADE;
  DROP TABLE "web_apps" CASCADE;
  DROP TABLE "guestbook_entries" CASCADE;
  DROP TABLE "media_types" CASCADE;
  DROP TABLE "media_statuses" CASCADE;
  DROP TABLE "project_statuses" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_identity_aliases" CASCADE;
  DROP TABLE "site_identity_bio" CASCADE;
  DROP TABLE "site_identity_inspirations" CASCADE;
  DROP TABLE "site_identity_nav_guide_lines" CASCADE;
  DROP TABLE "site_identity" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum_favourite_media_status";
  DROP TYPE "public"."enum__favourite_media_v_version_status";
  DROP TYPE "public"."enum_notes_status";
  DROP TYPE "public"."enum__notes_v_version_status";
  DROP TYPE "public"."enum_guestbook_entries_embed_type";
  DROP TYPE "public"."enum_guestbook_entries_status";
  DROP TYPE "public"."enum_media_types_now_category";
  DROP TYPE "public"."enum_media_types_lookup_source";
  DROP TYPE "public"."enum_site_identity_status";`)
}
