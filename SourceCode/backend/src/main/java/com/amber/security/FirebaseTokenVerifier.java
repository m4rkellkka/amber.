package com.amber.security;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Checks Firebase ID tokens with the Firebase Admin SDK (signature, expiry, project).
 * Credentials come from a service-account JSON: either its content (env var, for hosting)
 * or a file path (local machine). Without credentials the public catalog still works,
 * but every token is rejected.
 */
@Component
public class FirebaseTokenVerifier {

    private static final Logger log = LoggerFactory.getLogger(FirebaseTokenVerifier.class);

    private final FirebaseAuth firebaseAuth;

    public FirebaseTokenVerifier(@Value("${app.firebase.credentials-json:}") String credentialsJson,
                                 @Value("${app.firebase.credentials-path:}") String credentialsPath) {
        this.firebaseAuth = init(credentialsJson, credentialsPath);
    }

    public VerifiedToken verify(String idToken) {
        if (firebaseAuth == null) {
            throw new InvalidTokenException("Firebase is not configured on the server", null);
        }
        try {
            FirebaseToken token = firebaseAuth.verifyIdToken(idToken);
            return new VerifiedToken(token.getUid(), token.getEmail(), token.getName(), token.isEmailVerified());
        } catch (FirebaseAuthException | IllegalArgumentException e) {
            throw new InvalidTokenException("Invalid or expired token", e);
        }
    }

    private static FirebaseAuth init(String credentialsJson, String credentialsPath) {
        try (InputStream credentials = openCredentials(credentialsJson, credentialsPath)) {
            if (credentials == null) {
                log.warn("Firebase credentials not found: sign-in is disabled. "
                        + "Set FIREBASE_CREDENTIALS_PATH or FIREBASE_CREDENTIALS_JSON.");
                return null;
            }
            GoogleCredentials googleCredentials = GoogleCredentials.fromStream(credentials);
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(googleCredentials)
                    .build();
            FirebaseApp app = FirebaseApp.getApps().isEmpty()
                    ? FirebaseApp.initializeApp(options)
                    : FirebaseApp.getInstance();
            String projectId = googleCredentials instanceof ServiceAccountCredentials sa ? sa.getProjectId() : "unknown";
            log.info("Firebase initialized for project {}", projectId);
            return FirebaseAuth.getInstance(app);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot read Firebase credentials", e);
        }
    }

    private static InputStream openCredentials(String json, String path) throws IOException {
        if (json != null && !json.isBlank()) {
            return new ByteArrayInputStream(json.getBytes(StandardCharsets.UTF_8));
        }
        if (path != null && !path.isBlank() && Files.isRegularFile(Path.of(path))) {
            return new FileInputStream(path);
        }
        return null;
    }
}
