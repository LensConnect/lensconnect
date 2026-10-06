ALTER TABLE `photographer_datasets` DROP CONSTRAINT `photographer_datasets_KP4qFaDwh6xT_fkey`;--> statement-breakpoint
DROP INDEX `photographer_datasets_KP4qFaDwh6xT_fkey` ON `photographer_datasets`--> statement-breakpoint
ALTER TABLE `photographer_datasets` DROP CONSTRAINT `photographer_datasets_claimed_photographer_profiles_id_fkey`;--> statement-breakpoint
DROP INDEX `photographer_datasets_claimed_photographer_profiles_id_fkey` ON `photographer_datasets`--> statement-breakpoint
ALTER TABLE `photographer_datasets` ADD CONSTRAINT `photographer_datasets_claimed_users_id_fkey` FOREIGN KEY (`claimed`) REFERENCES `users`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `photographer_datasets` DROP COLUMN `photographerId`;