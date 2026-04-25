CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_price` integer NOT NULL,
	`image_url` text,
	`variant` text
);
--> statement-breakpoint
CREATE INDEX `idx_order_items_order` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`site_id` text NOT NULL,
	`owner_email` text NOT NULL,
	`vertical` text NOT NULL,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`customer_name` text NOT NULL,
	`customer_email` text NOT NULL,
	`customer_phone` text NOT NULL,
	`subtotal` integer NOT NULL,
	`total` integer NOT NULL,
	`currency` text DEFAULT 'Le' NOT NULL,
	`payment_method` text,
	`payment_ref` text,
	`details` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_reference_unique` ON `orders` (`reference`);--> statement-breakpoint
CREATE INDEX `idx_orders_owner` ON `orders` (`owner_email`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_orders_site` ON `orders` (`site_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_orders_customer` ON `orders` (`customer_email`);--> statement-breakpoint
CREATE TABLE `otp_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`code` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	`reset_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sites` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`owner_email` text NOT NULL,
	`vertical` text NOT NULL,
	`template_id` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`config` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`phone` text,
	`name` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
