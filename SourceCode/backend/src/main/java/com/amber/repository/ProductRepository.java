package com.amber.repository;

import com.amber.entity.Product;
import com.amber.entity.ProductType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // @EntityGraph loads features in the same query (avoids one extra query per product).
    @EntityGraph(attributePaths = "features")
    List<Product> findAllByActiveTrueOrderByIdAsc();

    @EntityGraph(attributePaths = "features")
    List<Product> findAllByActiveTrueAndTypeOrderByIdAsc(ProductType type);

    @EntityGraph(attributePaths = "features")
    Optional<Product> findBySlugAndActiveTrue(String slug);
}
