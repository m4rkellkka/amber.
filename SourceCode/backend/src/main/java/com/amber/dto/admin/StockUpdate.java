package com.amber.dto.admin;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/** New number of open slots; null = unlimited. */
public record StockUpdate(
        @Min(value = 0, message = "Slots cannot be negative")
        @Max(value = 99, message = "At most 99 slots")
        Integer stock
) {
}
