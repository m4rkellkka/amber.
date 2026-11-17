package com.amber.dto;

import com.amber.entity.Question;

import java.time.Instant;

/**
 * A question as shown on the product page. Only the author's first name is public, never the email.
 * {@code mine} lets the page mark the viewer's own questions.
 */
public record QuestionDto(
        Long id,
        String text,
        String authorName,
        Instant createdAt,
        String answer,
        Instant answeredAt,
        boolean mine
) {
    public static QuestionDto from(Question q, Long viewerId) {
        return new QuestionDto(
                q.getId(),
                q.getText(),
                firstName(q.getUser().getDisplayName()),
                q.getCreatedAt(),
                q.getAnswer(),
                q.getAnsweredAt(),
                q.getUser().getId().equals(viewerId));
    }

    private static String firstName(String displayName) {
        if (displayName == null || displayName.isBlank()) {
            return "A client";
        }
        return displayName.trim().split("\\s+")[0];
    }
}
