package com.amber.config;

import com.amber.entity.*;
import com.amber.repository.OrderRepository;
import com.amber.repository.ProductRepository;
import com.amber.repository.QuestionRepository;
import com.amber.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;

/**
 * Demo clients, orders and questions for presentations. Off by default, so a public site never
 * shows invented clients; turn on with SEED_DEMO=true (or app.seed-demo=true in local.properties).
 * Runs once: skipped when the demo users already exist. Demo users cannot sign in (fake Firebase ids).
 */
@Component
@org.springframework.core.annotation.Order(2) // after DataSeeder (the catalog must exist)
@ConditionalOnProperty(name = "app.seed-demo", havingValue = "true")
public class DemoDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    private final UserRepository users;
    private final ProductRepository products;
    private final OrderRepository orders;
    private final QuestionRepository questions;
    private final JdbcTemplate jdbc;

    public DemoDataSeeder(UserRepository users, ProductRepository products, OrderRepository orders,
                          QuestionRepository questions, JdbcTemplate jdbc) {
        this.users = users;
        this.products = products;
        this.orders = orders;
        this.questions = questions;
        this.jdbc = jdbc;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (users.findByFirebaseUid("demo-aylin").isPresent()) {
            return;
        }
        User aylin = user("demo-aylin", "Aylin Kaya", "aylin.demo@example.com");
        User daniel = user("demo-daniel", "Daniel Brooks", "daniel.demo@example.com");
        User elena = user("demo-elena", "Elena Petrova", "elena.demo@example.com");
        User mert = user("demo-mert", "Mert Demir", "mert.demo@example.com");

        order(aylin, OrderStatus.DONE, 24, "Small boutique hotel in Karaköy, 9 rooms. Guests write mostly at night.",
                Map.of("hospitality-starter", 1, "translations", 1, "support-month", 1));
        order(aylin, OrderStatus.DONE, 15, "Bookings and revenue by month from our Google Sheet.",
                Map.of("analytics-dashboard", 1));
        order(daniel, OrderStatus.IN_PROGRESS, 6, "Site for an English tutoring school: courses, teachers, prices, contact.",
                Map.of("business-website", 1, "extra-page", 2, "basic-seo", 1));
        order(elena, OrderStatus.NEW, 1, "FAQ bot for a café on Instagram and WhatsApp: menu, hours, table requests.",
                Map.of("ai-chatbot", 1, "crm-sync", 1));
        order(mert, OrderStatus.CANCELLED, 12, "Landing page for a weekend pottery workshop.",
                Map.of("landing-page", 1, "domain-hosting", 1));

        question(aylin, "hospitality-starter", 30,
                "Can the chatbot answer guests in Turkish and English at the same time?",
                "Yes. The bot replies in the language the guest writes in, and you edit both versions in one place.");
        question(daniel, "business-website", 9,
                "Will I be able to change prices on the site myself after launch?",
                "Yes. The admin panel lets you edit texts, prices and photos without touching any code.");
        question(mert, "landing-page", 13,
                "If I order today, when can you start?",
                "Within two or three days while there is an open slot this month.");
        question(elena, "ai-chatbot", 0,
                "Does it work with a WhatsApp Business number I already have?", null);

        log.info("Demo data created: 4 clients, 5 orders, 4 questions");
    }

    private User user(String uid, String name, String email) {
        User u = new User();
        u.setFirebaseUid(uid);
        u.setDisplayName(name);
        u.setEmail(email);
        return users.save(u);
    }

    private void order(User user, OrderStatus status, int daysAgo, String brief, Map<String, Integer> items) {
        Order order = new Order();
        order.setUser(user);
        order.setStatus(status);
        order.setBrief(brief);
        BigDecimal total = BigDecimal.ZERO;
        for (var entry : items.entrySet()) {
            Product p = products.findBySlugAndActiveTrue(entry.getKey()).orElseThrow();
            OrderItem item = new OrderItem();
            item.setProduct(p);
            item.setQuantity(entry.getValue());
            item.setProductName(p.getName());
            item.setUnitPrice(p.getPrice());
            order.addItem(item);
            total = total.add(p.getPrice().multiply(BigDecimal.valueOf(entry.getValue())));
        }
        order.setTotalPrice(total);
        Order saved = orders.saveAndFlush(order);
        // created_at is set automatically on insert; move it into the past so the history looks real
        jdbc.update("update orders set created_at = ? where id = ?", ago(daysAgo), saved.getId());
    }

    private void question(User user, String slug, int daysAgo, String text, String answer) {
        Question q = new Question();
        q.setUser(user);
        q.setProduct(products.findBySlugAndActiveTrue(slug).orElseThrow());
        q.setText(text);
        if (answer != null) {
            q.setAnswer(answer);
            q.setAnsweredAt(Instant.now().minus(Duration.ofDays(daysAgo)).plus(Duration.ofHours(5)));
        }
        Question saved = questions.saveAndFlush(q);
        jdbc.update("update questions set created_at = ? where id = ?", ago(daysAgo), saved.getId());
    }

    private static Timestamp ago(int days) {
        return Timestamp.from(Instant.now().minus(Duration.ofDays(days)).minus(Duration.ofHours(3)));
    }
}
