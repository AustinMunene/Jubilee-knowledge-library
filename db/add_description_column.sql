-- Add description column to books table if it doesn't exist
-- Run this in Supabase SQL Editor before running seed_books.sql

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'books' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE books ADD COLUMN description text;
    RAISE NOTICE 'Added description column to books table';
  ELSE
    RAISE NOTICE 'Description column already exists';
  END IF;
END $$;

