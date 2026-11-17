package com.amber.service;

import com.amber.dto.admin.AdminSummaryDto;
import com.amber.entity.OrderStatus;
import com.amber.repository.OrderRepository;
import com.amber.repository.ProductRepository;
import com.amber.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/** Collects the numbers for the admin Overview tab with a few aggregate queries. */
@Service
public class AdminSummaryService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final QuestionRepository questionRepository;

    public AdminSummaryService(OrderRepository orderRepository, ProductRepository productRepository,
                               QuestionRepository questionRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.questionRepository = questionRepository;
    }

    @Transactional(readOnly = true)
    public AdminSummaryDto getSummary() {
        Map<OrderStatus, Long> byStatus = new EnumMap<>(OrderStatus.class);
        for (OrderStatus s : OrderStatus.values()) {
            byStatus.put(s, 0L);
        }
        for (Object[] row : orderRepository.countByStatus()) {
            byStatus.put((OrderStatus) row[0], (Long) row[1]);
        }
        long total = byStatus.values().stream().mapToLong(Long::longValue).sum();

        return new AdminSummaryDto(
                byStatus,
                total,
                orderRepository.sumTotalByStatusIn(List.of(OrderStatus.DONE)),
                orderRepository.sumTotalByStatusIn(List.of(OrderStatus.NEW, OrderStatus.IN_PROGRESS)),
                productRepository.sumOpenSlots(),
                questionRepository.countByAnswerIsNull(),
                productRepository.countByActiveTrue());
    }
}
