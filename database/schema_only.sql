/*
 * LMS Teman Belajar - Schema Only (DDL)
 * Database: MySQL / MariaDB (utf8mb4)
 */

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Drop tables if existing (in reverse foreign key order)
DROP TABLE IF EXISTS `session`;
DROP TABLE IF EXISTS `report`;
DROP TABLE IF EXISTS `mentor`;
DROP TABLE IF EXISTS `student`;
DROP TABLE IF EXISTS `_prisma_migrations`;

-- ------------------------------------------------------------
-- Table structure for: _prisma_migrations
-- ------------------------------------------------------------
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for: mentor
-- ------------------------------------------------------------
CREATE TABLE `mentor` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'active',
  `core_skill` varchar(191) DEFAULT NULL,
  `country` varchar(191) DEFAULT NULL,
  `language` varchar(191) DEFAULT NULL,
  `photo_path` text DEFAULT NULL,
  `pin` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mentor_pin_key` (`pin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for: student
-- ------------------------------------------------------------
CREATE TABLE `student` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `parent_email` varchar(191) NOT NULL,
  `program` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for: session
-- ------------------------------------------------------------
CREATE TABLE `session` (
  `id` varchar(191) NOT NULL,
  `student_id` varchar(191) NOT NULL,
  `mentor_id` varchar(191) DEFAULT NULL,
  `date` datetime(3) NOT NULL,
  `attendance` varchar(191) NOT NULL,
  `activity` text NOT NULL,
  `observation` text NOT NULL,
  `photo_path` text DEFAULT NULL,
  `next_step` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Session_student_id_fkey` (`student_id`),
  KEY `Session_mentor_id_fkey` (`mentor_id`),
  CONSTRAINT `session_mentor_id_fkey` FOREIGN KEY (`mentor_id`) REFERENCES `mentor` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `session_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for: report
-- ------------------------------------------------------------
CREATE TABLE `report` (
  `id` varchar(191) NOT NULL,
  `student_id` varchar(191) NOT NULL,
  `mentor_id` varchar(191) DEFAULT NULL,
  `period_start` datetime(3) NOT NULL,
  `period_end` datetime(3) NOT NULL,
  `summary_achievements` text DEFAULT NULL,
  `summary_general` text DEFAULT NULL,
  `summary_parents` text DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'draft',
  PRIMARY KEY (`id`),
  KEY `Report_student_id_fkey` (`student_id`),
  KEY `Report_mentor_id_fkey` (`mentor_id`),
  CONSTRAINT `report_mentor_id_fkey` FOREIGN KEY (`mentor_id`) REFERENCES `mentor` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `report_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
