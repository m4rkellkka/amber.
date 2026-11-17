package com.amber.dto.admin;

import com.amber.dto.OrderDto;
import com.amber.entity.Order;

/** Order plus who placed it, for the admin Orders tab. */
public record AdminOrderDto(OrderDto order, String customerName, String customerEmail) {

    public static AdminOrderDto from(Order o) {
        return new AdminOrderDto(OrderDto.from(o), o.getUser().getDisplayName(), o.getUser().getEmail());
    }
}
