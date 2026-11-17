package com.amber.service;

import com.amber.dto.ProductDto;
import com.amber.dto.admin.AdminProductDto;
import com.amber.dto.admin.ProductForm;
import com.amber.entity.Product;
import com.amber.entity.ProductType;
import com.amber.exception.ConflictException;
import com.amber.exception.BusinessRuleException;
import com.amber.exception.NotFoundException;
import com.amber.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

/** Catalog logic: public reads (active products only) and admin changes. */
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

    // ---------- admin ----------

    public List<AdminProductDto> listAllForAdmin() {
        return productRepository.findAllByOrderByTypeAscIdAsc().stream().map(AdminProductDto::from).toList();
    }

    @Transactional
    public AdminProductDto create(ProductForm form) {
        boolean isPackage = form.type() == ProductType.PACKAGE;
        if (isPackage && form.deliveryDays() == null) {
            throw new BusinessRuleException("Delivery days are required for a package");
        }
        String slug = (form.slug() == null || form.slug().isBlank()) ? slugify(form.name()) : form.slug();
        if (slug.isEmpty()) {
            throw new BusinessRuleException("Please use Latin letters or numbers in the name, or set a slug");
        }
        if (productRepository.existsBySlug(slug)) {
            throw new ConflictException("The address '" + slug + "' is already used by another product");
        }

        Product p = new Product();
        p.setType(form.type());
        p.setName(form.name().trim());
        p.setSlug(slug);
        p.setShortDescription(form.shortDescription().trim());
        p.setDescription(form.description() == null || form.description().isBlank() ? null : form.description().trim());
        p.setPrice(form.price());
        p.setDeliveryDays(isPackage ? form.deliveryDays() : null);
        p.setStock(form.stock());
        p.setAllowMultiple(!isPackage && Boolean.TRUE.equals(form.allowMultiple()));
        if (form.features() != null) {
            form.features().stream().map(String::trim).filter(f -> !f.isEmpty()).forEach(p.getFeatures()::add);
        }
        return AdminProductDto.from(productRepository.save(p));
    }

    /** Admin sets open slots for this month (null = unlimited). */
    @Transactional
    public AdminProductDto updateStock(Long id, Integer stock) {
        Product p = find(id);
        p.setStock(stock);
        return AdminProductDto.from(p);
    }

    /** Hidden products disappear from the catalog but stay in old orders. */
    @Transactional
    public AdminProductDto setActive(Long id, boolean active) {
        Product p = find(id);
        p.setActive(active);
        return AdminProductDto.from(p);
    }

    private Product find(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product " + id + " not found"));
    }

    /** "Café Website!" -> "cafe-website" */
    static String slugify(String name) {
        String ascii = Normalizer.normalize(name, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return ascii.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }
}
