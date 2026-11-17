package com.amber.controller;

import com.amber.dto.CreateQuestionRequest;
import com.amber.dto.QuestionDto;
import com.amber.security.AuthUser;
import com.amber.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Product questions. GET is public (SecurityConfig permits GET /api/products/**);
 * POST needs a signed-in user. {@code user} is null for anonymous visitors.
 */
@RestController
@RequestMapping("/api/products/{productId}/questions")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping
    public List<QuestionDto> list(@PathVariable Long productId, @AuthenticationPrincipal AuthUser user) {
        return questionService.listForProduct(productId, user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public QuestionDto ask(@PathVariable Long productId, @AuthenticationPrincipal AuthUser user,
                           @Valid @RequestBody CreateQuestionRequest request) {
        return questionService.ask(productId, user, request.text());
    }
}
