package com.amber.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/** A service package or an add-on that clients can order. */
@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    /** URL-friendly unique name, e.g. "landing-page". */
    @Column(nullable = false, unique = true)
    private String slug;

    @Column(name = "short_description", nullable = false)
    private String shortDescription;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ProductType type;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    /** Days to deliver; null for add-ons. */
    @Column(name = "delivery_days")
    private Integer deliveryDays;

    @ElementCollection
    @CollectionTable(name = "product_features", joinColumns = @JoinColumn(name = "product_id"))
    @OrderColumn(name = "position")
    @Column(name = "feature", nullable = false)
    private List<String> features = new ArrayList<>();

    /** Open slots for this month; null means unlimited (used for add-ons). */
    private Integer stock;

    /** True when the client may order more than one, e.g. "Extra page". */
    @Column(name = "allow_multiple", nullable = false)
    private boolean allowMultiple = false;

    /** Inactive products are hidden from the catalog but kept for old orders. */
    @Column(nullable = false)
    private boolean active = true;
}
