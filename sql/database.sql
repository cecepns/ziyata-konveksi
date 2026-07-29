-- Database Export for Aplikasi Pengelolaan Produksi Konveksi
CREATE DATABASE IF NOT EXISTS `konveksi_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `konveksi_db`;

-- 1. Table Users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `role` ENUM('admin', 'potong', 'sablon', 'obras', 'kelin', 'overdek', 'sambung') NOT NULL DEFAULT 'obras',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table Models (Model Pakaian yang dikerjakan)
DROP TABLE IF EXISTS `models`;
CREATE TABLE `models` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `model_name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table Piece Rates (Harga Borong per Pcs per Model per Role Pekerja)
DROP TABLE IF EXISTS `piece_rates`;
CREATE TABLE `piece_rates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `model_id` INT NOT NULL,
  `role` VARCHAR(50) NOT NULL,
  `price_per_piece` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_model_role` (`model_id`, `role`),
  FOREIGN KEY (`model_id`) REFERENCES `models`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Table Work Logs (Rekap Kerja Harian Input Pekerja)
DROP TABLE IF EXISTS `work_logs`;
CREATE TABLE `work_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `worker_id` INT NOT NULL,
  `work_date` DATE NOT NULL,
  `model_id` INT NOT NULL,
  `quantity_pcs` INT NOT NULL DEFAULT 0,
  `fabric_type` VARCHAR(100) NULL, -- Khusus Pemotong (e.g. Lotto, Cotton)
  `fabric_weight_kg` DECIMAL(8,2) NULL, -- Khusus Pemotong (Netto / Panjang Kain kg)
  `work_location` VARCHAR(50) NULL, -- Khusus Obras (e.g. Di Tempat Kerja, Di Rumah (Lembur))
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`worker_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`model_id`) REFERENCES `models`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- SAMPLE DATA INSERTS
-- Default Password for all sample users: "123456" (hashed with bcrypt)
-- $2a$10$wN9iLd4E/xH7kC8s.aQxJeX/P0g.8yY8oN6vLgP3sM9qF5y/5qW standard demo hash
-- --------------------------------------------------------

INSERT INTO `users` (`id`, `username`, `password`, `name`, `role`) VALUES
(1, 'admin', '$2a$10$7Yw7zki8raSs5F9wZNfsEubAoT5nFGAx5XF3jp/lXbm/ybQLIy3YK', 'Admin Konveksi', 'admin'),
(2, 'pemotong01', '$2a$10$7Yw7zki8raSs5F9wZNfsEubAoT5nFGAx5XF3jp/lXbm/ybQLIy3YK', 'Bondet (Tukang Potong)', 'potong'),
(3, 'sablon01', '$2a$10$7Yw7zki8raSs5F9wZNfsEubAoT5nFGAx5XF3jp/lXbm/ybQLIy3YK', 'Agus (Tukang Sablon)', 'sablon'),
(4, 'obras01', '$2a$10$7Yw7zki8raSs5F9wZNfsEubAoT5nFGAx5XF3jp/lXbm/ybQLIy3YK', 'Siti (Tukang Obras)', 'obras'),
(5, 'kelin01', '$2a$10$7Yw7zki8raSs5F9wZNfsEubAoT5nFGAx5XF3jp/lXbm/ybQLIy3YK', 'Budi (Tukang Kelin)', 'kelin'),
(6, 'overdek01', '$2a$10$7Yw7zki8raSs5F9wZNfsEubAoT5nFGAx5XF3jp/lXbm/ybQLIy3YK', 'Dewi (Tukang Overdek)', 'overdek');

INSERT INTO `models` (`id`, `model_name`, `description`) VALUES
(1, 'Boxer Pendek', 'Celana boxer bahan lotto / cotton'),
(2, 'Kaos Polos Cotton 30s', 'Kaos oblong standar distro'),
(3, 'Jaket Hoodie Fleece', 'Jaket hoodie bertopi hangat');

INSERT INTO `piece_rates` (`model_id`, `role`, `price_per_piece`) VALUES
(1, 'potong', 300.00),
(1, 'sablon', 500.00),
(1, 'obras', 800.00),
(1, 'kelin', 400.00),
(1, 'overdek', 600.00),
(2, 'potong', 350.00),
(2, 'sablon', 700.00),
(2, 'obras', 900.00),
(2, 'kelin', 500.00),
(2, 'overdek', 700.00);

INSERT INTO `work_logs` (`id`, `worker_id`, `work_date`, `model_id`, `quantity_pcs`, `fabric_type`, `fabric_weight_kg`, `notes`) VALUES
(1, 2, CURDATE(), 1, 900, 'Lotto', 150.00, 'Potong bahan boxer lotto hitam'),
(2, 4, CURDATE(), 1, 450, NULL, NULL, 'Selesai obras 450 pcs boxer'),
(3, 5, CURDATE(), 1, 300, NULL, NULL, 'Kelin bagian bawah 300 pcs'),
(4, 6, CURDATE(), 1, 300, NULL, NULL, 'Overdek ban pinggang 300 pcs');
