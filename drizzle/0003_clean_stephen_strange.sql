CREATE TABLE `comment_votes` (
	`id` text PRIMARY KEY NOT NULL,
	`comment_id` text NOT NULL,
	`voter_key` text NOT NULL,
	`vote` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comment_votes_comment_voter` ON `comment_votes` (`comment_id`,`voter_key`);