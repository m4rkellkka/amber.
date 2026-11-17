package com.amber.repository;

import com.amber.entity.Order;
import com.amber.entity.OrderStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    /** One user's orders, newest first, with items and products loaded in one go. */
    @EntityGraph(attributePaths = {"items", "items.product"})
    List<Order> findAllByUserIdOrderByCreatedAtDescIdDesc(Long userId);

    /** Admin view: all orders with customer and items, newest first. */
    @EntityGraph(attributePaths = {"user", "items", "items.product"})
    List<Order> findAllByOrderByCreatedAtDescIdDesc();

    @EntityGraph(attributePaths = {"user", "items", "items.product"})
    Optional<Order> findWithItemsById(Long id);

    /** Rows of [status, count]. */
    @Query("select o.status, count(o) from Order o group by o.status")
    List<Object[]> countByStatus();

    @Query("select coalesce(sum(o.totalPrice), 0) from Order o where o.status in :statuses")
    BigDecimal sumTotalByStatusIn(List<OrderStatus> statuses);
}
