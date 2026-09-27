# Arfi-ID

Comprehensive README for the Arfi-ID project (backend + frontend).

Checklist
- [x] Inspect project structure (backend & frontend)
- [x] Document what the project does and its architecture
- [x] Describe backend endpoints, auth flows and environment variables
- [x] Describe frontend structure, API usage and how to run locally
- [x] Provide Docker / deployment notes and quick examples

Summary
Arfi-ID is an authentication & authorization service consisting of:
- Backend: a Spring Boot (Maven) service that implements cookie-based JWT authentication, refresh tokens, session management and acts as an OAuth provider for registered clients.
- Frontend: a React (Vite) application that consumes the backend APIs and provides user and admin UIs.

Repository layout (top-level)
- `arfi-id-backend/Backend` — Spring Boot backend (Maven). Key files:
  - `pom.xml`, `Dockerfile`, `compose.yaml`
  - `src/main/java/...` — packages for `controller`, `service`, `config` (security)
  - `src/main/resources/application.yml`, `application-dev.yml`, `application-prod.yml`, `*.env` files
- `arfi-id-frontend/` — React frontend (Vite). Key files:
  - `package.json`, `vite.config.js`, `vercel.json`
  - `src/lib/axios.js` — configured Axios instance (withCredentials: true)
  - `src/service/*.js` — `authService`, `sessionService`, `projectManagementService`
  - `src/pages/`, `src/components/`

What the project does
- Provides user authentication: register, login, refresh token, logout and current-user endpoints.
- Issues access and refresh tokens as HttpOnly cookies (for improved XSS protection) and uses JWTs for authorization.
- Provides session management (list and revoke sessions) and project/client management (connect/revoke/restore client access).
- Exposes an OAuth2-like provider interface to registered clients: validate client/redirect URIs, authorize, and token exchange endpoints.

Backend (overview)
Technologies: Java 17, Spring Boot, Spring Security, Spring Data JPA, PostgreSQL, jjwt, springdoc-openapi (Swagger), Lombok.

Important backend files
- `arfi-id-backend/Backend/pom.xml` — Maven build + dependencies.
- `arfi-id-backend/Backend/Dockerfile` — multi-stage build (Maven -> runtime image).
- `arfi-id-backend/Backend/compose.yaml` — example Postgres service and envs.
- `src/main/resources/application.yml`, `application-dev.yml`, `application-prod.yml` — configuration and environment placeholders.
- `src/main/java/dev/faizarfi/auth/config/SecurityConfig.java` — Spring Security setup (JWT filter, permitted endpoints, OAuth2 login config).
- Controllers (key):
  - `AuthController` — base path: `/auth`
	- POST `/auth/login` — body: `{ email, password }` — sets `accessToken` and `refreshToken` HttpOnly cookies and returns basic user info.
	- POST `/auth/register` — body: `{ ... }` — create a new user.
	- POST `/auth/refresh` — triggers refresh flow using refresh cookie and re-issues new access cookie.
	- POST `/auth/logout` — invalidates refresh token and clears cookies.
	- GET `/auth/me` — returns current user info (based on access cookie).
	- POST `/auth/admin-login` — admin login flow.
  - `OAuthController` — base path: `/auth/oauth`
	- GET `/auth/oauth/validate?clientId=...&redirectUri=...` — validate client and redirect URI for OAuth flows.
	- POST `/auth/oauth/authorize` — begin/complete authorization (authorization code issuance/redirect details).
	- POST `/auth/oauth/token` — server-to-server token exchange for clients (client secret required).
  - `SessionController` — base path: `/auth/session`
	- GET `/auth/session` — list active sessions
	- DELETE `/auth/session/{sessionId}` — revoke a session
  - `ProjectManagementController` — base path: `/auth/projects`
	- GET `/auth/projects/status` — list connected projects and statuses
	- POST `/auth/projects/revoke/{clientId}` — revoke a client's access
	- POST `/auth/projects/restore/{clientId}` — restore a revoked access
	- POST `/auth/projects/connect/{clientId}` — connect this account to a project/client

Auth model & cookies
- The backend issues two cookies: `accessToken` and `refreshToken`.
- Cookies are HttpOnly and SameSite=Lax. The `app.cookie.secure` option controls the Secure flag (see `application-dev.yml`, default `false` for dev).
- Access token lifetime default (dev): 5 minutes (`jwt.access-expiration` = 300000 ms).
- Refresh token lifetime default (dev): 7 days (`jwt.refresh-expiration` = 604800000 ms).
- JWT secret in dev defaults to a value in `application-dev.yml` (`jwt.secret`) but should be replaced with a secure secret in production via env var `JWT_SECRET`.

Configuration & environment variables (common)
- Backend envs used (examples & dev defaults found in `application-dev.yml`):
  - `PORT` — server port (default `8080`)
  - `JWT_SECRET` — (recommended) secret for signing JWTs (default in dev file; override for prod)
  - `jwt.access-expiration` — access token lifetime in ms (dev default: `300000`)
  - `jwt.refresh-expiration` — refresh token lifetime in ms (dev default: `604800000`)
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — if using Google OAuth2 login (referenced in `application.yml`)
  - `FRONTEND_URL` — frontend origin for CORS and redirect validation (dev default: `http://localhost:5173`)
  - `ADMIN_Email`, `ADMIN_PASSWORD` — admin credentials for dev (set in env or production secret store)
  - Database envs (used in `compose.yaml` example): `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` (examples in compose file)

Frontend (overview)
Technologies: React 19, Vite, Axios, react-router-dom.

Important frontend files
- `arfi-id-frontend/package.json` — scripts and dependency list. Key scripts:
  - `npm run dev` — start Vite dev server
  - `npm run build` — build production assets
  - `npm run preview` — preview built assets
- `src/lib/axios.js` — Axios instance and response interceptor. Important notes:
  - `baseURL` comes from `import.meta.env.VITE_API_URL` (set this in your environment or Vercel config).
  - `withCredentials: true` — browser will send and accept cookies from the backend (necessary for cookie-based auth).
  - Interceptor handles 401 responses: automatically attempts `POST /auth/refresh` and retries the original request once.
- `src/service/authService.js`, `sessionService.js`, `projectManagementService.js` — functions that call the backend endpoints listed above.

Running the project locally
1) Backend (using Maven wrapper)

```bash
cd "arfi-id-backend/Backend"
./mvnw clean package
./mvnw spring-boot:run
```

Or build the jar and run it:

```bash
./mvnw clean package -DskipTests
java -jar target/*.jar
```

2) Backend (Docker)

```bash
cd "arfi-id-backend/Backend"
docker build -t arfi-auth .
# provide envs via --env-file or -e flags, for example:
docker run -p 8080:8080 --env-file ./src/main/resources/dev.env arfi-auth
```

If you want to use the example `compose.yaml`, inspect it and run Postgres as shown there. Then run the backend pointing to that DB.

3) Frontend (Vite)

```bash
cd arfi-id-frontend
npm install
npm run dev
```

Set environment variables for the frontend (example `.env` or shell):

```bash
# for local dev (in the frontend folder or export into the shell)
export VITE_API_URL=http://localhost:8080
npm run dev
```

Notes about cookies & CORS
- Because backend uses HttpOnly cookies, the frontend must call the API with `withCredentials: true` (already set in `src/lib/axios.js`).
- If frontend and backend are on different origins, ensure `FRONTEND_URL` is included in allowed CORS origins and cookie SameSite/Domain flags are configured properly for cross-site usage. For production, set `app.cookie.secure: true` and use HTTPS.

API docs / Swagger
- The backend includes springdoc-openapi. You can usually find the OpenAPI spec at `/v3/api-docs` and the Swagger UI under `/swagger-ui/` or `/swagger-ui/index.html` when the app is running.

Quick curl examples (cookies)
- Login (will set HttpOnly cookies):

```bash
curl -i -c cookies.txt -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  http://localhost:8080/auth/login
```

- Call protected endpoint using saved cookies:

```bash
curl -i -b cookies.txt http://localhost:8080/auth/me
```

Frontend behavior for automatic refresh
- The frontend Axios instance intercepts 401 responses and attempts `POST /auth/refresh` to get a new access cookie, then retries the original request once. If refresh fails it redirects the user to `/auth` (unless the current path is public).

Deployment notes
- Backend: the `Dockerfile` is multi-stage and suitable for building a small production image. Ensure all secrets and DB connection strings are provided as environment variables or secrets in your deployment platform. If you deploy the backend behind a proxy or load balancer, ensure sticky sessions are not relied upon because the service is stateless and relies on JWT cookies.
- Frontend: `vercel.json` is present for Vercel deployments. In Vercel (or any static host) set `VITE_API_URL` and any other required env vars in the project settings.

Where to look next / recommended improvements
- Add a top-level integration README (this file) — done.
- Consider adding an example `.env.example` for both `arfi-id-backend/Backend` and `arfi-id-frontend` showing required variables.
- Add database migration management (Flyway or Liquibase) if schema evolution will be frequent.
- Add end-to-end tests that exercise the auth flow (register/login/refresh/logout) to catch regressions.

Useful paths
- Backend main: `arfi-id-backend/Backend/src/main/java/dev/faizarfi/auth/`
- Backend config: `arfi-id-backend/Backend/src/main/resources/application-*.yml`
- Frontend services: `arfi-id-frontend/src/service/`
- Frontend Axios config: `arfi-id-frontend/src/lib/axios.js`

---
Last updated: September 26, 2026
