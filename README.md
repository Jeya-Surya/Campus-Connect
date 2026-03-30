# CampusConnect

CampusConnect is a Spring Boot application that brings students, alumni, and mentors together with study groups, real-time style chat rooms, project collaboration (Project Compass), events, resources, and mentorship flows—all served from a single backend with lightweight static front-end pages.

## Features
- Study groups with chat, task lists, file sharing, and dark mode.
- Project Compass for proposing, joining, and managing projects.
- Mentorship spaces for students and alumni, plus request tracking.
- Events, resource hub, doubt desk, and recent chats pages.
- Theme toggle (light/dark) and responsive UI tailored for mobile, tablet, and desktop.

## Tech Stack
- Java 17, Spring Boot
- PostgreSQL (configurable via environment variables)
- Maven for builds/tests
- Static HTML/CSS/JS served from `src/main/resources/static`

## Prerequisites
- Java 17+
- Maven (wrapper included)
- PostgreSQL instance and credentials

## Configuration
Set the following environment variables before running the app:
- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` — PostgreSQL connection
- `PORT` — optional HTTP port (defaults to `8080`)

Configuration lives in `src/main/resources/application.properties`.

## Run Locally
```bash
./mvnw spring-boot:run
```

## React Frontend (migration in progress)
The `frontend/` directory contains the new React SPA replacing the legacy static pages.

```bash
cd frontend
npm install
npm start            # dev server
npm run build        # production build
npm test -- --watch=false
```

Current React routes include login, registration, home, Doubt Desk, Project Compass (with join flow), Study Groups (with club rooms and room chat), Events, Resource Hub, Mentorship (student + alumni dashboards, onboarding, chats), and recent chats. Legacy static pages remain under `src/main/resources/static` until the migration is complete.

### Building with Maven
The Maven build now runs the React build automatically (via `frontend-maven-plugin`) and copies the compiled assets into `src/main/resources/static` so Spring Boot serves the SPA.

```bash
./mvnw package   # installs Node/npm in frontend/, npm install, npm run build, then packages Spring Boot with the built assets
```

## Tests
```bash
./mvnw test
```
Tests require access to the configured PostgreSQL database. If connection variables are missing, the Spring context will fail to start.

## Build
```bash
./mvnw package
```
The packaged JAR will appear under `target/`.

## Project Structure
- `src/main/java` — Spring Boot application code
- `src/main/resources/static` — UI pages (HTML/CSS/JS) and assets
- `src/main/resources/application.properties` — environment-driven configuration
