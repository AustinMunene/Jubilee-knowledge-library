-- Seed data for Jubilee Knowledge Library
-- Run this in your Supabase SQL Editor after running schema.sql
-- This creates sample books for testing

-- Insert sample books (only if table is empty or you want to add more)
INSERT INTO books (title, author, category, description, total_copies, available_copies, cover_url)
VALUES
  (
    'The Psychology of Money',
    'Morgan Housel',
    'Business',
    'Timeless lessons on wealth, greed, and happiness. Explore how people think about money and make financial decisions.',
    5,
    5,
    NULL
  ),
  (
    'How Innovation Works',
    'Matt Ridley',
    'Science',
    'A fascinating exploration of how innovation happens, from ancient times to the modern era.',
    3,
    3,
    NULL
  ),
  (
    'Company of One',
    'Paul Jarvis',
    'Business',
    'Why staying small is the next big thing for business. A refreshing approach to entrepreneurship.',
    4,
    4,
    NULL
  ),
  (
    'The Bees',
    'Laline Paull',
    'Fiction',
    'A gripping tale of a bee who challenges the strict social hierarchy of her hive.',
    2,
    2,
    NULL
  ),
  (
    'Real Help',
    'Ayodeji Awosika',
    'Self-Help',
    'Practical advice for building a meaningful life and career without the fluff.',
    3,
    3,
    NULL
  ),
  (
    'The Fact of a Body',
    'Alexandria Marzano-Lesnevich',
    'True Crime',
    'A memoir and true crime investigation that explores the nature of truth and justice.',
    2,
    2,
    NULL
  ),
  (
    'The Room',
    'Jonas Karlsson',
    'Fiction',
    'A surreal office novel about a man who discovers a secret room that only he can see.',
    3,
    3,
    NULL
  ),
  (
    'Through the Breaking',
    'Cate Emond',
    'Fantasy',
    'An epic fantasy adventure about a young hero discovering their true power.',
    4,
    4,
    NULL
  ),
  (
    'Clean Code',
    'Robert C. Martin',
    'Technology',
    'A handbook of agile software craftsmanship. Learn to write code that is clean, readable, and maintainable.',
    5,
    5,
    NULL
  ),
  (
    'Designing Data-Intensive Applications',
    'Martin Kleppmann',
    'Technology',
    'The big ideas behind reliable, scalable, and maintainable systems.',
    3,
    3,
    NULL
  )
ON CONFLICT DO NOTHING;

-- Note: You can add cover URLs later by updating the books table
-- UPDATE books SET cover_url = 'https://your-image-url.com/image.jpg' WHERE title = 'The Psychology of Money';

