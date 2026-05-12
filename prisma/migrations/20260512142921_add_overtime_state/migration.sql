-- AlterTable
ALTER TABLE `groups` ADD COLUMN `block_own_reports` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `state_logs` MODIFY `state` ENUM('working', 'overtime', 'break', 'wc', 'lunch', 'idle', 'offline') NOT NULL;
