USE gamebacklog_db;

-- ==========================================================
-- 1. CLEANUP & PREP (Optional: Clear existing user data to avoid conflicts)
-- ==========================================================
-- DELETE FROM list_games;
-- DELETE FROM lists;
-- DELETE FROM logs;
-- DELETE FROM user_games;
-- DELETE FROM users WHERE username LIKE 'BotUser_%' OR username = 'RetroGamer';

-- ==========================================================
-- 2. CREATE USERS (Stored Procedure to loop 40 times)
-- ==========================================================
DROP PROCEDURE IF EXISTS GenerateUsers;
DELIMITER //
CREATE PROCEDURE GenerateUsers()
BEGIN
    DECLARE i INT DEFAULT 1;
    -- Generic hash for 'password123'
    DECLARE pass_hash VARCHAR(255) DEFAULT '$2b$10$X7.1.1.1.1.1.1.1.1.1.1'; 
    
    -- 1. Create Main User (If not exists)
    INSERT IGNORE INTO users (id, username, email, password_hash) 
    VALUES (1, 'RetroGamer', 'retro@test.com', pass_hash);

    -- 2. Create 39 Bots
    WHILE i <= 39 DO
        INSERT IGNORE INTO users (username, email, password_hash) 
        VALUES (CONCAT('BotUser_', i), CONCAT('bot', i, '@test.com'), pass_hash);
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL GenerateUsers();

-- ==========================================================
-- 3. POPULATE GLOBAL RATINGS (Assign Hits to Many Users)
-- ==========================================================
-- We use a procedure to assign specific games to ALL users to ensure 
-- the "Global Rating" has plenty of data points.

DROP PROCEDURE IF EXISTS AssignPopularGames;
DELIMITER //
CREATE PROCEDURE AssignPopularGames()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE curr_user_id INT;
    DECLARE cur CURSOR FOR SELECT id FROM users;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO curr_user_id;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- --- A. ELDEN RING (119133) ---
        -- Everyone loves Elden Ring. High ratings.
        INSERT IGNORE INTO user_games (user_id, game_id, status, personal_rating, added_at) VALUES 
        (curr_user_id, 119133, 'Completed', (4.0 + (RAND() * 1.0)), NOW()); -- Rating between 4.0 and 5.0

        -- --- B. HOLLOW KNIGHT (14593) ---
        -- Indie hit.
        INSERT IGNORE INTO user_games (user_id, game_id, status, personal_rating, added_at) VALUES 
        (curr_user_id, 14593, 'Completed', (4.5 + (RAND() * 0.5)), NOW()); -- Rating 4.5 - 5.0

        -- --- C. ZELDA BOTW (7346) ---
        INSERT IGNORE INTO user_games (user_id, game_id, status, personal_rating, added_at) VALUES 
        (curr_user_id, 7346, 'Completed', (4.0 + (RAND() * 1.0)), NOW());

        -- --- D. BALDURS GATE 3 (Using God of War 549 as placeholder if BG3 ID missing, else swap) ---
        -- Inserting God of War (549)
        INSERT IGNORE INTO user_games (user_id, game_id, status, personal_rating, added_at) VALUES 
        (curr_user_id, 549, 'Playing', (4.5 + (RAND() * 0.5)), NOW());

        -- --- E. RANDOM BACKLOG ---
        -- Assign Cyberpunk (1877) to Backlog for half the users
        IF (RAND() > 0.5) THEN
            INSERT IGNORE INTO user_games (user_id, game_id, status, personal_rating, added_at) VALUES 
            (curr_user_id, 1877, 'Backlog', NULL, NOW());
        END IF;

        -- Assign Silksong... wait, Hollow Knight 365702 (Duplicate ID in list) as Wishlist
        INSERT IGNORE INTO user_games (user_id, game_id, status, personal_rating, added_at) VALUES 
        (curr_user_id, 365702, 'Wishlist', NULL, NOW());

    END LOOP;

    CLOSE cur;
END //
DELIMITER ;

CALL AssignPopularGames();

-- ==========================================================
-- 4. FILL "RETROGAMER" (User 1) WITH SPECIFIC DATA
-- ==========================================================
-- This makes your main profile look populated with the games you provided.

-- Playing
INSERT IGNORE INTO user_games (user_id, game_id, status, personal_rating) VALUES
(1, 113112, 'Playing', 4.5), -- Hades
(1, 26226, 'Playing', NULL),  -- Celeste
(1, 114283, 'Playing', 5.0); -- Persona 5 Royal

-- Completed (Masterpieces)
INSERT IGNORE INTO user_games (user_id, game_id, status, personal_rating) VALUES
(1, 1942, 'Completed', 5.0), -- Witcher 3
(1, 25076, 'Completed', 5.0), -- RDR2
(1, 204350, 'Completed', 4.5), -- Last of Us Part I
(1, 72, 'Completed', 5.0),    -- Portal 2
(1, 20, 'Completed', 4.0),    -- BioShock
(1, 12517, 'Completed', 4.5); -- Undertale

-- Backlog (To play)
INSERT IGNORE INTO user_games (user_id, game_id, status) VALUES
(1, 26472, 'Backlog'), -- Disco Elysium
(1, 11737, 'Backlog'), -- Outer Wilds
(1, 11133, 'Backlog'), -- Dark Souls III
(1, 103298, 'Backlog'); -- Doom Eternal

-- Wishlist
INSERT IGNORE INTO user_games (user_id, game_id, status) VALUES
(1, 119388, 'Wishlist'), -- Zelda TOTK
(1, 233651, 'Wishlist'); -- Metroid Dread

-- Cleanup procedures
DROP PROCEDURE IF EXISTS GenerateUsers;
DROP PROCEDURE IF EXISTS AssignPopularGames;

SELECT 'Database Seeded Successfully' as Status;