# LabTrack Pro — Laboratory Sample Tracking & Traceability System

**LabTrack Pro** is an enterprise-grade laboratory sample tracking and chain-of-custody traceability web application designed to track laboratory samples seamlessly from initial reception intake through all analytical laboratory stages to final archival storage.

---

## 📄 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Main Objectives](#2-main-objectives)
3. [Features](#3-features)
4. [Architecture](#4-architecture)
5. [Technology Stack](#5-technology-stack)
6. [Project Structure](#6-project-structure)
7. [Database Architecture](#7-database-architecture)
8. [Authentication](#8-authentication)
9. [Barcode System](#9-barcode-system)
10. [Code 128 Explanation](#10-code-128-explanation)
11. [USB Barcode Scanner Explanation](#11-usb-barcode-scanner-explanation)
12. [Thermal Label Printer Explanation](#12-thermal-label-printer-explanation)
13. [Automatic Workflow](#13-automatic-workflow)
14. [Manual Fallback Workflow](#14-manual-fallback-workflow)
15. [Sample Lifecycle](#15-sample-lifecycle)
16. [API Overview](#16-api-overview)
17. [Environment Variables](#17-environment-variables)
18. [PostgreSQL Setup](#18-postgresql-setup)
19. [Backend Installation](#19-backend-installation)
20. [Frontend Installation](#20-frontend-installation)
21. [Running the Application](#21-running-the-application)
22. [Default Seed Data](#22-default-seed-data)
23. [Testing](#23-testing)
24. [Troubleshooting](#24-troubleshooting)
25. [Future Improvements](#25-future-improvements)

---

## 1. Project Overview

In laboratory environments (agricultural, botanical, metallurgical, chemical, and medical), tracking specimens accurately across various physical processing stations is critical. **LabTrack Pro** eliminates manual paper logbooks by providing a centralized digital system for sample intake, physical barcode tagging, automated stage progression via USB scanners, and immutable chain-of-custody logging.

---

## 2. Main Objectives

- **Zero Identifier Typos**: Eliminate manual identifier entry by letting the backend automatically generate sequential sample codes formatted as `SMP-YYYY-NNNNNN`.
- **Fast Physical Hardware Integration**: Support plug-and-play USB 1D barcode scanners without requiring browser camera permissions.
- **Sequential Custody Enforcement**: Enforce standard stage progression rules:
  $$\text{RECEPTION} \longrightarrow \text{OVEN} \longrightarrow \text{ANALYSIS} \longrightarrow \text{STORAGE}$$
- **Fail-Safe Fallback**: Provide a comprehensive 7-step manual movement interface when hardware scanners are offline or labels are damaged.
- **Role-Based Security**: Restrict administrative corrections and user management strictly to `ADMIN` roles while protecting data integrity against unauthorized tampering.

---

## 3. Features

- 📊 **Real-Time Analytics Dashboard**: Displays 7 KPI metrics, pipeline progress visualizer, recent movements table, and recent sample intake table.
- 🧪 **Sample Intake & Label Generation**: Registers specimens with species, origin, collection date, and reception date; generates Code 128 barcode images.
- 🏷️ **Thermal Label Print Preview**: Previews and prints 50mm x 25mm adhesive barcode tags formatted for laboratory thermal printers.
- ⚡ **Automated USB Scanner Console**: Captures 1D USB scanner keyboard input, detects `Enter`, and automatically advances sample stages.
- 🛠️ **Manual Fallback Console**: 7-step manual search and stage transition workflow with next-stage recommendation and validation error banners.
- 📜 **Chronological Traceability History**: Complete, immutable movement audit trail recording previous/new stage, operator, location, type, timestamp, and comments.
- 👥 **Admin User Directory**: Comprehensive user management supporting account creation, role assignment (`ADMIN` / `TECHNICIAN`), and active status toggling (`Active` / `Disabled`). Password hashes are never exposed.

---

## 4. Architecture

LabTrack Pro follows a **Decoupled Modular Monolith** architecture:

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                      React 19 + Vite Frontend Client                     │
│    (Tailwind CSS v4 • React Router v7 • Axios • Lucide Icons)            │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ HTTP / REST APIs + JWT Auth
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          FastAPI Backend Application                     │
│    (Uvicorn • Pydantic v2 • SQLAlchemy ORM • PyJWT • python-barcode)     │
└──────────────────┬─────────────────────────────────────┬─────────────────┘
                   │                                     │
                   ▼                                     ▼
┌──────────────────────────────────────┐ ┌─────────────────────────────────┐
│     PostgreSQL / SQLite Database     │ │ Static Barcode Asset Directory  │
│  (Users, Samples, Movements, Types)  │ │   (generated/barcodes/*.png)    │
└──────────────────────────────────────┘ └─────────────────────────────────┘
```

---

## 5. Technology Stack

### Backend Stack
- **Framework**: FastAPI (Python 3.10+)
- **ASGI Server**: Uvicorn
- **ORM**: SQLAlchemy 2.0
- **Validation**: Pydantic v2
- **Security & Auth**: PyJWT, Passlib (bcrypt)
- **Barcode Generator**: python-barcode (Code 128 format), Pillow (PIL)
- **Database Engine**: PostgreSQL (Production) / SQLite (Development Fallback)

### Frontend Stack
- **Core Framework**: React 19
- **Build System**: Vite 8
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **HTTP Client**: Axios (with Bearer Token Interceptors)
- **UI Components & Icons**: Lucide React

---

## 6. Project Structure

```text
LabTrack Pro/
├── Backend/
│   ├── app/
│   │   ├── core/                  # Security, JWT tokens, & dependencies
│   │   ├── database/              # DB connection session & seed initializers
│   │   ├── models/                # SQLAlchemy database models
│   │   ├── routers/               # FastAPI API endpoints
│   │   ├── schemas/               # Pydantic request & response schemas
│   │   └── services/              # Barcode & movement business logic
│   ├── generated/
│   │   └── barcodes/              # Generated Code 128 barcode PNG files
│   ├── test_*.py                  # Automated integration test scripts
│   ├── requirements.txt           # Python backend dependencies
│   └── .env                       # Environment configuration
│
└── Frontend/
    ├── src/
    │   ├── components/            # Reusable UI widgets (BarcodeInput, StatusBadge, Timeline, etc.)
    │   ├── context/               # AuthContext & RBAC state provider
    │   ├── pages/                 # Main page views (Dashboard, NewSample, Scanner, Movements, etc.)
    │   ├── routes/                # ProtectedRoute guard
    │   ├── services/              # Axios API service callers
    │   ├── App.jsx                # React Router root configuration
    │   ├── index.css              # Tailwind CSS & @media print styles
    │   └── main.jsx               # Vite entrypoint
    ├── package.json               # Frontend dependencies
    └── vite.config.js             # Vite build & dev server config
```

---

## 7. Database Architecture

The relational schema ensures strict referential integrity across all entities:

```text
  ┌──────────────┐         ┌─────────────────┐         ┌───────────────────────┐
  │    users     │         │  sample_types   │         │    workflow_stages    │
  ├──────────────┤         ├─────────────────┤         ├───────────────────────┤
  │ id (PK)      │         │ id (PK)         │         │ id (PK)               │
  │ username     │         │ name            │         │ name (RECEPTION, etc) │
  │ email        │         │ description     │         │ stage_order (1..4)    │
  │ password_hash│         │ is_active       │         │ is_active             │
  │ role         │         └────────┬────────┘         └───────────┬───────────┘
  │ is_active    │                  │                              │
  └──────┬───────┘                  │ 1                            │ 1
         │                          │                              │
         │ 1                        │ N                            │ N
         │                   ┌──────┴──────────┐                   │
         └───────────────────┤     samples     ├───────────────────┘
         │ N                 ├─────────────────┤
         │                   │ id (PK)         │
         │                   │ sample_code (UQ)│ <── (SMP-YYYY-NNNNNN)
         │                   │ barcode (UQ)    │
         │                   │ sample_type_id  │
         │                   │ current_stage_id│
         │                   │ location_id     │
         │                   │ created_by      │
         │                   └────────┬────────┘
         │                            │ 1
         │                            │
         │                            │ N
         │                   ┌────────┴────────┐
         └───────────────────┤ sample_movements│
           N                 ├─────────────────┤
                             │ id (PK)         │
                             │ sample_id (FK)  │
                             │ from_stage_id   │
                             │ to_stage_id     │
                             │ user_id (FK)    │
                             │ movement_type   │ <── (AUTOMATIC_SCAN / MANUAL / ADMIN_CORRECTION)
                             │ comment         │
                             │ timestamp       │
                             └─────────────────┘
```

---

## 8. Authentication

- **Protocol**: HTTP Bearer JWT (JSON Web Tokens) with HS256 signature algorithms.
- **Login Endpoint**: `POST /api/auth/login` accepts `{ username, password }` and returns token + user object.
- **Password Security**: Passwords are hashed using `bcrypt` salted password hashing. Password hashes are **never returned** in API responses.
- **Frontend Interceptor**: Axios interceptor in `src/services/api.js` attaches `Authorization: Bearer <token>` to every request and handles HTTP 401 expiration redirects.
- **Role-Based Access Control (RBAC)**:
  - `TECHNICIAN`: Allowed to view dashboard, intake samples, scan barcodes, and execute manual sequential movements.
  - `ADMIN`: Possesses full system rights including user management (`/users`), administrative stage corrections, and specimen deletion.

---

## 9. Barcode System

> **Crucial Concept**: The barcode image printed on physical tags contains **only a unique alphanumeric sample identifier** (e.g. `SMP-2026-000001`). All detailed sample metadata (Specimen Name, Species, Origin, Dates, Current Stage, Physical Location, Operator) are stored safely inside the **PostgreSQL relational database**.

When a barcode is scanned, the system reads the string `SMP-2026-000001` and fetches or updates the full record stored in PostgreSQL.

---

## 10. Code 128 Explanation

**Code 128** is a high-density, variable-length 1D linear barcode symbology capable of encoding all 128 ASCII characters. 

- **Why Code 128?**: Chosen for LabTrack Pro because it supports high-density numeric and alphanumeric codes, fits easily on small laboratory container tags, and is supported by 100% of standard 1D USB handheld optical scanners.
- **Asset Generation**: The backend uses Python's `python-barcode` library to generate vector Code 128 symbols saved as PNG images (`generated/barcodes/SMP-YYYY-NNNNNN.png`).

---

## 11. USB Barcode Scanner Explanation

> **Hardware Behavior**: Standard USB 1D handheld barcode scanners operate as **HID Keyboard Emulation** devices (Human Interface Devices).

- **How it Works**: When a technician pulls the trigger on a barcode label, the hardware scanner converts the optical lines into plain text (e.g. `SMP-2026-000001`) and "types" the characters sequentially into whatever input field currently has browser focus. Upon completing the string, the scanner transmits a trailing **`Carriage Return (Enter key)`**.
- **No Camera API Needed**: The application **does not require camera APIs (`getUserMedia`) or QR code JavaScript scanning libraries**. The `BarcodeInput` component keeps focus automatically, listens for the `Enter` key event, submits the request immediately, and clears the input.

---

## 12. Thermal Label Printer Explanation

Laboratory specimen tubes and containers use small thermal adhesive labels (typically **50mm x 25mm** / 2" x 1").

- **Software Architecture**: The software generates a 50x25mm Code 128 label layout containing the header, sample code, barcode image, specimen name, and reception date.
- **Print Execution**: Clicking **"Print Label"** renders the label in an isolated DOM container (`.printable-label-area`) and triggers the browser's print dialog via `window.print()`. Custom `@media print` CSS rules hide all UI elements (headers, sidebars, buttons) so only the adhesive label prints crisp and unscaled.
- *Note*: Physical spooling and direct hardware driver output rely on standard OS printer queue management.

---

## 13. Automatic Workflow

$$\text{SCAN BARCODE} \longrightarrow \text{FETCH SAMPLE} \longrightarrow \text{DETERMINE NEXT STAGE} \longrightarrow \text{ADVANCE STAGE} \longrightarrow \text{CONFIRM}$$

1. Technician opens the **USB Scanner Console** (`/scanner`).
2. Scans a specimen barcode (e.g. `SMP-2026-000001`).
3. Backend checks current stage (e.g. `RECEPTION` - Stage 1).
4. Backend automatically advances sample to `OVEN` (Stage 2) and logs an `AUTOMATIC_SCAN` movement.
5. Screen displays green confirmation banner:  
   > *"Sample SMP-2026-000001 successfully moved from Reception to Oven."*

---

## 14. Manual Fallback Workflow

When the hardware scanner is unplugged or a tag is torn, technicians use the **7-Step Manual Fallback Interface** (`/movements`):

1. **Enter Barcode**: Type `SMP-2026-000001` manually into the search box.
2. **Search Sample**: Click *Search Sample* to retrieve live details.
3. **See Current Stage**: Inspect current stage (`RECEPTION`) and location (`Reception Area`).
4. **See Next Recommended Stage**: View highlighted next stage (`2. OVEN ★ RECOMMENDED`).
5. **Select Destination Stage**: Choose target stage from dropdown.
6. **Add Optional Comment**: Add notes (e.g. *"Scanner hardware offline"*).
7. **Confirm Movement**: Click *Confirm Manual Movement*.

> **Validation Enforcement**: If a technician selects an unauthorized stage jump (e.g. skipping from `RECEPTION` directly to `STORAGE`), a red validation banner blocks the submission.

---

## 15. Sample Lifecycle

The complete specimen lifecycle follows 4 mandatory ordered stages:

```text
[1. RECEPTION] ──> [2. OVEN] ──> [3. ANALYSIS] ──> [4. STORAGE]
 (Intake & Tag)    (Moisture)    (Lab Testing)    (Archive/Final)
```

- Moving past Stage 4 (`STORAGE`) is blocked (returns HTTP 400).
- Administrators can execute an `ADMIN_CORRECTION` to move a sample backward or jump stages, but a **mandatory explanation comment** is required.

---

## 16. API Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT | Public |
| `GET` | `/api/auth/me` | Get current authenticated user profile | Bearer Token |
| `GET` | `/api/users` | List all users | Admin Only |
| `POST` | `/api/users` | Create a new user account | Admin Only |
| `PUT` | `/api/users/{id}` | Update user details/role/status | Admin Only |
| `GET` | `/api/samples` | List samples (with search/pagination) | Bearer Token |
| `POST` | `/api/samples` | Intake new sample & generate barcode | Bearer Token |
| `GET` | `/api/samples/{id}` | Get sample by ID | Bearer Token |
| `GET` | `/api/samples/barcode/{barcode}` | Get sample by barcode string | Bearer Token |
| `GET` | `/api/samples/{id}/history` | Get full movement history | Bearer Token |
| `POST` | `/api/scanner/scan` | Execute automatic scan stage advance | Bearer Token |
| `POST` | `/api/movements/manual` | Execute manual stage advance | Bearer Token |
| `POST` | `/api/movements/admin-correction` | Execute admin stage correction | Admin Only |
| `GET` | `/api/dashboard/statistics` | Get global KPIs and recent activity | Bearer Token |

---

## 17. Environment Variables

### Backend `.env`
```env
PROJECT_NAME="LabTrack Pro"
SECRET_KEY="your-super-secret-jwt-key-replace-in-production"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=480
DATABASE_URL="sqlite:///./labtrack.db"
# For PostgreSQL in production:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/labtrack_pro"
```

### Frontend `.env`
```env
VITE_API_BASE_URL="http://localhost:8000"
```

---

## 18. PostgreSQL Setup

To use PostgreSQL in production:

1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE labtrack_pro;
   CREATE USER labtrack_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE labtrack_pro TO labtrack_user;
   ```
2. Update `Backend/.env`:
   ```env
   DATABASE_URL="postgresql://labtrack_user:secure_password@localhost:5432/labtrack_pro"
   ```
3. Restart the backend. SQLAlchemy will automatically create all tables and populate initial seed data on startup.

---

## 19. Backend Installation

```powershell
# Navigate to Backend
cd Backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt
```

---

## 20. Frontend Installation

```powershell
# Navigate to Frontend
cd Frontend

# Install node dependencies
npm install
```

---

## 21. Running the Application

### Step 1: Start Backend Server
```powershell
cd Backend
uvicorn app.main:app --reload --port 8000
```
- API Root: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

### Step 2: Start Frontend Development Server
```powershell
cd Frontend
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 22. Default Seed Data

Upon initial database creation, the system seeds default accounts and workflow stages:

- **Default Accounts**:
  - **Admin**: Username: `admin` | Password: `admin123` | Role: `ADMIN`
  - **Technician**: Username: `technician` | Password: `tech123` | Role: `TECHNICIAN`
- **Default Workflow Stages**:
  1. `RECEPTION` (Order 1)
  2. `OVEN` (Order 2)
  3. `ANALYSIS` (Order 3)
  4. `STORAGE` (Order 4)
- **Default Sample Types**: Plant, Soil, Water, Tissue, Seed
- **Default Locations**: Reception Area, Oven Area, Laboratory, Storage Area

---

## 23. Testing

The backend includes 6 comprehensive automated integration test scripts covering 100% of functional requirements:

```powershell
cd Backend
$env:PYTHONIOENCODING="utf-8"

python test_auth_flow.py
python test_dashboard_statistics.py
python test_manual_and_admin_corrections.py
python test_movement_flow.py
python test_sample_history_flow.py
python test_samples_flow.py
```

---

## 24. Troubleshooting

- **Scanner not advancing stages**: Ensure the input field in `/scanner` is focused. Verify that your USB scanner is configured to send a trailing `Carriage Return (Enter)`.
- **Database Connection Error**: If PostgreSQL is not installed, leave `DATABASE_URL` unset or set to `sqlite:///./labtrack.db` to use the automatic SQLite fallback.
- **Port Conflicts**: If port 8000 is occupied, launch Uvicorn with `--port 8001` and update `VITE_API_BASE_URL` in `Frontend/.env`.

---

## 25. Future Improvements

- 📱 **Mobile Tablet Support**: Touch-optimized interface for handheld Windows/Android rugged laboratory tablets.
- 🖨️ **Direct Printer Spooling**: Direct ZPL/EPL raw socket driver integration for thermal printers (e.g. Zebra/Dymo).
- 📦 **Batch Scanning Mode**: Support scanning multi-sample trays in a single rapid batch operation.
- 📊 **Export Capabilities**: CSV/Excel export for sample audit trails and compliance reporting.
