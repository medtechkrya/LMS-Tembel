-- ============================================================
-- Migration: Add unique PIN to mentor table & populate PINs
-- ============================================================

-- 1. Add pin column if not exists
ALTER TABLE `mentor` ADD COLUMN `pin` VARCHAR(191) NULL UNIQUE;

-- 2. Populate 6-digit unique PIN for existing active mentors
UPDATE `mentor` SET `pin` = '862335' WHERE `name` = 'Ryan';
UPDATE `mentor` SET `pin` = '765461' WHERE `name` = 'Spartan';
UPDATE `mentor` SET `pin` = '304932' WHERE `name` = 'Dinda';
UPDATE `mentor` SET `pin` = '964539' WHERE `name` = 'Syifa';
UPDATE `mentor` SET `pin` = '544197' WHERE `name` = 'Sari';
UPDATE `mentor` SET `pin` = '762477' WHERE `name` = 'Ms Wahyu';
UPDATE `mentor` SET `pin` = '426033' WHERE `name` = 'Yaya';
UPDATE `mentor` SET `pin` = '849731' WHERE `name` = 'Fendy';
UPDATE `mentor` SET `pin` = '228162' WHERE `name` = 'Nanda';
UPDATE `mentor` SET `pin` = '368921' WHERE `name` = 'John';
UPDATE `mentor` SET `pin` = '859961' WHERE `name` = 'Arya';
UPDATE `mentor` SET `pin` = '853948' WHERE `name` = 'Dhisa';
UPDATE `mentor` SET `pin` = '911653' WHERE `name` = 'Muklis';
UPDATE `mentor` SET `pin` = '185293' WHERE `name` = 'Friendian';
UPDATE `mentor` SET `pin` = '337221' WHERE `name` = 'Rifqi';
UPDATE `mentor` SET `pin` = '197089' WHERE `name` = 'Katarina';
UPDATE `mentor` SET `pin` = '270893' WHERE `name` = 'Berlyanna';
UPDATE `mentor` SET `pin` = '532307' WHERE `name` = 'Mezza';