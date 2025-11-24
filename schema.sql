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