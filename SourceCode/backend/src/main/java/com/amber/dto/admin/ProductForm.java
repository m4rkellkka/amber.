package com.amber.dto.admin;

import com.amber.entity.ProductType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

/** "Add product" form. Package-only rules (delivery days) are checked in ProductService. */
public record ProductForm(
        @NotNull(message = "Choose package or add-on")
        ProductType type,

        @NotBlank(message = "Name is required")
        @Size(max = 80, message = "Name must be at most 80 characters")
        String name,

        /* Optional: generated from the name when empty. */
        @Pattern(regexp = "^$|^[a-z0-9]+(-[a-z0-9]+)*$",
                message = "Use lowercase letters, numbers and dashes, e.g. landing-page")
        @Size(max = 80, message = "Slug must be at most 80 characters")
        String slug,

        @NotBlank(message = "Short description is required")
        @Size(max = 160, message = "Keep it under 160 characters")
        String shortDescription,

        @Size(max = 4000, message = "Keep it under 4000 characters")
        String description,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "1", message = "Price must be at least $1")
        @DecimalMax(value = "100000", message = "Price must be at most $100,000")
        @Digits(integer = 6, fraction = 2, message = "Use at most two decimals")
        BigDecimal price,

        @Min(value = 1, message = "At least 1 day")
        @Max(value = 365, message = "At most 365 days")
        Integer deliveryDays,

        @Size(max = 12, message = "At most 12 features")
        /* Empty lines are ignored by the service. */
        List<@Size(max = 120, message = "Each feature must be at most 120 characters") String> features,

        /* Open slots this month; null = unlimited. */
        @Min(value = 0, message = "Slots cannot be negative")
        @Max(value = 99, message = "At most 99 slots")
        Integer stock,

        /* Add-ons only: may the client order more than one? null = no. */
        Boolean allowMultiple
) {
}
