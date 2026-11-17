package com.amber.dto.admin;

import com.amber.entity.OrderStatus;

import java.math.BigDecimal;
import java.util.Map;

/** Numbers for the admin Overview tab. */
public record AdminSummaryDto(
        Map<OrderStatus, Long> ordersByStatus,
        long totalOrders,
        /* Sum of launched (DONE) orders. */
        BigDecimal revenue,
        /* Value of orders that are received or in progress. */
        BigDecimal pipeline,
        int openSlots,
        long unansweredQuestions,
        long activeProducts
) {
}
