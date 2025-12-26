# CCM Executive Dashboard - Architecture Overview

This document outlines the technical architecture and data pipeline for the CCM Executive Dashboard, a React-based application designed for strategic analysis in the Sim Companies game.

## High-Level Architecture

The application follows a simple, yet effective, three-tiered architecture designed for rapid development and clear data flow.

1.  **Data Layer (Raw & Analytical)**: The foundation of the application, containing both the raw, unprocessed data and the cleaned, structured data ready for consumption.
2.  **Application Layer (React Frontend)**: The user-facing dashboard, built with React and Vite, which consumes the structured data.
3.  **Presentation Layer (Browser)**: The rendered HTML, CSS, and JavaScript that the user interacts with.

## Data Pipeline

The core of this project is its data pipeline, which transforms raw, often manually-exported data into a structured format that the dashboard can display.

```
[raw_data/*.csv] -> [Manual Parsing (AI)] -> [analytical_layer/*.json] -> [React Components]
```

### 1. Raw Data (`/raw_data`)

-   **Source**: This directory is the designated location for all raw data exports from the game or related tools.
-   **Format**: The primary format is Comma-Separated Values (`.csv`), such as the `sim-companies-warehouse_intraday.csv` file.
-   **Role**: This folder serves as the initial entry point for any new information that needs to be integrated into the dashboard. It represents the "unprocessed" state of the data.

### 2. Manual Parsing & Transformation (AI-Assisted)

-   **Process**: At present, the transformation from raw data to the analytical layer is a manual process performed by the AI assistant (GitHub Copilot).
-   **Tasks**:
    -   Reading the contents of files in the `/raw_data` directory.
    -   Parsing the CSV data.
    -   Calculating derived metrics (e.g., total value, cost per unit).
    -   Structuring the data into a consistent JSON format.
-   **Future State**: This step could be automated in the future with dedicated scripts if the data export format remains consistent.

### 3. Analytical Layer (`/analytical_layer`)

-   **Source**: This directory contains the "single source of truth" for the entire frontend application.
-   **Format**: Data is stored in structured JSON files, with `core_reporting.json` being the primary dataset.
-   **Role**: This layer acts as a clean, predictable, and easy-to-consume API for the React components. By decoupling the raw data from the application, we can change data sources or parsing logic without needing to refactor the UI components.

### 4. Frontend Consumption (React Application)

-   **Process**: The main `App.jsx` component fetches the data from the `/analytical_layer/core_reporting.json` file when the application loads.
-   **Data Flow**: The fetched data is stored in the main component's state and passed down as props to the relevant child components (`Workspace.jsx`, `Warehouse.jsx`, `Benchmarks.jsx`, etc.).
-   **Rendering**: Each component is responsible for rendering a specific piece of the data, ensuring a modular and maintainable codebase.

## Technology Stack

-   **Frontend Framework**: React 18
-   **Build Tool**: Vite
-   **Styling**: Tailwind CSS
-   **Language**: JavaScript (JSX)
-   **Data Format**: JSON

---

## Future Architecture & Automation

This section outlines the planned evolution of the CCM Executive Dashboard from a local development tool to a fully automated, cloud-hosted web application.

### Overview: Cloud Migration Strategy

The future architecture will transform the current manual data pipeline into an automated, cloud-based system using Firebase services. This will enable real-time updates, automated data processing, and public web access.

### Phase 1: Cloud Backend Setup (Firebase Firestore)

**Objective**: Migrate the analytical layer to a cloud-based database.

-   **Analytical Dataset (Firestore)**:
    -   Create a Firebase Firestore database that mirrors the current `analytical_layer/core_reporting.json` structure.
    -   This becomes the new "single source of truth" for the live dashboard.
    -   Database structure will be finalized once all necessary data requirements are confirmed.
    -   Collections will be organized to match the current JSON hierarchy (operations, inventory, long_term_goals, etc.).

### Phase 2: Upstream Pipeline - Raw Data Ingestion

**Objective**: Automate the ingestion and processing of raw CSV files.

#### 2.1 Raw Data Storage (Cloud Storage Bucket)

-   **Google Cloud Storage Bucket**: A designated bucket will serve as the landing zone for all raw CSV exports.
-   **Upload Methods**:
    -   **Manual Upload Tool**: A simple web interface to upload CSV files directly from local machine to the cloud bucket.
    -   **Automated Script**: A local script that can be run to automatically upload CSV files from a designated folder.

#### 2.2 Data Processing Pipeline (Cloud Functions)

-   **Trigger Mechanisms** (to be determined):
    -   **Option A**: Cloud Storage trigger - automatically fires when a new file is uploaded to the bucket.
    -   **Option B**: Time-based trigger - runs on a scheduled interval (e.g., every hour).
    -   **Option C**: Manual trigger - activated when the local upload tool is used, ensuring immediate processing.

-   **Processing Workflow**:
    1. **File Detection**: New CSV files arrive in the `raw_data/` bucket.
    2. **Move to Working Directory**: Files are moved to a `processing/` directory within the bucket.
    3. **Parse & Transform**: Cloud Function parses the CSV, calculates derived metrics, and structures the data.
    4. **Update Firestore**: Parsed data is written to the appropriate Firestore collections, updating the analytical layer.
    5. **Archive**: Processed CSV files are moved to an `archive/` directory for historical record-keeping.

### Phase 3: Downstream Integration - Live Dashboard

**Objective**: Connect the React application to live cloud data sources.

#### 3.1 Data Source Migration

-   **Replace Local JSON**: Update `App.jsx` to fetch data from Firestore instead of `/analytical_layer/core_reporting.json`.
-   **Firestore SDK Integration**: Implement Firebase SDK in the React app to read from Firestore collections.
-   **Real-time Listeners**: Use Firestore's real-time listeners to automatically update the dashboard when data changes.

#### 3.2 Downstream Functions (Optional Enhancements)

-   **Data Enrichment**: Cloud Functions that run when Firestore data changes to calculate additional metrics or link related data.
-   **Trigger Options**:
    -   **Database Triggers**: Fire when specific Firestore collections are updated.
    -   **Scheduled Functions**: Run at regular intervals to refresh calculated fields.

#### 3.3 Enhanced Live Data Integration

-   **SimCo API Expansion**: Leverage the existing Vite proxy setup to integrate more live API calls from `api.simcotools.com`.
-   **Market Data**: Expand beyond the current market ticker to include additional live market analytics.
-   **Being Online Advantage**: With the dashboard hosted online, CORS issues will be eliminated, enabling direct API calls without a proxy.

### Phase 4: Hosting & Deployment

**Objective**: Make the dashboard publicly accessible via Firebase Hosting.

-   **Firebase Project**: Deploy to the existing `rts-labs` Firebase project.
-   **Hosting URLs**:
    -   **Initial**: `ccm-dash.web.app` (Firebase default subdomain).
    -   **Custom Domain**: `ccm-dash.labs.rapidtechconsultants.com` (to be configured with DNS later).
-   **Build & Deploy**:
    -   Use Vite's production build (`npm run build`).
    -   Deploy the built static files to Firebase Hosting.
    -   Configure Firebase Hosting to serve the React SPA correctly.

### Phase 5: Data Refresh Strategy

**Objective**: Keep the dashboard current with minimal latency.

-   **Automatic Refresh Interval**: The dashboard will poll Firestore for updates every **30 minutes** initially.
-   **Tuning**: Monitor performance and adjust the interval based on:
    -   Server load and costs.
    -   User experience and data freshness requirements.
-   **Real-time Updates**: For critical metrics, consider using Firestore's real-time listeners to push updates instantly.

---

## Future Data Flow Diagram

```
[Local CSV Export] 
    ↓
[CSV Upload Tool/Script] 
    ↓
[Cloud Storage: raw_data/] 
    ↓
[Cloud Function: Triggered on Upload/Schedule] 
    ↓
[Processing: Parse CSV → Calculate Metrics] 
    ↓
[Firestore: Analytical Layer] 
    ↓
[Cloud Storage: archive/] (Original CSV)
    ↓
[React App (Hosted on Firebase)] ← [Firestore Real-time Listeners]
    ↓
[User's Browser]
```

---

## Migration Checklist

- [ ] Set up Firebase Firestore database structure
- [ ] Create Cloud Storage buckets (raw_data, processing, archive)
- [ ] Develop CSV upload web tool
- [ ] Write Cloud Functions for CSV parsing and Firestore updates
- [ ] Configure Cloud Function triggers (upload/schedule/manual)
- [ ] Update React app to use Firestore SDK
- [ ] Replace local JSON data sources with Firestore queries
- [ ] Test data pipeline end-to-end
- [ ] Configure Firebase Hosting in `rts-labs` project
- [ ] Deploy React app to Firebase Hosting
- [ ] Test live dashboard at `ccm-dash.web.app`
- [ ] Configure custom domain DNS for `ccm-dash.labs.rapidtechconsultants.com`
- [ ] Implement 30-minute refresh interval
- [ ] Monitor and optimize performance
