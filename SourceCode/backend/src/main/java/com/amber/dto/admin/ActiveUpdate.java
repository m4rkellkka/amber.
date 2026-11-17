package com.amber.dto.admin;

import jakarta.validation.constraints.NotNull;

/** Show (true) or hide (false) a product in the catalog. */
public record ActiveUpdate(@NotNull(message = "Active is required") Boolean active) {
}
