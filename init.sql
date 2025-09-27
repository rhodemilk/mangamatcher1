-- MangaMatcher Database Initialization Script
-- This script runs when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist (this is handled by POSTGRES_DB env var)
-- But we can add any initial setup here

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Create initial admin user (optional)
-- This would be used if you want to seed the database with initial data

-- Sample manga data for development
INSERT INTO manga (title, author, genre, rating, created_at) VALUES
('Attack on Titan', 'Hajime Isayama', 'Action', 9.5, NOW()),
('One Piece', 'Eiichiro Oda', 'Adventure', 9.8, NOW()),
('Naruto', 'Masashi Kishimoto', 'Action', 9.2, NOW()),
('Death Note', 'Tsugumi Ohba', 'Thriller', 9.7, NOW()),
('Fullmetal Alchemist', 'Hiromu Arakawa', 'Fantasy', 9.6, NOW()),
('Dragon Ball', 'Akira Toriyama', 'Action', 9.0, NOW()),
('Bleach', 'Tite Kubo', 'Action', 8.8, NOW()),
('My Hero Academia', 'Kohei Horikoshi', 'Superhero', 9.1, NOW()),
('Demon Slayer', 'Koyoharu Gotouge', 'Action', 9.4, NOW()),
('Tokyo Ghoul', 'Sui Ishida', 'Horror', 8.9, NOW())
ON CONFLICT DO NOTHING;

-- Sample users for development
INSERT INTO "user" (username, email, created_at) VALUES
('admin', 'admin@mangamatcher.dev', NOW()),
('testuser', 'test@example.com', NOW()),
('manga_fan', 'fan@manga.com', NOW())
ON CONFLICT (username) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_manga_genre ON manga(genre);
CREATE INDEX IF NOT EXISTS idx_manga_rating ON manga(rating);
CREATE INDEX IF NOT EXISTS idx_manga_author ON manga(author);
CREATE INDEX IF NOT EXISTS idx_user_username ON "user"(username);
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);

-- Grant permissions (if needed for additional users)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
