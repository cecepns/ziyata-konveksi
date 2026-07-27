-- SQL Migration: Add 'work_location' to work_logs table
ALTER TABLE `work_logs` ADD COLUMN `work_location` VARCHAR(50) NULL;
