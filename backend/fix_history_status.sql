-- Fix appointment_history status column to support all enum values
-- Run this SQL script to fix the data truncation error

USE haircraft;

-- Check current column definition
SHOW COLUMNS FROM appointment_history LIKE 'status';

-- Alter the status column to VARCHAR(50) to accommodate all possible status values
ALTER TABLE appointment_history 
MODIFY COLUMN status VARCHAR(50) NOT NULL;

-- Verify the change
SHOW COLUMNS FROM appointment_history LIKE 'status';

SELECT 'Column updated successfully!' as Result;
