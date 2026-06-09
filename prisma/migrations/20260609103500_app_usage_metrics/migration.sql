-- AlterTable
ALTER TABLE `app_usage_logs`
    ADD COLUMN `active_seconds` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `idle_seconds`   INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `mouse_clicks`   INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `keystrokes`     INTEGER NOT NULL DEFAULT 0;
