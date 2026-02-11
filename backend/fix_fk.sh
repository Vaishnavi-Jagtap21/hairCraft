#!/bin/bash
# This script fixes the foreign key constraint issue for appointment.service_id

echo "Connecting to database..."

# Get the constraint name
CONSTRAINT_NAME=$(mysql -u 2NGWQfbu4rx2QPk.root -pJ2CkbHge0qKmuYKl \
  -h gateway01.ap-southeast-1.prod.aws.tidbcloud.com -P 4000 haircraft \
  --ssl-mode=VERIFY_IDENTITY -se "
  SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = 'haircraft' 
  AND TABLE_NAME = 'appointment'
  AND COLUMN_NAME = 'service_id'
  AND REFERENCED_TABLE_NAME IS NOT NULL
  LIMIT 1;
")

echo "Found constraint: $CONSTRAINT_NAME"

if [ ! -z "$CONSTRAINT_NAME" ]; then
  echo "Dropping existing constraint..."
  mysql -u 2NGWQfbu4rx2QPk.root -pJ2CkbHge0qKmuYKl \
    -h gateway01.ap-southeast-1.prod.aws.tidbcloud.com -P 4000 haircraft \
    --ssl-mode=VERIFY_IDENTITY -e "
    ALTER TABLE appointment DROP FOREIGN KEY $CONSTRAINT_NAME;
  "
fi

echo "Creating new constraint to hair_services..."
mysql -u 2NGWQfbu4rx2QPk.root -pJ2CkbHge0qKmuYKl \
  -h gateway01.ap-southeast-1.prod.aws.tidbcloud.com -P 4000 haircraft \
  --ssl-mode=VERIFY_IDENTITY -e "
  ALTER TABLE appointment 
  ADD CONSTRAINT FK_appointment_hair_services 
  FOREIGN KEY (service_id) REFERENCES hair_services(id);
"

echo "Done! Constraint fixed."
