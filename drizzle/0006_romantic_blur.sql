CREATE TABLE `match_chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` integer NOT NULL,
	`author_name` text NOT NULL,
	`body` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
