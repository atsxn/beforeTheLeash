-- =============================================================================
-- Before the leash – Database Schema
-- Auto-executed on first container start via docker-entrypoint-initdb.d
-- =============================================================================

CREATE TABLE IF NOT EXISTS dog_food_products (
    id              SERIAL PRIMARY KEY,
    product_name    VARCHAR(255)   NOT NULL,
    brand           VARCHAR(100),
    price_thb       NUMERIC(10,2)  NOT NULL CHECK (price_thb > 0),
    weight_kg       NUMERIC(6,2),
    price_per_kg    NUMERIC(10,2)  GENERATED ALWAYS AS (
                        CASE WHEN weight_kg > 0 THEN price_thb / weight_kg ELSE NULL END
                    ) STORED,
    source_url      TEXT,
    is_active       BOOLEAN        DEFAULT TRUE,
    scraped_at      TIMESTAMPTZ    DEFAULT NOW(),
    created_at      TIMESTAMPTZ    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_brand        ON dog_food_products (brand);
CREATE INDEX IF NOT EXISTS idx_food_is_active    ON dog_food_products (is_active);
CREATE INDEX IF NOT EXISTS idx_food_scraped_at   ON dog_food_products (scraped_at DESC);

-- ---------------------------------------------------------------------------
-- ETL run logs (audit trail for every Airflow DAG run)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scrape_logs (
    id                  SERIAL PRIMARY KEY,
    dag_run_id          VARCHAR(200)  NOT NULL,
    source_name         VARCHAR(100)  NOT NULL,   
    records_scraped     INT           DEFAULT 0,
    records_inserted    INT           DEFAULT 0,
    records_skipped     INT           DEFAULT 0,
    status              VARCHAR(20)   CHECK (status IN ('success','partial','failed')),
    error_message       TEXT,
    started_at          TIMESTAMPTZ   DEFAULT NOW(),
    finished_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_logs_dag_run  ON scrape_logs (dag_run_id);
CREATE INDEX IF NOT EXISTS idx_logs_status   ON scrape_logs (status);
CREATE INDEX IF NOT EXISTS idx_logs_source   ON scrape_logs (source_name);

-- ---------------------------------------------------------------------------
-- Game Data: Dog Breeds (ข้อมูลสายพันธุ์สุนัข)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS breeds (
    id_breed        SERIAL PRIMARY KEY,
    breeds_name     VARCHAR(100) NOT NULL,
    size            VARCHAR(50),
    hp              INT DEFAULT 0,
    happy           INT DEFAULT 0,
    hunger          INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_breeds_name ON breeds (breeds_name);
   
-- ---------------------------------------------------------------------------
-- Game Data: Users (ข้อมูลผู้เล่นเกม)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id         SERIAL PRIMARY KEY,
    devicename      VARCHAR(100) UNIQUE NOT NULL,
    balance         NUMERIC(10,2) DEFAULT 0.00,
    id_breed        INT NOT NULL REFERENCES breeds(id_breed) ON DELETE CASCADE,
    question_score  INT DEFAULT 0,
    hp_score        INT DEFAULT 50,
    current_day     INT DEFAULT 1,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Game Data: Questions (คำถามในเกม)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS questions (
    question_id     SERIAL PRIMARY KEY,
    scenario_text   TEXT NOT NULL,
    breed_id        INT REFERENCES breeds(id_breed) ON DELETE CASCADE,
    current_day     INT NOT NULL,
    answer_text     TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Game Data: Choices (ตัวเลือกการตอบและผลกระทบต่อสุนัข)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS choices (
    choice_id           SERIAL PRIMARY KEY,
    question_id         INT NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
    choice_text         TEXT NOT NULL,
    is_correct          BOOLEAN NOT NULL,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_choices_question ON choices (question_id);
