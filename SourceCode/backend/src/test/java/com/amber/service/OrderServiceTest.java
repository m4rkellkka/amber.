package com.amber.service;

import com.amber.dto.CreateOrderRequest;
import com.amber.dto.CreateOrderRequest.Item;
import com.amber.dto.OrderDto;
import com.amber.entity.*;
import com.amber.exception.BusinessRuleException;
import com.amber.exception.NoSlotsAvailableException;
import com.amber.repository.OrderRepository;
import com.amber.repository.ProductRepository;
import com.amber.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests of the order rules: no Spring, no database. Repositories are Mockito fakes,
 * so each rule is checked in isolation and the whole class runs in milliseconds.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;

    private OrderService service;
    private Product landing;
    private Product chatbot;
    private Product extraPage;
    private Product seo;

    @BeforeEach
    void setUp() {
        service = new OrderService(orderRepository, productRepository, userRepository);
        landing = product(1L, "Landing Page", ProductType.PACKAGE, "300.00", 2, false);
        chatbot = product(2L, "AI Chatbot", ProductType.PACKAGE, "500.00", 3, false);
        extraPage = product(10L, "Extra page", ProductType.ADDON, "80.00", null, true);
        seo = product(11L, "Basic SEO", ProductType.ADDON, "100.00", null, false);
        for (Product p : List.of(landing, chatbot, extraPage, seo)) {
            when(productRepository.findByIdForUpdate(p.getId())).thenReturn(Optional.of(p));
        }
        User user = new User();
        user.setId(7L);
        when(userRepository.getReferenceById(7L)).thenReturn(user);
        // saveAndFlush returns the same order with an id, like the database would
        when(orderRepository.saveAndFlush(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(100L);
            o.setCreatedAt(Instant.now());
            return o;
        });
    }

    private static Product product(Long id, String name, ProductType type, String price, Integer stock, boolean multiple) {
        Product p = new Product();
        p.setId(id);
        p.setName(name);
        p.setType(type);
        p.setPrice(new BigDecimal(price));
        p.setStock(stock);
        p.setAllowMultiple(multiple);
        return p;
    }

    private OrderDto place(Item... items) {
        return service.placeOrder(7L, new CreateOrderRequest(List.of(items), "brief"));
    }

    @Test
    void totalUsesDatabasePricesAndQuantities() {
        OrderDto order = place(new Item(1L, 1), new Item(10L, 3), new Item(11L, 1));
        assertThat(order.totalPrice()).isEqualByComparingTo("640.00"); // 300 + 3 x 80 + 100
        assertThat(order.items()).extracting(OrderDto.ItemDto::unitPrice)
                .containsExactly(new BigDecimal("300.00"), new BigDecimal("80.00"), new BigDecimal("100.00"));
    }

    @Test
    void takesExactlyOneSlotFromThePackage() {
        place(new Item(1L, 1));
        assertThat(landing.getStock()).isEqualTo(1);
    }

    @Test
    void unlimitedPackageKeepsNullStock() {
        landing.setStock(null);
        place(new Item(1L, 1));
        assertThat(landing.getStock()).isNull();
    }

    @Test
    void soldOutPackageIsRejectedAndNothingIsSaved() {
        landing.setStock(0);
        assertThatThrownBy(() -> place(new Item(1L, 1)))
                .isInstanceOf(NoSlotsAvailableException.class)
                .hasMessage("Landing Page is fully booked for this month");
        verify(orderRepository, never()).saveAndFlush(any());
    }

    @Test
    void orderWithoutPackageIsRejected() {
        assertThatThrownBy(() -> place(new Item(11L, 1)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("An order must contain exactly one package");
    }

    @Test
    void orderWithTwoPackagesIsRejected() {
        assertThatThrownBy(() -> place(new Item(1L, 1), new Item(2L, 1)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("An order must contain exactly one package");
    }

    @Test
    void packageQuantityMustBeOne() {
        assertThatThrownBy(() -> place(new Item(1L, 2)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("A package can be ordered only once per order");
    }

    @Test
    void singleUseAddonCannotHaveQuantityAboveOne() {
        assertThatThrownBy(() -> place(new Item(1L, 1), new Item(11L, 2)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("Basic SEO can be added only once");
    }

    @Test
    void sameProductTwiceIsRejected() {
        assertThatThrownBy(() -> place(new Item(1L, 1), new Item(10L, 1), new Item(10L, 1)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("Each product can appear only once in an order");
    }

    @Test
    void hiddenProductCannotBeOrdered() {
        seo.setActive(false);
        assertThatThrownBy(() -> place(new Item(1L, 1), new Item(11L, 1)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("Product 11 is not available");
    }

    @Test
    void cancellingReturnsTheSlotOnce() {
        Order order = existingOrder(OrderStatus.IN_PROGRESS);
        service.changeStatus(100L, OrderStatus.CANCELLED);
        assertThat(landing.getStock()).isEqualTo(3);
        assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);

        assertThatThrownBy(() -> service.changeStatus(100L, OrderStatus.NEW))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("A cancelled order cannot be reopened");
        assertThat(landing.getStock()).isEqualTo(3);
    }

    @Test
    void movingForwardDoesNotTouchStock() {
        existingOrder(OrderStatus.NEW);
        service.changeStatus(100L, OrderStatus.DONE);
        assertThat(landing.getStock()).isEqualTo(2);
    }

    private Order existingOrder(OrderStatus status) {
        User user = new User();
        user.setEmail("client@test.dev");
        Order order = new Order();
        order.setId(100L);
        order.setUser(user);
        order.setStatus(status);
        order.setTotalPrice(new BigDecimal("300.00"));
        order.setCreatedAt(Instant.now());
        OrderItem item = new OrderItem();
        item.setProduct(landing);
        item.setProductName(landing.getName());
        item.setUnitPrice(landing.getPrice());
        order.addItem(item);
        when(orderRepository.findWithItemsById(100L)).thenReturn(Optional.of(order));
        return order;
    }
}
