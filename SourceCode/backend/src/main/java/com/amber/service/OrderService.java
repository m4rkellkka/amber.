package com.amber.service;

import com.amber.dto.CreateOrderRequest;
import com.amber.dto.OrderDto;
import com.amber.dto.admin.AdminOrderDto;
import com.amber.entity.OrderStatus;
import com.amber.exception.NotFoundException;
import com.amber.entity.Order;
import com.amber.entity.OrderItem;
import com.amber.entity.Product;
import com.amber.entity.ProductType;
import com.amber.entity.User;
import com.amber.exception.BusinessRuleException;
import com.amber.exception.NoSlotsAvailableException;
import com.amber.repository.OrderRepository;
import com.amber.repository.ProductRepository;
import com.amber.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Business rules for orders:
 * 1. exactly one PACKAGE (quantity 1) plus any ADDONs;
 * 2. an add-on can have quantity > 1 only if it allows it (e.g. "Extra page");
 * 3. prices are always taken from the database, never from the client;
 * 4. a package with stock 0 cannot be ordered (409); taking a slot happens in the same transaction.
 */
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    /** All or nothing: if any rule fails, nothing is saved and no slot is taken. */
    @Transactional
    public OrderDto placeOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.getReferenceById(userId);
        Order order = new Order();
        order.setUser(user);
        order.setBrief(request.brief() == null || request.brief().isBlank() ? null : request.brief().trim());

        Set<Long> seen = new HashSet<>();
        int packages = 0;
        BigDecimal total = BigDecimal.ZERO;

        for (CreateOrderRequest.Item line : request.items()) {
            if (!seen.add(line.productId())) {
                throw new BusinessRuleException("Each product can appear only once in an order");
            }
            // Lock the row: stock is read and changed without another order slipping in between.
            Product product = productRepository.findByIdForUpdate(line.productId())
                    .filter(Product::isActive)
                    .orElseThrow(() -> new BusinessRuleException("Product " + line.productId() + " is not available"));

            if (product.getType() == ProductType.PACKAGE) {
                packages++;
                if (line.quantity() != 1) {
                    throw new BusinessRuleException("A package can be ordered only once per order");
                }
                takeSlot(product);
            } else if (line.quantity() > 1 && !product.isAllowMultiple()) {
                throw new BusinessRuleException(product.getName() + " can be added only once");
            }

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(line.quantity());
            item.setProductName(product.getName());      // snapshot for order history
            item.setUnitPrice(product.getPrice());       // price from the database
            order.addItem(item);
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(line.quantity())));
        }

        if (packages != 1) {
            throw new BusinessRuleException("An order must contain exactly one package");
        }

        order.setTotalPrice(total);
        return OrderDto.from(orderRepository.saveAndFlush(order));
    }

    /** Purchase history: only the signed-in user's own orders, newest first. */
    @Transactional(readOnly = true)
    public List<OrderDto> getMyOrders(Long userId) {
        return orderRepository.findAllByUserIdOrderByCreatedAtDescIdDesc(userId).stream()
                .map(OrderDto::from)
                .toList();
    }

    // ---------- admin ----------

    @Transactional(readOnly = true)
    public List<AdminOrderDto> listAllForAdmin() {
        return orderRepository.findAllByOrderByCreatedAtDescIdDesc().stream().map(AdminOrderDto::from).toList();
    }

    /**
     * Admin moves an order along: NEW -> IN_PROGRESS -> DONE, or cancels it.
     * Cancelling gives the package slot back; a cancelled order cannot be reopened.
     */
    @Transactional
    public AdminOrderDto changeStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findWithItemsById(orderId)
                .orElseThrow(() -> new NotFoundException("Order " + orderId + " not found"));
        if (order.getStatus() == newStatus) {
            return AdminOrderDto.from(order);
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessRuleException("A cancelled order cannot be reopened");
        }
        if (newStatus == OrderStatus.CANCELLED) {
            returnSlot(order);
        }
        order.setStatus(newStatus);
        return AdminOrderDto.from(order);
    }

    private void returnSlot(Order order) {
        order.getItems().stream()
                .filter(i -> i.getProduct().getType() == ProductType.PACKAGE)
                .findFirst()
                .flatMap(i -> productRepository.findByIdForUpdate(i.getProduct().getId()))
                .filter(p -> p.getStock() != null)
                .ifPresent(p -> p.setStock(p.getStock() + 1));
    }

    /** null stock = unlimited; otherwise one order takes one slot. */
    private static void takeSlot(Product product) {
        Integer stock = product.getStock();
        if (stock == null) {
            return;
        }
        if (stock <= 0) {
            throw new NoSlotsAvailableException(product.getName());
        }
        product.setStock(stock - 1); // saved automatically at commit (JPA dirty checking)
    }
}
