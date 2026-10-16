CREATE TABLE `studio_auth_codes` (
	`id` varchar(36) PRIMARY KEY,
	`user_id` int NOT NULL,
	`code_hash` char(64) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp NOT NULL,
	`used_at` timestamp,
	CONSTRAINT `studio_auth_codes_user_id_users_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade,
	INDEX `idx_studio_auth_user` (`user_id`)
);
