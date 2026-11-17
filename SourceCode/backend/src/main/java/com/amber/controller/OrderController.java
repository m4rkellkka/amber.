package com.amber.controller;

import com.amber.dto.CreateOrderRequest;
import com.amber.dto.OrderDto;
import com.amber.security.AuthUser;
import com.amber.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/** Orders of the signed-in user. Requires a valid token (see SecurityConfig). */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /** POST /api/orders  { "items": [{ "productId": 1, "quantity": 1 }], "brief": "..." } */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderDto create(@AuthenticationPrincipal AuthUser user, @Valid @RequestBody CreateOrderRequest request) {
        return orderService.placeOrder(user.id(), request);
    }
}
