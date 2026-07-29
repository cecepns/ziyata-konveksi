-- SQL Migration: Add 'obras_dirumah' rate option to piece_rates table

USE `konveksi_db`;

-- 1. Modify piece_rates.role to VARCHAR(50) to flexibly support obras_dirumah and future roles
ALTER TABLE `piece_rates` 
MODIFY COLUMN `role` VARCHAR(50) NOT NULL;
