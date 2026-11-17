package com.amber.order;

import com.amber.ApiTestBase;
import com.amber.entity.Product;
import com.amber.entity.ProductType;
import com.amber.repository.OrderRepository;
import com.amber.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Business rules of POST /api/orders, checked through the real API and database. */
class OrderIntegrationTest extends ApiTestBase {

    @Autowired
    private ProductRepository products;

    @Autowired
    private OrderRepository orders;

    private String auth;

    @BeforeEach
    void signIn() {
        auth = tokenFor("t-buyer", "uid-buyer", "buyer@test.dev", true);
    }

    private long id(String slug) {
        return products.findBySlugAndActiveTrue(slug).orElseThrow().getId();
    }

    private Product newPackage(int stock, boolean active) {
        Product p = new Product();
        p.setName("Test package " + System.nanoTime());
        p.setSlug("test-" + System.nanoTime());
        p.setShortDescription("Test");
        p.setType(ProductType.PACKAGE);
        p.setPrice(new BigDecimal("100.00"));
        p.setDeliveryDays(3);
        p.setStock(stock);
        p.setActive(active);
        return products.save(p);
    }

    private ResultActions order(String json) throws Exception {
        return mvc.perform(post("/api/orders").header("Authorization", auth)
                .contentType(MediaType.APPLICATION_JSON).content(json));
    }

    @Test
    void placesOrderWithPricesFromDatabaseAndTakesOneSlot() throws Exception {
        Product pkg = newPackage(2, true);
        // The client tries to send its own prices: they must be ignored.
        order("""
                {"items": [
                   {"productId": %d, "quantity": 2, "unitPrice": 1},
                   {"productId": %d, "quantity": 1, "unitPrice": 1}
                 ],
                 "totalPrice": 1, "brief": "  Hotel site  "}
                """.formatted(id("extra-page"), pkg.getId()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("NEW"))
                .andExpect(jsonPath("$.totalPrice").value(260.00))   // 100 + 2 x 80
                .andExpect(jsonPath("$.brief").value("Hotel site"))
                .andExpect(jsonPath("$.items[0].type").value("PACKAGE"))
                .andExpect(jsonPath("$.items[1].lineTotal").value(160.00));

        assertThat(products.findById(pkg.getId()).orElseThrow().getStock()).isEqualTo(1);
    }

    @Test
    void soldOutPackageIs409AndNothingIsSaved() throws Exception {
        Product pkg = newPackage(0, true);
        long ordersBefore = orders.count();
        order("""
                {"items": [{"productId": %d, "quantity": 1}]}
                """.formatted(pkg.getId()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value(pkg.getName() + " is fully booked for this month"));
        assertThat(orders.count()).isEqualTo(ordersBefore);
    }

    @Test
    void failedRuleDoesNotTakeASlot() throws Exception {
        Product pkg = newPackage(1, true);
        // Package is valid, but "translations" cannot have quantity 2 -> whole order rolls back.
        order("""
                {"items": [{"productId": %d, "quantity": 1}, {"productId": %d, "quantity": 2}]}
                """.formatted(pkg.getId(), id("translations")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("EN / TR / RU can be added only once"));
        assertThat(products.findById(pkg.getId()).orElseThrow().getStock()).isEqualTo(1);
    }

    @Test
    void orderWithoutPackageIs400() throws Exception {
        order("""
                {"items": [{"productId": %d, "quantity": 1}]}
                """.formatted(id("basic-seo")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("An order must contain exactly one package"));
    }

    @Test
    void orderWithTwoPackagesIs400() throws Exception {
        order("""
                {"items": [{"productId": %d, "quantity": 1}, {"productId": %d, "quantity": 1}]}
                """.formatted(newPackage(5, true).getId(), newPackage(5, true).getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("An order must contain exactly one package"));
    }

    @Test
    void inactiveProductIs400() throws Exception {
        order("""
                {"items": [{"productId": %d, "quantity": 1}]}
                """.formatted(newPackage(5, false).getId()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void emptyOrderShowsFieldError() throws Exception {
        order("""
                {"items": []}
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.items").value("Choose a package"));
    }

    @Test
    void myOrdersShowsOnlyOwnOrdersNewestFirst() throws Exception {
        Product pkg = newPackage(5, true);
        String body = "{\"items\": [{\"productId\": %d, \"quantity\": 1}], \"brief\": \"%s\"}";
        order(body.formatted(pkg.getId(), "first")).andExpect(status().isCreated());
        order(body.formatted(pkg.getId(), "second")).andExpect(status().isCreated());

        String other = tokenFor("t-other", "uid-other", "other@test.dev", true);
        mvc.perform(post("/api/orders").header("Authorization", other).contentType(MediaType.APPLICATION_JSON)
                        .content(body.formatted(pkg.getId(), "not yours")))
                .andExpect(status().isCreated());

        mvc.perform(get("/api/orders/my").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.brief == 'not yours')]").isEmpty())
                .andExpect(jsonPath("$[0].brief").value("second"))
                .andExpect(jsonPath("$[0].items[0].productName").value(pkg.getName()));

        mvc.perform(get("/api/orders/my").header("Authorization", other))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].brief").value("not yours"));
    }

    @Test
    void myOrdersNeedsSignIn() throws Exception {
        mvc.perform(get("/api/orders/my")).andExpect(status().isUnauthorized());
    }

    @Test
    void anonymousCannotOrder() throws Exception {
        mvc.perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON).content("{\"items\": []}"))
                .andExpect(status().isUnauthorized());
    }
}
