# amber

Personal web studio: clients pick a service package (website, chatbot, dashboard), add extras,
place an order and track it. Built for the CEN301 Web Design and Programming course project.

## Stack

- Front-end: React, TypeScript, Vite, Material UI
- Back-end: Java 21, Spring Boot, Spring Security, PostgreSQL
- Auth: Firebase Authentication (ID tokens verified on the back-end with the Firebase Admin SDK)

## Structure

```
SourceCode/
  frontend/   React app
  backend/    Spring Boot app (application.properties included)
  database/   PostgreSQL dump
```

## Running locally

Requirements: Java 21, Node.js 20+, PostgreSQL 16.

### 1. Database

```bash
createdb -U postgres amber
```

Tables are created by Hibernate on the first start, and the starting catalog is seeded automatically.

### 2. Back-end (port 8080)

```bash
cd SourceCode/backend
cp local.properties.example local.properties   # put the admin email(s) here
./mvnw spring-boot:run
```

Settings (all optional, with local defaults) live in `src/main/resources/application.properties`:

| Env var | Default | Purpose |
|---|---|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | `jdbc:postgresql://localhost:5432/amber`, `postgres`, empty | Database connection |
| `FIREBASE_CREDENTIALS_PATH` | `~/.secrets/amber-firebase-adminsdk.json` | Firebase service-account key (never committed) |
| `FIREBASE_CREDENTIALS_JSON` | empty | The same key as JSON text, for hosting |
| `ADMIN_EMAILS` | empty | Comma-separated admin emails (or set in `local.properties`) |
| `CORS_ORIGINS` | `http://localhost:5173` | Front-end address allowed to call the API |
| `SEED_DEMO` | `false` | Load demo clients, orders and questions (for presentations only) |

Without the Firebase key the public catalog still works, but sign-in is disabled.

Tests use a separate database: `createdb -U postgres amber_test && ./mvnw test`.
There are unit tests for the order rules (`OrderServiceTest`, Mockito, no database) and
integration tests for every API area (`security`, `order`, `question`, `admin`), with Firebase mocked.

### 3. Front-end (port 5173)

```bash
cd SourceCode/frontend
npm install
npm run dev
```

Open http://localhost:5173. In development, requests to `/api` are forwarded to the back-end on port 8080.

## Security model

- The browser signs in with Firebase Authentication (email + password or Google) and sends the Firebase ID token with every API request.
- `FirebaseTokenFilter` verifies the token with the Firebase Admin SDK and creates or updates the user in the `users` table.
- Roles (`USER` / `ADMIN`) live in the database. A user becomes `ADMIN` only if their email is in `ADMIN_EMAILS` **and** Firebase has verified that they own it.
- `/api/admin/**` requires `ADMIN`; the catalog is public; everything else requires sign-in.
