CREATE TABLE `auth_attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `auth_attempts_expires` ON `auth_attempts` (`expires`);--> statement-breakpoint
CREATE TABLE `login_sessions` (
	`hash` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `login_sessions_expires` ON `login_sessions` (`expires`);--> statement-breakpoint
CREATE TABLE `student_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`student` text NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`courses` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`institution` text NOT NULL,
	`requested` text NOT NULL,
	`approved` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `students_status_created` ON `students` (`status`,`created`);