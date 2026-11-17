package com.amber.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateQuestionRequest(
        @NotBlank(message = "Please write your question")
        @Size(max = 1000, message = "Please keep the question under 1000 characters")
        String text
) {
}
