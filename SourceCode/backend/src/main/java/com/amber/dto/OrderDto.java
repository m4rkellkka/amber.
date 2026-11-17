package com.amber.dto;

import com.amber.entity.Order;
import com.amber.entity.OrderItem;
import com.amber.entity.OrderStatus;
import com.amber.entity.ProductType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;

/** An order as shown to its owner (and later to the admin). */
public record OrderDto(
        Long id,
        OrderStatus status,
        BigDecimal totalPrice,
        String brief,
        Instant createdAt,
        List<ItemDto> items
) {
    public record ItemDto(Long productId, String productName, ProductType type,
                          int quantity, BigDecimal unitPrice, BigDecimal lineTotal) {

        static ItemDto from(OrderItem item) {
            return new ItemDto(
                    item.getProduct().getId(),
                    item.getProductName(),
                    item.getProduct().getType(),
                    item.getQuantity(),
                    item.getUnitPrice(),
                    item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }
    }

    public static OrderDto from(Order order) {
        return new OrderDto(
                order.getId(),
                order.getStatus(),
                order.getTotalPrice(),
                order.getBrief(),
                order.getCreatedAt(),
                order.getItems().stream()
                        .map(ItemDto::from)
                        .sorted(Comparator.comparing(ItemDto::type)) // package first, then add-ons
                        .toList());
    }
}
