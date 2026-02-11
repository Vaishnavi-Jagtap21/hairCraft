package com.haircraft.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
		System.out.println("hii");
	}

	@org.springframework.context.annotation.Bean
	public org.springframework.boot.CommandLineRunner fixSchema(org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
		return args -> {
			System.out.println("--- CHECKING DB SCHEMA ---");
			try {
				// 1. Identify incorrect FKs
				java.util.List<java.util.Map<String, Object>> fks = jdbcTemplate.queryForList(
					"SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE " +
					"WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'appointment' AND COLUMN_NAME = 'service_id' AND REFERENCED_TABLE_NAME IS NOT NULL"
				);
				
				boolean correctFkExists = false;

				for (java.util.Map<String, Object> fk : fks) {
					String name = (String) fk.get("CONSTRAINT_NAME");
					String refTable = (String) fk.get("REFERENCED_TABLE_NAME");
					
					if ("hair_services".equalsIgnoreCase(refTable)) {
						correctFkExists = true;
						System.out.println("Found correct FK: " + name);
					} else {
						System.out.println("Dropping incorrect FK: " + name + " referencing " + refTable);
						try {
							jdbcTemplate.execute("ALTER TABLE appointment DROP FOREIGN KEY " + name);
						} catch (Exception e) {
							System.err.println("Failed to drop FK " + name + ": " + e.getMessage());
						}
					}
				}
				
				// 2. Add correct FK if missing
				if (!correctFkExists) {
					System.out.println("Adding correct FK to hair_services...");
					
					// Fix data integrity first: Update service_id to a valid one if it doesn't exist in hair_services
                    // This prevents "Cannot add or update a child row" error when adding the constraint
					try {
						Long validId = jdbcTemplate.queryForObject("SELECT id FROM hair_services LIMIT 1", Long.class);
						if (validId != null) {
                            int updated = jdbcTemplate.update(
                                "UPDATE appointment SET service_id = ? WHERE service_id NOT IN (SELECT id FROM hair_services)", 
                                validId
                            );
                            if (updated > 0) System.out.println("Fixed " + updated + " appointments with invalid service_ids.");
                        } else {
                             // If no services exist, we can't really enforce FK, but strict mode might require it. 
                             // Set to NULL if column allows, or we are in trouble.
                             // Appointment.java says nullable=false.
                             // We should probably ensure at least one service exists.
                             System.err.println("WARNING: No hair_services found! Cannot safely apply FK.");
                        }

						jdbcTemplate.execute("ALTER TABLE appointment ADD CONSTRAINT FK_appointment_hair_services FOREIGN KEY (service_id) REFERENCES hair_services(id)");
						System.out.println("Correct FK added.");
					} catch (Exception e) {
						System.err.println("Failed to add FK: " + e.getMessage());
					}
				}
                
                // 3. Print stats
				System.out.println("hair_services count: " + jdbcTemplate.queryForObject("SELECT count(*) FROM hair_services", Long.class));
				System.out.println("appointment count: " + jdbcTemplate.queryForObject("SELECT count(*) FROM appointment", Long.class));

			} catch (Exception e) {
				System.err.println("DB Schema Check failed: " + e.getMessage());
				e.printStackTrace();
			}
			System.out.println("--- DB SCHEMA CHECK COMPLETE ---");
		};
	}
}
