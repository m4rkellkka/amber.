package com.amber.dto;

import com.amber.entity.Product;
import com.amber.entity.ProductType;

import java.math.BigDecimal;
import java.util.List;

/** Product data sent to the browser (the entity itself never leaves the back-end). */
public record ProductDto(
        Long id,
        String name,
        String slug,
        String shortDescription,
        String description,
        ProductType type,
        BigDecimal price,
        Integer deliveryDays,
        List<String> features,
        Integer stock,
        boolean allowMultiple
) {
    public static ProductDto from(Product p) {
        return new ProductDto(
                p.getId(),
                p.getName(),
                p.getSlug(),
                p.getShortDescription(),
                p.getDescription(),
                p.getType(),
                p.getPrice(),
                p.getDeliveryDays(),
                List.copyOf(p.getFeatures()),
                p.getStock(),
                p.isAllowMultiple()
        );
    }
}
