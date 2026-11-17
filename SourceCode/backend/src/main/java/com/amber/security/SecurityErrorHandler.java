package com.amber.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Security errors happen before controllers run, so @RestControllerAdvice cannot catch them.
 * This writes them in the same JSON "problem detail" shape: 401 = not signed in, 403 = not allowed.
 */
@Component
public class SecurityErrorHandler implements AuthenticationEntryPoint, AccessDeniedHandler {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        writeUnauthorized(request, response, "Please sign in to continue");
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        write(request, response, HttpStatus.FORBIDDEN, "You do not have access to this resource");
    }

    public void writeUnauthorized(HttpServletRequest request, HttpServletResponse response, String detail)
            throws IOException {
        write(request, response, HttpStatus.UNAUTHORIZED, detail);
    }

    private static void write(HttpServletRequest request, HttpServletResponse response,
                              HttpStatus status, String detail) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"status\":" + status.value()
                + ",\"title\":\"" + status.getReasonPhrase()
                + "\",\"detail\":\"" + escape(detail)
                + "\",\"instance\":\"" + escape(request.getRequestURI()) + "\"}");
    }

    private static String escape(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
