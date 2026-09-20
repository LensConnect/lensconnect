CREATE TABLE `chatmessage` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`senderId` int NOT NULL,
	`recipientId` int NOT NULL,
	`content` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`is_read` boolean DEFAULT false,
	CONSTRAINT `chatmessage_senderId_users_id_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`),
	CONSTRAINT `chatmessage_recipientId_users_id_fkey` FOREIGN KEY (`recipientId`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
DROP TABLE `chatMessage`;