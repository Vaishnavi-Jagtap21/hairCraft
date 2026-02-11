package com.haircraft.backend.Entity;

public enum ServiceType {

    /**
     * Fixed-duration service.
     * Example:
     *  - Haircut (30 min)
     *  - Hair color (60 min)
     * These services block time strictly based on duration.
     */
    FIXED,

    /**
     * Long, continuous service.
     * Example:
     *  - Bridal makeup
     *  - Full makeover
     * These services block multiple time slots and
     * cannot be overlapped or squeezed in between.
     */
    CONTINUOUS
}

