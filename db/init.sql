CREATE TABLE IF NOT EXISTS "users" (
    "telegram_user_id" VARCHAR(255) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "state" SMALLINT DEFAULT 0,
    "thing_type" VARCHAR(255) DEFAULT NULL,
    "remaining_usage" SMALLINT DEFAULT 0,
    "level" VARCHAR(50) DEFAULT NULL,
    "created_at" timestamptz DEFAULT NOW(),
    "updated_at" timestamptz DEFAULT NULL,
    "latest_usage_at" timestamptz DEFAULT NULL,
    PRIMARY KEY(telegram_user_id)
);