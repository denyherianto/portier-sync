CREATE TABLE `doors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`location` text NOT NULL,
	`device_id` text NOT NULL,
	`status` text DEFAULT 'offline' NOT NULL,
	`battery_level` integer DEFAULT 100 NOT NULL,
	`last_seen` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `doors_device_id_unique` ON `doors` (`device_id`);--> statement-breakpoint
CREATE TABLE `keys` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`door_id` text NOT NULL,
	`key_type` text NOT NULL,
	`access_start` integer NOT NULL,
	`access_end` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`door_id`) REFERENCES `doors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`role` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);