-- ================================================================
-- Add Stylists to the Database
-- ================================================================
-- Use this file to add new stylists to your HairCraft application
-- ================================================================

USE haircraft;

-- First, let's view existing stylists
SELECT * FROM stylist;

-- ================================================================
-- ADD NEW STYLISTS
-- ================================================================
-- Fields: name, specialization, active, capacity
-- ================================================================

-- Stylist 1: Hair Color Expert
INSERT INTO stylist (name, specialization, active, capacity) 
VALUES ('Sarah Johnson', 'Hair Coloring & Highlights', TRUE, 8);

-- Stylist 2: Men's Grooming Specialist
INSERT INTO stylist (name, specialization, active, capacity) 
VALUES ('Michael Brown', 'Men\'s Haircuts & Beard Styling', TRUE, 10);

-- Stylist 3: Bridal & Event Specialist
INSERT INTO stylist (name, specialization, active, capacity) 
VALUES ('Emily Davis', 'Bridal Styling & Updos', TRUE, 6);

-- Stylist 4: Cutting Expert
INSERT INTO stylist (name, specialization, active, capacity) 
VALUES ('James Wilson', 'Precision Cuts & Styling', TRUE, 10);

-- Stylist 5: Treatment Specialist
INSERT INTO stylist (name, specialization, active, capacity) 
VALUES ('Lisa Martinez', 'Hair Treatments & Spa Services', TRUE, 7);

-- ================================================================
-- VERIFY THE NEW STYLISTS
-- ================================================================
SELECT id, name, specialization, active, capacity 
FROM stylist 
ORDER BY id DESC;

-- ================================================================
-- OPTIONAL: Update existing stylist
-- ================================================================
-- UPDATE stylist 
-- SET name = 'New Name', 
--     specialization = 'New Specialization',
--     active = TRUE,
--     capacity = 10
-- WHERE id = 1;

-- ================================================================
-- OPTIONAL: Deactivate a stylist (don't delete, just set inactive)
-- ================================================================
-- UPDATE stylist 
-- SET active = FALSE 
-- WHERE id = 1;

-- ================================================================
-- OPTIONAL: Delete a stylist (use carefully!)
-- ================================================================
-- DELETE FROM stylist WHERE id = 1;

-- ================================================================
-- View All Stylists with Appointment Count
-- ================================================================
SELECT 
    s.id,
    s.name,
    s.specialization,
    s.active,
    s.capacity,
    COUNT(a.id) as total_appointments
FROM stylist s
LEFT JOIN appointment a ON s.id = a.stylist_id
GROUP BY s.id, s.name, s.specialization, s.active, s.capacity
ORDER BY s.active DESC, s.name;
