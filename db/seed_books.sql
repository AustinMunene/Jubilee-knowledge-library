-- Seed 5 real books for Jubilee Knowledge Library
-- Run this in Supabase SQL Editor
-- This script checks for duplicates before inserting
--
-- IMPORTANT: If you get an error about "description" column not existing,
-- run db/add_description_column.sql first to add the column.

-- Ensure description column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'books' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE books ADD COLUMN description text;
  END IF;
END $$;

-- Book 1: Narrative and Numbers
INSERT INTO books (title, author, category, description, total_copies, available_copies, cover_url)
SELECT 
  'Narrative and Numbers',
  'Aswath Damodaran',
  'Finance',
  'A comprehensive guide to valuation that bridges the gap between storytelling and numbers. Learn how to value companies by combining narrative elements with quantitative analysis, making investment decisions more informed and strategic.',
  3,
  3,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM books WHERE title = 'Narrative and Numbers' AND author = 'Aswath Damodaran'
);

-- Book 2: Value Investing
INSERT INTO books (title, author, category, description, total_copies, available_copies, cover_url)
SELECT 
  'Value Investing: From Graham to Buffett and Beyond (2nd Ed.)',
  'Bruce Greenwald',
  'Finance',
  'An authoritative exploration of value investing principles from Benjamin Graham to Warren Buffett. This second edition provides updated insights and practical frameworks for identifying undervalued securities and building long-term wealth.',
  3,
  3,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM books WHERE title = 'Value Investing: From Graham to Buffett and Beyond (2nd Ed.)' AND author = 'Bruce Greenwald'
);

-- Book 3: A Random Walk Down Wall Street
INSERT INTO books (title, author, category, description, total_copies, available_copies, cover_url)
SELECT 
  'A Random Walk Down Wall Street: The Time-Tested Strategy for Successful Investing',
  'Burton Malkiel',
  'Finance',
  'A classic investment guide that explains why a diversified portfolio of index funds is the most reliable path to long-term wealth. Malkiel debunks market timing and stock picking myths while providing evidence-based strategies for individual investors.',
  3,
  3,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM books WHERE title = 'A Random Walk Down Wall Street: The Time-Tested Strategy for Successful Investing' AND author = 'Burton Malkiel'
);

-- Book 4: The Handbook of Fixed Income Securities
INSERT INTO books (title, author, category, description, total_copies, available_copies, cover_url)
SELECT 
  'The Handbook of Fixed Income Securities',
  'Frank J. Fabozzi',
  'Finance',
  'The definitive reference for fixed income markets, covering bonds, derivatives, and structured products. Essential reading for finance professionals seeking to understand debt instruments, yield curves, and portfolio management strategies.',
  3,
  3,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM books WHERE title = 'The Handbook of Fixed Income Securities' AND author = 'Frank J. Fabozzi'
);

-- Book 5: The Venture Mindset
INSERT INTO books (title, author, category, description, total_copies, available_copies, cover_url)
SELECT 
  'The Venture Mindset',
  'Ilya Strebulaev and Alex Dang',
  'Business',
  'A practical guide to thinking like a venture capitalist, whether you''re an entrepreneur, investor, or corporate leader. Learn how to evaluate opportunities, make bold decisions, and build high-growth businesses using VC principles.',
  3,
  3,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM books WHERE title = 'The Venture Mindset' AND author = 'Ilya Strebulaev and Alex Dang'
);

-- Verify the inserts
SELECT title, author, category, available_copies FROM books ORDER BY created_at DESC LIMIT 5;

