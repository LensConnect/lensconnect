CREATE TABLE `photographer_datasets` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`photographerId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`city` varchar(255) NOT NULL,
	`state` varchar(255) NOT NULL,
	`countryCode` varchar(255) NOT NULL,
	`reviewsCount` int NOT NULL,
	`totalCode` int NOT NULL,
	`categories` json DEFAULT ('[]'),
	`categoryName` varchar(255) NOT NULL,
	`website` varchar(255) NOT NULL,
	`claimed` boolean NOT NULL,
	`phone` varchar(255) NOT NULL,
	`street` varchar(255) NOT NULL,
	CONSTRAINT `photographer_datasets_KP4qFaDwh6xT_fkey` FOREIGN KEY (`photographerId`) REFERENCES `photographer_profiles`(`id`),
	CONSTRAINT `photographer_datasets_claimed_photographer_profiles_id_fkey` FOREIGN KEY (`claimed`) REFERENCES `photographer_profiles`(`id`)
);
