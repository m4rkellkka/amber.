package com.amber.service;

import com.amber.dto.ProductDto;
import com.amber.entity.ProductType;
import com.amber.exception.NotFoundException;
import com.amber.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Read-only catalog logic: only active products are visible to clients. */
@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /** All active products, or only one type when {@code type} is given. */
    public List<ProductDto> getCatalog(ProductType type) {
        var products = (type == null)
                ? productRepository.findAllByActiveTrueOrderByIdAsc()
                : productRepository.findAllByActiveTrueAndTypeOrderByIdAsc(type);
        return products.stream().map(ProductDto::from).toList();
    }

    public ProductDto getBySlug(String slug) {
        return productRepository.findBySlugAndActiveTrue(slug)
                .map(ProductDto::from)
                .orElseThrow(() -> new NotFoundException("Product '" + slug + "' not found"));
    }
}
