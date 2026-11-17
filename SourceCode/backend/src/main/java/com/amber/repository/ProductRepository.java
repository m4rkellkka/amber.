package com.amber.repository;

import com.amber.entity.Product;
import com.amber.entity.ProductType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;

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

    /**
     * Reads a product and locks its row until the transaction ends (SELECT ... FOR UPDATE).
     * Two clients ordering the last slot at the same moment are handled one after another,
     * so stock can never go below zero.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findByIdForUpdate(Long id);
}
