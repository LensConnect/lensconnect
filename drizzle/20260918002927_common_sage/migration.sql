CREATE TABLE `chatMessage` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`senderId` int NOT NULL,
	`recipientId` int NOT NULL,
	`content` varchar(200000) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`is_read` boolean DEFAULT false,
	CONSTRAINT `chatMessage_senderId_users_id_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`),
	CONSTRAINT `chatMessage_recipientId_users_id_fkey` FOREIGN KEY (`recipientId`) REFERENCES `users`(`id`)
);
