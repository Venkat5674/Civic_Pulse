# 🏛️ CivicPulse — Role-Based Civic Issue Reporting & Resolution Platform

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.20-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini%20Flash%20Vision-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Socket.io](https://img.shields.io/badge/Realtime-Socket.io%204.7-010101?logo=socketdotio&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/License-ISC-green.svg)](LICENSE)

---

## 📌 Executive Summary & Project Idea

**CivicPulse** is an enterprise-grade civic governance and community empowerment platform designed to close the feedback loop between citizens and municipal authorities. In modern cities, citizens encounter broken streetlights, hazardous potholes, uncollected waste, and compromised water pipelines every day. Traditional municipal grievance systems are notoriously slow, opaque, disconnected from real-time geographic data, and overwhelmed by redundant submissions.

**CivicPulse modernizes urban issue management through:**
1. **Effortless Citizen Reporting:** Instant submission with camera capture, auto-geolocation, and multi-image Cloudinary evidence uploads.
2. **AI-Driven Visual Triage:** Integration with **Google Gemini Vision AI** to automatically inspect uploaded photos, identify defects, estimate severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), generate concise titles/descriptions, and suggest municipal departments.
3. **Smart Duplicate Detection:** A multi-factor geospatial and text similarity algorithm prevents redundant reports and clusters municipal workload.
4. **Dynamic Priority Scoring:** Computes urgency (1–100) based on hazard severity, category weight, community confirmations, and report age.
5. **Full Lifecycle Transparency:** Real-time status tracking (`OPEN` ➔ `IN_PROGRESS` ➔ `RESOLVED` / `REJECTED`) with automated **Email notifications** (via Nodemailer) and **WebSockets** (via Socket.io).
6. **Municipal Operations Hub:** Comprehensive admin back-office with department dispatch, resolution review, category prioritization, audit logging, and graphical analytics.

### Evidence and department routing

Issue evidence is accepted only from the live camera capture flow. The browser must provide a current geolocation, capture timestamp, and camera marker; the API rejects gallery uploads, missing capture metadata, and images more than 100 metres from the reported issue location. AI photo scanning may still help classify an issue, but its source image is not accepted as evidence.

Departments are normalized in the database (`Electrical Department`, `Water Department`, `Road Safety Department`, and `Municipal Department`). Each department can have its own admin users, and new issues are assigned from their category's department. Department admins see and manage only the issues assigned to their department; super admins retain cross-department access.

---

## 🏗️ High-Level System Architecture

### 📊 Interactive Visual Architecture

```mermaid
flowchart TB
    subgraph Frontend["Frontend Client (React 18 + Vite)"]
        UI_Dash["Citizen Dashboard & Report Wizard"]
        UI_Map["Interactive Leaflet GIS Map"]
        UI_Admin["Admin Command Center & Analytics"]
        UI_Guest["Public Community Explorer"]
    end

    subgraph Backend["Backend API Server (Node.js + Express)"]
        API_Gateway["Express API Gateway & Rate Limiter"]
        Auth_MW["JWT Auth & Role Guards"]
        Issue_Ctrl["Issue & Duplicate Controller"]
        Admin_Ctrl["Admin Triage & Audit Service"]
        Score_Eng["Priority Scoring Engine"]
        Socket_Srv["Socket.io Realtime Server"]
    end

    subgraph Services["External Services & AI"]
        AI_Gemini["Google Gemini Flash Vision API"]
        Cloud_Media["Cloudinary Media Storage"]
        Mail_Srv["Nodemailer Email Gateway"]
    end

    subgraph Database["Database & Persistence Layer"]
        ORM["Prisma ORM Client"]
        DB[("Supabase PostgreSQL Database")]
    end

    UI_Dash -->|REST API Requests| API_Gateway
    UI_Map -->|Fetch Geo Coordinates| API_Gateway
    UI_Admin -->|Admin Actions & Status Updates| API_Gateway
    UI_Guest -->|Browse Public Issues| API_Gateway

    UI_Dash <-->|WebSocket Realtime Alerts| Socket_Srv
    UI_Admin <-->|WebSocket Admin Room Broadcast| Socket_Srv

    API_Gateway --> Auth_MW
    Auth_MW --> Issue_Ctrl
    Auth_MW --> Admin_Ctrl
    Issue_Ctrl --> Score_Eng

    Issue_Ctrl -->|Analyze Photo Buffer| AI_Gemini
    Issue_Ctrl -->|Upload Images| Cloud_Media
    Admin_Ctrl -->|Send Status Mails| Mail_Srv
    Admin_Ctrl -->|Push Live Updates| Socket_Srv

    Issue_Ctrl -->|Prisma Queries| ORM
    Admin_Ctrl -->|Audit Logs & Updates| ORM
    ORM <-->|Connection Pool / Migrations| DB
```

### 🏛️ Architectural Component Matrix

```
+-----------------------------------------------------------------------------------------+
|                                    CLIENT LAYER                                         |
|  [Citizen Dashboard]      [Leaflet GIS Map]     [Admin Command Center]   [Public Feeds]  |
|  (React 18 + Vite)        (Geo Marker Cluster)  (Recharts Analytics)     (Guest Mode)   |
+--------------------------------------------+--------------------------------------------+
                                             |  ▲  (WebSockets - Socket.io)
                                (HTTP / JWT) |  |  Live Alerts & Notifications
                                             ▼  |
+-----------------------------------------------------------------------------------------+
|                                BACKEND APPLICATION SERVER                               |
|  [Express Router]  -->  [Helmet & Rate Limiters]  -->  [JWT Auth & RBAC Middleware]    |
|                                                                                         |
|  +--------------------+   +-----------------------+   +------------------------------+  |
|  | Issue Controller   |   | Duplicate Detection   |   | Priority Scoring Matrix      |  |
|  | CRUD, Geolocation  |   | Distance + Bigrams    |   | Base + Confirm + Age Factors |  |
|  +--------------------+   +-----------------------+   +------------------------------+  |
|                                                                                         |
|  +--------------------+   +-----------------------+   +------------------------------+  |
|  | Gemini Vision AI   |   | Nodemailer Email      |   | Cloudinary Media Uploader    |  |
|  | Triage & Hazards   |   | SMTP & Ethereal       |   | Multipart Buffer Storage     |  |
|  +--------------------+   +-----------------------+   +------------------------------+  |
+--------------------------------------------+--------------------------------------------+
                                             |
                                 (Prisma ORM | Queries & Migrations)
                                             ▼
+-----------------------------------------------------------------------------------------+
|                                   DATA PERSISTENCE LAYER                                |
|                        PostgreSQL / Supabase (Relational Cloud DB)                      |
|       Users  •  Categories  •  Issues  •  Confirmations  •  Audit Logs  •  Images       |
+-----------------------------------------------------------------------------------------+
```

---

## 🧰 Technology Stack & Why They Were Chosen

### 1. Frontend Technologies

| Technology | Role | Why It Was Chosen |
| :--- | :--- | :--- |
| **React 18** | UI Framework | Component-based modularity, concurrent rendering for smooth map/feed transitions, and robust ecosystem. |
| **Vite** | Build Tool & Dev Server | Sub-second Hot Module Replacement (HMR) and optimized Rollup production bundles, significantly faster than CRA. |
| **Tailwind CSS** | Styling & Theme System | Rapid design prototyping with atomic utility classes, custom design tokens, dark/light themes, and zero CSS bloat. |
| **React Router v7** | Client Routing | Declarative routing with protected route guards for authentication (`ProtectedRoute`) and administration (`AdminRoute`). |
| **Leaflet & React-Leaflet** | Geospatial Maps | Lightweight, open-source mapping engine without expensive proprietary billing (e.g. Google Maps API); supports marker pinning and coordinate reverse-geocoding. |
| **Recharts** | Analytics Charts | Declarative SVG charting library used in the Admin Analytics portal for trend lines, category distribution, and department efficiency bars. |
| **React Hook Form + Zod** | Form State & Validation | High performance with minimal re-renders; schema-based validation shared conceptually with backend logic. |
| **Socket.io Client** | Real-Time Client | Persistent WebSocket connectivity for instant notification badges, status updates, and live issue streams. |
| **Lucide React** | Iconography | Consistent, modern, tree-shakeable SVG icons for civic categories and UI controls. |
| **Sonner** | Toast Feedback | Lightweight, accessible, stackable notification popups for user action confirmations. |

### 2. Backend Technologies

| Technology | Role | Why It Was Chosen |
| :--- | :--- | :--- |
| **Node.js & Express.js** | Runtime & API Framework | Asynchronous, event-driven I/O ideal for handling concurrent I/O operations, uploads, and WebSocket events. |
| **Prisma ORM** | Object-Relational Mapping | Strongly-typed database client, auto-generated migrations, intuitive schema modeling, and protection against SQL injection. |
| **PostgreSQL (Supabase)** | Relational Database | Battle-tested ACID compliance, powerful relational constraints, geospatial coordinates handling, and connection pooling. |
| **Google Generative AI (Gemini Flash)** | Computer Vision / AI | Rapid multi-modal image inspection capable of extracting civic defect details, hazard severity, and municipal categories in under 2 seconds. |
| **Cloudinary & Multer** | Media Storage & Processing | Scalable cloud delivery, on-the-fly image transformations, and secure multipart image uploads. |
| **Socket.io** | WebSocket Engine | Room-based real-time communication (`user_${userId}` for individual alerts, `admin_room` for municipal dispatch). |
| **Nodemailer** | Transactional Emailing | Flexible SMTP delivery with HTML email templates, automatic test fallback via Ethereal, and complete email diagnostic capabilities. |
| **JWT & BcryptJS** | Authentication & Security | Stateless JSON Web Tokens for API authorization and salted one-way hashing for user password confidentiality. |
| **Helmet & Express Rate Limit**| Defense-in-Depth | HTTP security header hardening and rate-limiting barriers against brute-force attacks on auth and report submission routes. |
| **Pino & Pino-HTTP** | Structured Logging | High-throughput, JSON-formatted structured logging for production observability. |
| **Swagger UI Express** | API Documentation | Interactive OpenAPI documentation hosted directly at `/api/docs` for developer onboarding. |

---

## 🔄 End-to-End Project Flow

### 1. Visual Sequence Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    participant Citizen as Citizen
    participant Client as Web Client
    participant API as API Server
    participant AI as Gemini Vision AI
    participant DB as PostgreSQL DB
    participant Mail as Email Gateway
    participant Admin as Municipal Admin

    Citizen->>Client: Upload issue photo and click Analyze
    Client->>API: POST /api/ai/analyze-issue
    API->>AI: Send image buffer for defect analysis
    AI-->>API: Return title, category, severity, and hazard assessment
    API-->>Client: Auto-fill report form with AI suggestions
    Citizen->>Client: Pick map coordinates and submit report
    Client->>API: POST /api/issues

    Note over API, DB: Duplicate Detection and Priority Scoring
    API->>DB: Query active issues within 1km radius
    API->>API: Compute multi-factor similarity score
    API->>API: Compute dynamic priority score (1 to 100)
    API->>DB: Save new issue, photo URLs, and status history

    API->>Admin: Emit new_issue event via Socket.io
    API-->>Client: Return created issue record

    Note over Admin, DB: Municipal Review and Resolution
    Admin->>API: PATCH status (OPEN to IN_PROGRESS to RESOLVED)
    API->>DB: Update issue record and insert audit log
    API->>Mail: Send branded HTML notification to Citizen
    API->>Citizen: Push realtime status change via Socket.io
```

#### ⏱️ Sequence Execution Timeline

| Step | Initiator | Target | Action & Purpose | Payload / Outcome |
| :---: | :--- | :--- | :--- | :--- |
| **01** | `Citizen` | `Web Client` | Citizen uploads evidence photo & clicks "Analyze" | Multipart image buffer |
| **02** | `Web Client` | `API Server` | Dispatches `POST /api/ai/analyze-issue` | Base64 or stream buffer |
| **03** | `API Server` | `Gemini AI` | Multimodal prompt with municipal taxonomy | Zero-shot image classification |
| **04** | `Gemini AI` | `API Server` | Returns defect triage payload | Title, Category, Severity, Hazards |
| **05** | `API Server` | `Web Client` | Form auto-population response | Populates form inputs instantly |
| **06** | `Citizen` | `Web Client` | Confirms location pin on Leaflet GIS Map | Latitude & Longitude coordinates |
| **07** | `Web Client` | `API Server` | Submits complete report payload | `POST /api/issues` |
| **08** | `API Server` | `PostgreSQL` | Geospatial duplicate search & scoring | Haversine distance + Bigram match |
| **09** | `API Server` | `PostgreSQL` | Persists issue, images, & audit records | Generates UUID & initial timeline |
| **10** | `API Server` | `Admin` | Real-time WebSocket emission to `admin_room` | Live queue badge updates |
| **11** | `Admin` | `API Server` | Reviews dossier & updates lifecycle status | Status: `IN_PROGRESS` ➔ `RESOLVED` |
| **12** | `API Server` | `Citizen` | Automated multi-channel notification | HTML Email (SMTP) + Socket.io push |

### 2. High-Level Flow Pipeline

```
  [1. Citizen Snaps Photo] ──> [2. Gemini AI Analysis] ──> [3. Form Auto-filled]
                                                                  │
                                                                  ▼
  [6. Live Socket.io Alert] <── [5. Priority & Duplicate Check] <── [4. Map Pin & Submit]
            │
            ▼
  [7. Admin Department Dispatch] ──> [8. Municipal Crew Repairs Issue]
                                                      │
                                                      ▼
                            [9. Admin Marks RESOLVED with Notes]
                                          │
                                          ▼
                      [10. Branded Email & Real-Time Push to Citizen]
```

### 3. Comprehensive Step-by-Step Lifecycle Breakdown

#### 🔹 Phase 1: Authentication & Onboarding
1. Citizen registers or signs in at `/register` or `/login`.
2. Password is encrypted using `bcryptjs` (salt rounds: 10), and a stateless JWT is issued.
3. A branded **Welcome Email** is immediately dispatched in the background to the citizen via Nodemailer.

#### 🔹 Phase 2: Citizen Reporting with Gemini Vision AI
1. The citizen navigates to `/report` and uploads photo evidence.
2. The frontend dispatches `POST /api/ai/analyze-issue`. The backend routes the raw image buffer to **Google Gemini Flash Vision**.
3. Gemini inspects the photo against registered municipal categories, returning a structured JSON payload with:
   - Defect title and detailed objective description
   - Matched municipal category slug
   - Assessed severity level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
   - Recommended municipal department and immediate safety hazards
4. The frontend report form auto-populates with these suggestions, allowing the citizen to review, adjust, and confirm.
5. The citizen selects the exact incident location on the **Leaflet GIS Map** (with geolocation reverse-geocoding).

#### 🔹 Phase 3: Server-side Duplicate Detection & Priority Scoring
1. **Duplicate Detection:** The backend checks active issues within a 1km geographic radius and evaluates composite similarity (distance + category + text matching). If similarity $\ge 40$, candidate links are established to prevent redundant municipal dispatching.
2. **Dynamic Priority Scoring:** An initial priority score ($1-100$) is calculated based on severity baseline, category weighting, and report age.
3. **Database Persistence:** Prisma ORM writes the issue record, stores image CDN URLs, and initializes status history.

#### 🔹 Phase 4: Real-time Dispatch to Municipal Authorities
1. A real-time `new_issue` event is emitted via **Socket.io** to the dedicated `admin_room`.
2. Municipal administrators logged into `/admin` or `/admin/issues` see the triage queue update live without page refreshes.

#### 🔹 Phase 5: Municipal Review, Department Assignment & Resolution
1. The administrator reviews the issue dossier at `/admin/review/:id`.
2. The administrator can:
   - Assign the issue to a municipal department (e.g., *Roads & Highways*, *Water Works*).
   - Manually override the priority score if necessary.
   - Advance the status from `OPEN` to `IN_PROGRESS` when crews are dispatched.
   - Mark the issue as `RESOLVED` (with resolution notes) or `REJECTED` (with justification).
3. Every state transition is recorded in the immutable `audit_logs` table with actor timestamps.

#### 🔹 Phase 6: Multi-Channel Citizen Feedback Loop
1. **Live Push Notification:** A Socket.io event is dispatched to `user_${citizenId}`, updating the notification badge and displaying an instant toast.
2. **Transactional Email:** The backend dispatches a rich HTML email (`sendIssueResolvedEmail` or `sendIssueRejectedEmail`) containing the municipal resolution notes, date, category, and direct tracking link.
3. **Community Validation:** Neighborhood citizens can view the resolved problem on the public `/explore` and `/map` views, verifying that civic maintenance was completed.

---

## 💎 Core Innovation Features

### 1. 🧠 Gemini Vision AI Auto-Triage
When a citizen snaps a picture of an urban issue:
* The backend inspects the image buffer via `gemini-3.5-flash` / `gemini-3.8-flash`.
* The AI compares the visual evidence against active municipal categories (`Roads & Potholes`, `Waste & Sanitation`, `Street Lighting`, `Water & Drainage`, etc.).
* Returns structured JSON with title recommendation, category classification, objective defect description, and risk evaluation (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).

### 2. 🔍 Multi-Factor Duplicate Detection Algorithm
Prevents double-counting and redundant city dispatching using a 100-point composite heuristic:
$$\text{Total Score} = \text{Distance Score (Max 40)} + \text{Category Score (Max 30)} + \text{Text Similarity (Max 30)}$$
* **Distance Signal:**
  * $< 50\text{ m} \rightarrow 40\text{ pts}$
  * $< 150\text{ m} \rightarrow 32\text{ pts}$
  * $< 400\text{ m} \rightarrow 20\text{ pts}$
  * $< 1000\text{ m} \rightarrow 10\text{ pts}$
* **Category Signal:** Exact category match yields $30\text{ pts}$.
* **Text Similarity:** Bigram/Levenshtein matching on title ($70\%$ weight) and description ($30\%$ weight).
* If score $\ge 40$, the system links potential duplicates and flags them for admin consolidation or citizen upvoting.

### 3. ⚡ Dynamic Priority Scoring Matrix
Every issue is evaluated on a normalized $1-100$ scale:
$$\text{Raw Score} = (\text{Base Severity} + \text{Confirmation Bonus} + \text{Age Bonus}) \times \text{Category Weight}$$
* **Base Severity:** `LOW` = 15, `MEDIUM` = 35, `HIGH` = 60, `CRITICAL` = 85.
* **Community Confirmation Bonus:** $+4\text{ points}$ per citizen confirmation (capped at $+20\text{ pts}$).
* **Aging Escalation:** $+1\text{ point}$ per day lingering unaddressed (capped at $+10\text{ pts}$).
* **Category Weight:** E.g., Water & Drainage ($1.5\times$), Roads ($1.4\times$), Sanitation ($1.3\times$).

---

## 📧 Email Notification Pipeline

CivicPulse features an automated email notification system built with **Nodemailer**, complete with responsive HTML email templates:

```
                              ┌────────────────────────────────────────┐
                              │       Trigger Event in Backend         │
                              └───────────────────┬────────────────────┘
                                                  │
                ┌─────────────────────────────────┼─────────────────────────────────┐
                ▼                                 ▼                                 ▼
       ┌─────────────────┐               ┌─────────────────┐               ┌─────────────────┐
       │ User Registered │               │ Issue Resolved  │               │ Issue Rejected  │
       └────────┬────────┘               └────────┬────────┘               └────────┬────────┘
                │                                 │                                 │
                ▼                                 ▼                                 ▼
       sendWelcomeEmail()              sendIssueResolvedEmail()          sendIssueRejectedEmail()
                │                                 │                                 │
                └─────────────────────────────────┼─────────────────────────────────┘
                                                  │
                                                  ▼
                                      ┌───────────────────────┐
                                      │ getEmailWrapper(HTML) │
                                      └───────────┬───────────┘
                                                  │
                                                  ▼
                        ┌───────────────────────────────────────────────────┐
                        │ SMTP Configured? (HOST, USER, PASS in backend .env) │
                        └──────────┬─────────────────────────────┬──────────┘
                                   │ YES                         │ NO
                                   ▼                             ▼
                        Send via Production SMTP       Auto-create Ethereal Account
                         (Gmail / SendGrid / AWS)      & Output Web Preview URL in CLI
```

### Supported Transactional Templates:
1. **Welcome Email (`sendWelcomeEmail`):** Sent immediately upon citizen registration, detailing platform capabilities and dashboard links.
2. **Password Reset (`sendPasswordResetEmail`):** Generates a 1-hour secure cryptographic reset token with direct recovery link.
3. **Issue Resolved (`sendIssueResolvedEmail`):** Congratulates the citizen when an issue is solved, showing category, address, resolution date, and municipal notes.
4. **Issue Rejected (`sendIssueRejectedEmail`):** Transparently informs citizens why an issue was declined (e.g., duplicate, private property, lack of evidence) with instructions to appeal or submit more photos.

> 💡 **Developer Friendly:** If SMTP credentials are not configured, CivicPulse automatically provisions a disposable **Ethereal Email** account and prints a one-click preview link in the backend console.

---

## 🗄️ Database Architecture & Schema Models

The system runs on **PostgreSQL / Supabase** orchestrated by **Prisma ORM**.

### 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o{ ISSUE : reports
    USER ||--o{ COMMENT : writes
    USER ||--o{ ISSUE_CONFIRMATION : confirms
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ AUDIT_LOG : triggers
    CATEGORY ||--o{ ISSUE : classifies
    ISSUE ||--o{ ISSUE_IMAGE : contains
    ISSUE ||--o{ ISSUE_CONFIRMATION : receives
    ISSUE ||--o{ COMMENT : has
    ISSUE ||--o{ ISSUE_STATUS_HISTORY : tracks
    ISSUE ||--o{ NOTIFICATION : references
    ISSUE ||--o{ ISSUE_DUPLICATE : primary
    ISSUE ||--o{ ISSUE_DUPLICATE : candidate

    USER {
        string id PK
        string name
        string email
        string password_hash
        string role
        string department
        boolean email_notifications
        datetime created_at
    }

    CATEGORY {
        string id PK
        string name
        string slug
        string description
        string icon
        float priority_weight
        boolean is_active
    }

    ISSUE {
        string id PK
        string user_id FK
        string category_id FK
        string title
        string description
        string status
        string severity
        int priority_score
        float latitude
        float longitude
        string address
        int confirmations_count
        string assigned_department
        datetime resolved_at
    }

    ISSUE_IMAGE {
        string id PK
        string issue_id FK
        string image_url
        string public_id
    }

    ISSUE_CONFIRMATION {
        string id PK
        string issue_id FK
        string user_id FK
    }

    COMMENT {
        string id PK
        string issue_id FK
        string user_id FK
        string body
    }

    ISSUE_STATUS_HISTORY {
        string id PK
        string issue_id FK
        string old_status
        string new_status
        string changed_by
        string note
    }

    ISSUE_DUPLICATE {
        string id PK
        string issue_id FK
        string candidate_issue_id FK
        int similarity_score
        string relation_type
    }

    AUDIT_LOG {
        string id PK
        string actor_user_id FK
        string action
        string entity_type
        string entity_id
        string metadata_json
    }
```

### 2. Core Relational Schema Data Dictionary

#### 📋 `users` (Citizen & Admin Accounts)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default: `uuid()` | Unique user identifier |
| `name` | `VARCHAR` | `NOT NULL` | Citizen or administrative staff full name |
| `email` | `VARCHAR` | `NOT NULL`, `UNIQUE` | User login and notification email |
| `password_hash` | `VARCHAR` | `NOT NULL` | Salted Bcrypt hash (10 rounds) |
| `role` | `VARCHAR` | Default: `'CITIZEN'` | Access role: `CITIZEN`, `ADMIN`, or `GUEST` |
| `department` | `VARCHAR` | Nullable | Assigned municipal department (for admin staff) |
| `email_notifications` | `BOOLEAN` | Default: `true` | User preference for receiving transactional emails |
| `created_at` | `TIMESTAMP` | Default: `now()` | Timestamp of account registration |

#### 📋 `issues` (Civic Reports Repository)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default: `uuid()` | Unique issue tracking ID |
| `user_id` | `UUID` | `FOREIGN KEY` ➔ `users(id)` | Authoring citizen ID (cascades on delete) |
| `category_id` | `UUID` | `FOREIGN KEY` ➔ `categories(id)` | Classified municipal problem category |
| `title` | `VARCHAR` | `NOT NULL` | Concise summary (AI-generated or user-edited) |
| `description` | `TEXT` | `NOT NULL` | Detailed defect conditions and observations |
| `status` | `VARCHAR` | Default: `'OPEN'` | Lifecycle state: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `REJECTED` |
| `severity` | `VARCHAR` | Default: `'MEDIUM'` | Urgency assessment: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `priority_score` | `INTEGER` | Default: `35` | Dynamically calculated priority rating ($1-100$) |
| `latitude` / `longitude` | `FLOAT` | `NOT NULL` | Geographic WGS84 coordinates for GIS mapping |
| `address` | `VARCHAR` | `NOT NULL` | Approximate street address / reverse-geocoded string |
| `confirmations_count` | `INTEGER` | Default: `1` | Total community upvotes confirming the issue |
| `assigned_department` | `VARCHAR` | Nullable | Municipal division assigned (e.g. Roads, Water) |
| `resolved_at` | `TIMESTAMP` | Nullable | Timestamp when municipal crew completed resolution |

#### 📋 `categories` (Municipal Taxonomy)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default: `uuid()` | Category primary key |
| `name` | `VARCHAR` | `NOT NULL`, `UNIQUE` | Human-readable name (e.g., "Roads & Potholes") |
| `slug` | `VARCHAR` | `NOT NULL`, `UNIQUE` | URL & AI identifier (e.g., `roads-potholes`) |
| `priority_weight` | `FLOAT` | Default: `1.0` | Urgency multiplier ($1.0$ to $1.5\times$) |
| `icon` | `VARCHAR` | Default: `'HelpCircle'` | Lucide icon identifier for UI rendering |
| `is_active` | `BOOLEAN` | Default: `true` | Soft-disable flag for municipal departments |

#### 📋 `issue_duplicates` & `issue_confirmations` (Community & Deduplication)
| Table | Key Columns | Relation | Purpose |
| :--- | :--- | :--- | :--- |
| **`issue_duplicates`** | `issue_id`, `candidate_issue_id`, `similarity_score` | Many-to-Many `Issue` | Stores duplicate matches ($score \ge 40$) computed via spatial + textual algorithms |
| **`issue_confirmations`** | `issue_id`, `user_id` (Unique Pair) | `Issue` & `User` | Prevents duplicate upvoting while increasing issue priority score |
| **`comments`** | `issue_id`, `user_id`, `body` | `Issue` & `User` | Public collaborative discussion thread on municipal progress |
| **`issue_status_history`** | `issue_id`, `old_status`, `new_status`, `changed_by`, `note` | `Issue` | Immutable timeline of administrative state changes |
| **`audit_logs`** | `actor_user_id`, `action`, `entity_type`, `entity_id` | `User` | Secure municipal audit trail for compliance and review |

---

## 🌐 Complete API Endpoint Reference

All endpoints are prefixed with `/api`. Interactive documentation is available at **`/api/docs`** via Swagger UI.

### 1. Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a new citizen account
* `POST /api/auth/login` — Login with email/password and obtain JWT token
* `GET /api/auth/me` — Retrieve currently authenticated user profile
* `PATCH /api/auth/profile` — Update user name, avatar, and notification settings
* `POST /api/auth/forgot-password` — Dispatch password reset email link
* `POST /api/auth/reset-password` — Reset password using verification token
* `POST /api/auth/change-password` — Change password for authenticated session
* `POST /api/auth/refresh` — Refresh access token
* `POST /api/auth/logout` — Revoke session

### 2. Issues & Engagement (`/api/issues`)
* `GET /api/issues` — Paginated list of issues with filter by status, category, severity, and search term
* `GET /api/issues/nearby?lat=...&lng=...&radius=...` — Spatial query for issues in geographic radius
* `GET /api/issues/:id` — Detailed issue record with images, comments, status timeline, and confirmation counts
* `GET /api/issues/:id/duplicates` — List potential duplicates detected for this issue
* `POST /api/issues` — Create a new issue report (with geocoordinates, category, and evidence)
* `PATCH /api/issues/:id` — Update report description or details (creator only)
* `POST /api/issues/:id/cancel` — Citizen cancels own report
* `DELETE /api/issues/:id` — Remove report (creator or admin)
* `POST /api/issues/:id/confirm` — Upvote / confirm issue existence in community
* `DELETE /api/issues/:id/confirm` — Remove upvote / confirmation
* `POST /api/issues/:id/comments` — Post a public community comment on an issue

### 3. Artificial Intelligence & Media (`/api/ai` & `/api/upload`)
* `POST /api/ai/analyze-issue` — Send image to Gemini Vision to get automated title, description, category, and severity
* `POST /api/upload/image` — Upload photographic evidence to Cloudinary and get secure URL

### 4. Municipal Administration (`/api/admin` — Requires `ADMIN` Role)
* `GET /api/admin/dashboard` — Overview metrics (total, open, in-progress, resolved, critical counts)
* `GET /api/admin/analytics` — Advanced analytics data for charts (resolution time, category splits, department workload)
* `GET /api/admin/issues` — Filterable administrative triage queue
* `GET /api/admin/issues/:id/review` — Complete review dossier for a specific issue
* `PATCH /api/admin/issues/:id/status` — Change status (`OPEN` ➔ `IN_PROGRESS` ➔ `RESOLVED` / `REJECTED`) with notification trigger
* `PATCH /api/admin/issues/:id/priority` — Manually override priority score
* `PATCH /api/admin/issues/:id/department` — Assign issue to municipal department
* `POST /api/admin/issues/:id/merge` — Merge candidate issue into primary issue
* `GET /api/admin/categories` — List all categories (also public at `/api/categories`)
* `POST /api/admin/categories` — Create new category with icon and priority weight
* `PATCH /api/admin/categories/:id` — Modify category parameters
* `DELETE /api/admin/categories/:id` — Deactivate or remove category
* `GET /api/admin/users` — List platform users
* `PATCH /api/admin/users/:id/role` — Elevate or demote user role (`CITIZEN` / `ADMIN`)
* `GET /api/admin/audit-logs` — Administrative audit trail
* `GET /api/admin/settings` & `PATCH /api/admin/settings` — Platform-wide settings
* `GET /api/admin/export/csv` — Export issue reports to CSV spreadsheet

---

## 📂 Project Directory Structure

```
Civic-Pulse-main/
├── README.md                      # Primary project demonstration and documentation
├── .gitignore                     # Git ignore rules for root and dependencies
├── backend/                       # Express.js REST API Server & Socket.io
│   ├── .env.example               # Backend environment variables template
│   ├── package.json               # Backend dependencies & npm scripts
│   ├── prisma/
│   │   ├── schema.prisma          # Prisma schema definition (PostgreSQL)
│   │   ├── seed.js                # Database seeder with mock issues & users
│   │   └── migrations/            # SQL migration history
│   ├── scripts/
│   │   └── testEmail.js           # CLI diagnostic script for testing SMTP connection
│   └── src/
│       ├── app.js                 # Express application middleware pipeline
│       ├── server.js              # HTTP server & Socket.io initialization
│       ├── config/                # Environment variables, database, & logger
│       ├── controllers/           # HTTP request & response handlers
│       ├── middleware/            # JWT authentication, role guards, rate limiters
│       ├── routes/                # Express API route modules
│       ├── services/              # Business logic (AI, Email, Duplicates, Priority)
│       │   ├── aiService.js       # Google Gemini Vision integration
│       │   ├── emailService.js    # Nodemailer email dispatchers & HTML templates
│       │   ├── duplicateDetectionService.js # Spatial & text similarity detection
│       │   ├── priorityScoringService.js    # Multi-variable scoring algorithm
│       │   └── issueService.js    # Issue lifecycle operations
│       ├── sockets/               # Real-time WebSocket room handlers
│       ├── utils/                 # Spatial math & distance calculators
│       └── validators/            # Zod validation schemas
│
└── frontend/                      # React 18 + Vite + Tailwind Client
    ├── .env                       # Frontend environment configuration
    ├── package.json               # Frontend dependencies & npm scripts
    ├── vite.config.js             # Vite build & plugin configuration
    ├── tailwind.config.js         # Tailwind theme & design tokens
    ├── index.html                 # Main HTML entry point
    └── src/
        ├── App.jsx                # Root app component with providers & toasts
        ├── main.jsx               # React DOM entry point
        ├── components/            # Reusable UI components (Navbar, Modals, Cards, Maps)
        ├── context/               # AuthContext, NotificationContext, ThemeContext
        ├── routes/                # React Router v7 routes & ProtectedRoute guards
        ├── services/              # Axios API client & WebSocket bindings
        └── pages/
            ├── public/            # LandingPage, ExplorePage, MapPage, IssueDetailPage
            ├── auth/              # LoginPage, RegisterPage, ForgotPassword, ResetPassword
            ├── citizen/           # CitizenDashboard, ReportIssuePage, MyIssues, Profile
            └── admin/             # AdminDashboard, AdminIssues, Analytics, Users, Settings
```

---

## 🚀 Step-by-Step Installation & Local Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **PostgreSQL / Supabase**: Active PostgreSQL connection string

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/Civic-Pulse.git
cd Civic-Pulse-main
```

---

### Step 2: Configure the Backend

1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file from the example template:
   ```bash
   cp .env.example .env
   ```

3. Fill in your environment variables in `backend/.env`:
   ```ini
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173

   # Database (PostgreSQL / Supabase)
   DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

   # Authentication
   JWT_SECRET="civicpulse_super_secret_jwt_key_2026"
   JWT_EXPIRES_IN="7d"

   # Google Gemini AI (Vision Analysis)
   GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

   # Cloudinary Media Storage
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"

   # Transactional Email (SMTP - Optional, falls back to Ethereal if omitted)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-gmail-app-password"
   EMAIL_FROM="CivicPulse Notifications <notifications@civicpulse.org>"
   ```

4. Run Prisma database migrations and seed default categories & accounts:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

5. *(Optional)* Run the Email Diagnostic Utility to verify your SMTP connection:
   ```bash
   npm run test:email
   ```

6. Start the Backend API server:
   ```bash
   npm run dev
   ```
   *The backend will be live at: `http://localhost:5000`*
   *Interactive API Docs: `http://localhost:5000/api/docs`*

---

### Step 3: Configure the Frontend

1. Open a new terminal, navigate to the frontend directory, and install dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

2. Verify or create `frontend/.env`:
   ```ini
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   VITE_APP_NAME=CivicPulse
   ```

3. Start the Frontend Vite development server:
   ```bash
   npm run dev
   ```
   *The web application will be accessible at: `http://localhost:5173`*

---

## 👥 Pre-Configured Demo Accounts

After executing `npm run prisma:seed`, the following accounts are ready to use out-of-the-box:

| Role | Email | Password | Permissions & Views |
| :--- | :--- | :--- | :--- |
| **Municipal Administrator** | `admin@civicpulse.org` | `admin123` | Full access to `/admin`, Analytics, Issue Review, Department Assignment, Category Management, User Role management, and Audit Logs. |
| **Citizen User** | `citizen@civicpulse.org` | `password123` | Can file reports, use Gemini Vision auto-fill, confirm community issues, comment, update profile, and track issue lifecycles. |
| **Guest Visitor** | *(No login required)* | N/A | Can explore the interactive Leaflet map, view publicly reported issues, search civic problems, and review municipal health metrics. |

---

## 🧪 Testing & Quality Assurance

* **Run Backend Unit & Integration Tests:**
  ```bash
  cd backend
  npm test
  ```
* **Run Frontend Component Tests:**
  ```bash
  cd frontend
  npm test
  ```
* **Email System Live Diagnostic:**
  ```bash
  cd backend
  npm run test:email
  ```

---

## 🛡️ Security & Performance Standards

* **Role-Based Access Control (RBAC):** Strict middleware guards authenticate via cryptographic JWT tokens and enforce role claims on sensitive municipal administrative endpoints.
* **Input Sanitization & Schema Validation:** All incoming payloads are strictly validated against **Zod** schemas before reaching service logic.
* **Brute-Force & Rate Limiting:** High-frequency routes (such as user login, password reset, and issue creation) are protected by IP-based sliding window rate limiters (`express-rate-limit`).
* **Content Security & Headers:** Protected by **Helmet** with fine-grained cross-origin policies.
* **Database Pooling:** Dual connection architecture utilizing Supabase PgBouncer for concurrent transactions alongside a direct connection for schema migrations.

---

## 📜 License

This project is licensed under the **ISC License**. Free for academic, municipal, and commercial development.
