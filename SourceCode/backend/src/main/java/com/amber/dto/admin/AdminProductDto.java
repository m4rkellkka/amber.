package com.amber.dto.admin;

import com.amber.entity.Product;
import com.amber.entity.ProductType;

import java.math.BigDecimal;

/** Product row in the admin Stock tab (includes inactive products). */
public record AdminProductDto(Long id, String name, String slug, ProductType type, BigDecimal price,
                              Integer deliveryDays, Integer stock, boolean allowMultiple, boolean active) {

    public static AdminProductDto from(Product p) {
        return new AdminProductDto(p.getId(), p.getName(), p.getSlug(), p.getType(), p.getPrice(),
                p.getDeliveryDays(), p.getStock(), p.isAllowMultiple(), p.isActive());
    }
}
