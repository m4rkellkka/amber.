package com.amber.repository;

import com.amber.entity.Product;
import com.amber.entity.ProductType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

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

    /** Admin view: every product, packages first. */
    List<Product> findAllByOrderByTypeAscIdAsc();

    boolean existsBySlug(String slug);

    long countByActiveTrue();

    /** Open slots across active packages (unlimited ones are not counted). */
    @Query("select coalesce(sum(p.stock), 0) from Product p "
            + "where p.active = true and p.type = com.amber.entity.ProductType.PACKAGE")
    int sumOpenSlots();

    /**
     * Reads a product and locks its row until the transaction ends (SELECT ... FOR UPDATE).
     * Two clients ordering the last slot at the same moment are handled one after another,
     * so stock can never go below zero.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findByIdForUpdate(Long id);
}
