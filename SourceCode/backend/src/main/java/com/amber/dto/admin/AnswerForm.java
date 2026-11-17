package com.amber.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AnswerForm(
        @NotBlank(message = "Please write an answer")
        @Size(max = 2000, message = "Keep the answer under 2000 characters")
        String answer
) {
}
