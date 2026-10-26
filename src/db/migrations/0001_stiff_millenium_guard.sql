DROP INDEX "content_type_status_idx";--> statement-breakpoint
CREATE INDEX "admin_sessions_expiry_idx" ON "admin_sessions" USING btree ("expires_at","revoked_at");--> statement-breakpoint
CREATE INDEX "enquiry_status_created_idx" ON "enquiries" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "enquiry_created_idx" ON "enquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "media_updated_idx" ON "media_assets" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "settings_group_idx" ON "site_settings" USING btree ("group");--> statement-breakpoint
CREATE INDEX "content_type_status_idx" ON "content_entries" USING btree ("type","status","sort_order");