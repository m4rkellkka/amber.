package com.amber.controller;

import com.amber.dto.admin.*;
import com.amber.service.AdminSummaryService;
import com.amber.service.OrderService;
import com.amber.service.ProductService;
import com.amber.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Everything the admin page calls. Protected twice: SecurityConfig allows /api/admin/** only for
 * ROLE_ADMIN, and @PreAuthorize repeats the check on the class in case the URL rule ever changes.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminSummaryService summaryService;
    private final ProductService productService;
    private final QuestionService questionService;
    private final OrderService orderService;

    public AdminController(AdminSummaryService summaryService, ProductService productService,
                           QuestionService questionService, OrderService orderService) {
        this.summaryService = summaryService;
        this.productService = productService;
        this.questionService = questionService;
        this.orderService = orderService;
    }

    // ----- Overview tab -----

    @GetMapping("/summary")
    public AdminSummaryDto summary() {
        return summaryService.getSummary();
    }

    // ----- Add product + Stock tabs -----

    @GetMapping("/products")
    public List<AdminProductDto> products() {
        return productService.listAllForAdmin();
    }

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminProductDto createProduct(@Valid @RequestBody ProductForm form) {
        return productService.create(form);
    }

    @PutMapping("/products/{id}/stock")
    public AdminProductDto updateStock(@PathVariable Long id, @Valid @RequestBody StockUpdate update) {
        return productService.updateStock(id, update.stock());
    }

    @PutMapping("/products/{id}/active")
    public AdminProductDto setActive(@PathVariable Long id, @Valid @RequestBody ActiveUpdate update) {
        return productService.setActive(id, update.active());
    }

    // ----- Questions tab -----

    /** GET /api/admin/questions?unanswered=true */
    @GetMapping("/questions")
    public List<AdminQuestionDto> questions(@RequestParam(defaultValue = "true") boolean unanswered) {
        return questionService.listForAdmin(unanswered);
    }

    @PutMapping("/questions/{id}/answer")
    public AdminQuestionDto answer(@PathVariable Long id, @Valid @RequestBody AnswerForm form) {
        return questionService.answer(id, form.answer());
    }

    // ----- Orders tab -----

    @GetMapping("/orders")
    public List<AdminOrderDto> orders() {
        return orderService.listAllForAdmin();
    }

    @PutMapping("/orders/{id}/status")
    public AdminOrderDto changeStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdate update) {
        return orderService.changeStatus(id, update.status());
    }
}
