package com.amber.controller;

import com.amber.dto.ProductDto;
import com.amber.entity.ProductType;
import com.amber.service.ProductService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Public catalog endpoints. The controller only maps HTTP to service calls. */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /** GET /api/products or /api/products?type=PACKAGE|ADDON */
    @GetMapping
    public List<ProductDto> list(@RequestParam(required = false) ProductType type) {
        return productService.getCatalog(type);
    }

    /** GET /api/products/landing-page */
    @GetMapping("/{slug}")
    public ProductDto get(@PathVariable String slug) {
        return productService.getBySlug(slug);
    }
}
