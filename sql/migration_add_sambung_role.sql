-- SQL Migration: Add 'sambung' (Tukang Sambung) role to users and piece_rates ENUM fields

-- 1. Alter users table to support 'sambung' role
ALTER TABLE `users` 
MODIFY COLUMN `role` ENUM('admin', 'potong', 'sablon', 'obras', 'kelin', 'overdek', 'sambung') 
NOT NULL DEFAULT 'obras';

-- 2. Alter piece_rates table to support 'sambung' role
ALTER TABLE `piece_rates` 
MODIFY COLUMN `role` ENUM('potong', 'sablon', 'obras', 'kelin', 'overdek', 'sambung') 
NOT NULL;
