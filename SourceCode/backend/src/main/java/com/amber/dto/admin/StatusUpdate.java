package com.amber.dto.admin;

import com.amber.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record StatusUpdate(@NotNull(message = "Status is required") OrderStatus status) {
}
