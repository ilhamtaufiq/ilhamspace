CREATE TABLE `umami_settings` (
	`id` text PRIMARY KEY DEFAULT 'default' NOT NULL,
	`enabled` integer DEFAULT false NOT NULL,
	`script_url` text,
	`website_id` text,
	`api_url` text,
	`api_token` text,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
