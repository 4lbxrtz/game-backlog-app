CREATE DATABASE IF NOT EXISTS gamebacklog_db;
USE gamebacklog_db;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Games table (metadata from IGDB)
CREATE TABLE games (
    id INT PRIMARY KEY, -- IGDB game ID
    title VARCHAR(255) NOT NULL,
    cover_url VARCHAR(500),
    description TEXT,
    release_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE genres (
    id INT PRIMARY KEY, -- IGDB genre ID
    name VARCHAR(100) NOT NULL
);

CREATE TABLE platforms (
    id INT PRIMARY KEY, -- IGDB platform ID
    name VARCHAR(100) NOT NULL
);

CREATE TABLE game_genres (
    game_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (game_id, genre_id),
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
);

CREATE TABLE game_platforms (
    game_id INT NOT NULL,
    platform_id INT NOT NULL,
    PRIMARY KEY (game_id, platform_id),
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
);

-- User-Game relationship (user's collection)
CREATE TABLE user_games (
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    status ENUM('Wishlist', 'Backlog', 'Playing', 'Completed', 'Abandoned') DEFAULT 'Backlog',
    personal_rating DECIMAL(2,1) CHECK (personal_rating >= 0.0 AND personal_rating <= 5.0),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, game_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- Logs/Sessions table
CREATE TABLE logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    platform_id INT,
    time_played INT,  -- in minutes
    start_date DATE,
    end_date DATE,
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id, game_id) REFERENCES user_games(user_id, game_id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE SET NULL
);

-- Custom lists
CREATE TABLE lists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Games in lists
CREATE TABLE list_games (
    list_id INT NOT NULL,
    game_id INT NOT NULL,
    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    PRIMARY KEY (list_id, game_id)
);

-- Indexes for performance
CREATE INDEX idx_user_games_user ON user_games(user_id);
CREATE INDEX idx_user_games_status ON user_games(status);

insert into games (id, title, cover_url, description, release_date) values
(34666, 'Ricky Raccoon', '//images.igdb.com/igdb/image/upload/t_cover_big_2x/co8eys.jpg', "Little Ricky Raccoon joins his grandpa's treasure hunt at the Amazon River!", '2017-05-23'),
(534, 'The Legend of Zelda: Skyward Sword', '//images.igdb.com/igdb/image/upload/t_cover_big_2x/co5wrj.jpg', 'The Legend of Zelda: Skyward Sword is the first Zelda game created specifically with the Wii in mind. The game makes use of the Wii MotionPlus peripheral for sword fighting, with a revised Wii Remote pointing system used for targeting. Skyward Sword is structured very similar to previous Zelda games, as you travel through an overworld in search of temples to visit and once in you solve a series of puzzles before fighting a boss at the end and receive the next bit of plot. The biggest change is that the overworld is more focused on puzzles with only a handful of action.', '2011-11-18'),
(377238, 'Elden Ring Nightreign - The Forsaken Hollows', '//images.igdb.com/igdb/image/upload/t_cover_big_2x/coau1e.jpg', 'The DLC will feature two new nightfaring warriors as playable characters:
- Scholar: An academic who walks the Lands Between. Boasting impressive arcane levels, he gains incredible advantages through battlefield observation.
- Undertaker: An abbess who was mandated to slay the Nightlord. Boasting impressive strength and faith, she sends enemies to the afterlife with ruthless efficiency.
It also features the new Limveld enemy type, and a new area: Shifting Earth: The Great Hollow, a great cavity in the depths of Limveld. The hollow is strewn with exotic ruins and temples; sacred towers denoting the remains of an ancient people; and crystals that exude a cursed, life-draining miasma.', '2025-12-04');
insert into users (username, email, password_hash) values
('prueba', 'prueba@gmail.com', '$argon2id$v=19$m=65536,t=3,p=1$YFo4z0x4QTmFHEYVwZQyOA$+aGAGUif/rZdWxktnFDOTZo3qrBv3YTtEIqK0qX1t+M');