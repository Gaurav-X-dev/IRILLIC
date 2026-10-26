CREATE TABLE "page_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"section_key" varchar(120) NOT NULL,
	"label" varchar(255) NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_page_id_content_entries_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."content_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "page_section_unique" ON "page_sections" USING btree ("page_id","section_key");--> statement-breakpoint
CREATE INDEX "page_section_order_idx" ON "page_sections" USING btree ("page_id","sort_order");