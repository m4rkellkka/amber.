package com.amber.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * What the client sends to place an order: product ids and quantities only.
 * There is deliberately no price field: prices always come from the database.
 */
public record CreateOrderRequest(
        @NotEmpty(message = "Choose a package")
        @Size(max = 20, message = "Too many items")
        List<@Valid Item> items,

        @Size(max = 4000, message = "Please keep the brief under 4000 characters")
        String brief
) {
    public record Item(
            @NotNull(message = "Product is required")
            Long productId,

            @Min(value = 1, message = "Quantity must be at least 1")
            @Max(value = 20, message = "Quantity must be at most 20")
            int quantity
    ) {
    }
}
