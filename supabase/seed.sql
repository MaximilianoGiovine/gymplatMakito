-- Seed Exercises
INSERT INTO exercises (name, description, difficulty, is_premium, equipment) VALUES
('Push Up', 'Standard push up', 'beginner', false, 'bodyweight'),
('Squat', 'Bodyweight squat', 'beginner', false, 'bodyweight'),
('Deadlift', 'Barbell deadlift', 'advanced', true, 'barbell'),
('Bench Press', 'Barbell bench press', 'intermediate', false, 'barbell'),
('Water Bottle Curls', 'Bicep curls using 6L water bottles', 'beginner', false, 'household items');

-- Seed Recipes
INSERT INTO recipes (title, description, ingredients, is_premium, image_url) VALUES
('Classic Oatmeal', 'Simple oats with honey', '["oats", "water", "honey"]', false, 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf'),
('Premium Avocado Toast', 'Sourdough with avocado and organic eggs', '["sourdough", "avocado", "eggs", "chili flakes"]', true, 'https://images.unsplash.com/photo-1588137372308-15f75323a399'),
('Yogurt Casero con Avena', 'Yogurt casero con avena, almendras y chía activada', '["yogurt", "avena", "almendras", "chia"]', false, 'https://images.unsplash.com/photo-1488477181946-6428a029177b');
