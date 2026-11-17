package com.amber.dto;

import com.amber.entity.Role;
import com.amber.security.AuthUser;

/** The current user as the front-end sees it. */
public record UserDto(Long id, String email, String displayName, Role role) {

    public static UserDto from(AuthUser user) {
        return new UserDto(user.id(), user.email(), user.displayName(), user.role());
    }
}
