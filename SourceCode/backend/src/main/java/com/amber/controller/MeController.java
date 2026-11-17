package com.amber.controller;

import com.amber.dto.UserDto;
import com.amber.security.AuthUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** GET /api/me: who am I and what is my role. Requires a valid token (see SecurityConfig). */
@RestController
public class MeController {

    @GetMapping("/api/me")
    public UserDto me(@AuthenticationPrincipal AuthUser user) {
        return UserDto.from(user);
    }
}
