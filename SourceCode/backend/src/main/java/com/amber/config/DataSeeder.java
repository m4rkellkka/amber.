package com.amber.config;

import com.amber.entity.Product;
import com.amber.entity.ProductType;
import com.amber.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/** Fills an empty database with the starting catalog. Does nothing if products already exist. */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final ProductRepository productRepository;

    public DataSeeder(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (productRepository.count() > 0) {
            return;
        }
        List<Product> catalog = List.of(
                pkg("Landing Page", "landing-page",
                        "One page with a lead form, deployed.",
                        "A single responsive page that explains what you do and collects requests from visitors. "
                                + "Good for a new product, an event or a small service.",
                        300, 7, 4,
                        List.of("One responsive page for phone and desktop",
                                "Lead form that sends requests to your email",
                                "Basic SEO tags",
                                "Deployed and ready to share",
                                "One round of revisions")),
                pkg("AI Chatbot", "ai-chatbot",
                        "Site, Telegram or WhatsApp bot for FAQs and requests.",
                        "A chatbot that answers common questions from your own texts and takes requests "
                                + "when you are offline, for example from hotel guests at night.",
                        500, 10, 3,
                        List.of("Answers FAQs from your own texts",
                                "Works on your site, Telegram or WhatsApp",
                                "Collects requests and forwards them to you",
                                "Simple way to update answers",
                                "Two weeks of tuning after launch")),
                pkg("Business Website", "business-website",
                        "Up to five pages with a simple admin panel.",
                        "A small company website with an admin panel, so you can change texts and photos yourself.",
                        700, 14, 2,
                        List.of("Up to five pages",
                                "Admin panel to edit texts and photos",
                                "Contact form and map",
                                "Basic SEO setup",
                                "Connected to your domain")),
                pkg("Analytics Dashboard", "analytics-dashboard",
                        "Charts and filters on top of your Sheets or database.",
                        "A dashboard that turns your spreadsheet or database into clear charts, "
                                + "so you see sales and bookings at a glance.",
                        600, 14, 2,
                        List.of("Connects to Google Sheets or your database",
                                "Key numbers, charts and filters",
                                "Access for your team",
                                "Data refreshes automatically",
                                "Short video guide")),
                pkg("Hospitality Starter", "hospitality-starter",
                        "Website plus booking chatbot, for hotels and cafés.",
                        "Everything a small hotel or café needs to start: a website and a chatbot "
                                + "that answers guests and takes bookings.",
                        1100, 21, 1,
                        List.of("Website with up to five pages",
                                "Booking and FAQ chatbot for guests",
                                "Texts in English, Turkish and Russian",
                                "Map and reviews block",
                                "One month of support")),
                addon("Extra page", "extra-page", "One more page in the same style.", 80, true),
                addon("EN / TR / RU", "translations", "Your site or bot in English, Turkish and Russian.", 150, false),
                addon("Basic SEO", "basic-seo", "Titles, descriptions, sitemap and Search Console setup.", 100, false),
                addon("Domain & hosting", "domain-hosting", "Domain connection and hosting setup.", 50, false),
                addon("1 month support", "support-month", "Fixes and small changes for 30 days after launch.", 120, false),
                addon("CRM / Sheets sync", "crm-sync", "Requests go straight to your CRM or Google Sheets.", 150, false)
        );
        productRepository.saveAll(catalog);
        log.info("Seeded {} products", catalog.size());
    }

    private static Product pkg(String name, String slug, String shortDescription, String description,
                               int price, int deliveryDays, int stock, List<String> features) {
        Product p = base(name, slug, shortDescription, price, ProductType.PACKAGE);
        p.setDescription(description);
        p.setDeliveryDays(deliveryDays);
        p.setStock(stock);
        p.getFeatures().addAll(features);
        return p;
    }

    private static Product addon(String name, String slug, String shortDescription, int price, boolean allowMultiple) {
        Product p = base(name, slug, shortDescription, price, ProductType.ADDON);
        p.setDescription(shortDescription);
        p.setAllowMultiple(allowMultiple);
        return p;
    }

    private static Product base(String name, String slug, String shortDescription, int price, ProductType type) {
        Product p = new Product();
        p.setName(name);
        p.setSlug(slug);
        p.setShortDescription(shortDescription);
        p.setPrice(BigDecimal.valueOf(price));
        p.setType(type);
        return p;
    }
}
