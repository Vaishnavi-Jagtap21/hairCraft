-- Fix foreign key constraint for appointment.service_id
-- Drop the incorrect foreign key constraint
ALTER TABLE appointment DROP FOREIGN KEY FK5ixajc1q1xjyvjnqiasyjuqqx;

-- Add correct foreign key constraint referencing hair_services.id
ALTER TABLE appointment 
ADD CONSTRAINT FK_appointment_hair_services 
FOREIGN KEY (service_id) REFERENCES hair_services(id);

-- Verify the constraint
SHOW CREATE TABLE appointment;
