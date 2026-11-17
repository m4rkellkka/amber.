package com.amber.dto.admin;

import com.amber.entity.Question;

import java.time.Instant;

/** Question as the admin sees it: with product and the author's email. */
public record AdminQuestionDto(Long id, Long productId, String productName, String productSlug,
                               String text, String authorName, String authorEmail, Instant createdAt,
                               String answer, Instant answeredAt) {

    public static AdminQuestionDto from(Question q) {
        return new AdminQuestionDto(q.getId(), q.getProduct().getId(), q.getProduct().getName(),
                q.getProduct().getSlug(), q.getText(), q.getUser().getDisplayName(), q.getUser().getEmail(),
                q.getCreatedAt(), q.getAnswer(), q.getAnsweredAt());
    }
}
