# Global Account Bank (GAB) - Pre-Payment Workflow Tool

GAB is an enterprise-grade Angular 17 application designed to manage the strict, auditable pipeline for high-net-worth client payment instructions. It enforces separation of duties through a robust Maker/Checker workflow before transactions are routed to payment platforms like Citi Direct.

## 🏗️ Architecture & Tech Stack

- **Framework:** Angular 17.3.5
- **Architecture:** Hybrid (Non-Standalone `AppModule` root with Lazy-Loaded Standalone Feature Components).
- **State Management:** NgRx 17 (Store, Effects, Actions, Selectors)
- **UI & Styling:** 
  - Bootstrap 5 (Responsive Grid & Utility classes)
  - Custom SCSS (Pega/Citi Enterprise styling)
- **Data Visualization:** 
  - AG Grid Community (Complex tabular data, attachments, and queues)
  - Highcharts Angular (Management dashboard metrics and distribution charts)

## 🗂️ Core Workflows

1. **Admin Maker (Creation):** Captures multi-section form data via `ReactiveFormsModule` with strict validation.
2. **Admin Checker (Verification):** Read-only review of Maker data.
3. **Operations (Validation & Callback):** Signature verification, document uploads (via AG Grid), and audit trailing.
4. **Dashboard:** High-level overview utilizing Highcharts for distribution and AG grid for queue management.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- Angular CLI (`npm install -g @angular/cli@17.3.8`)

### Installation

1. Clone the repository and navigate into the directory:
   \`\`\`bash
   cd gab-payment-workflow
   \`\`\`

2. Install the dependencies (Ensure peer dependencies match the `package.json` exact versions):
   \`\`\`bash
   npm install --legacy-peer-deps
   \`\`\`
   *(Note: `--legacy-peer-deps` may be required depending on your local NPM configuration and the specific Highcharts/AG-Grid versions).*

3. Start the development server:
   \`\`\`bash
   ng serve
   \`\`\`

4. Open your browser and navigate to `http://localhost:4200/`.

## 📂 Project Structure Overview

- `src/app/core/`: Singleton services (API endpoints), guards, and models.
- `src/app/features/`: Smart, standalone components mapped to routes (`dashboard`, `instruction-setup`, `instruction-workflow`).
- `src/app/shared/`: Reusable, dumb UI components (`notifications`, `modals`, `workflow-stepper`).
- `src/app/store/`: NgRx state management, broken down by feature (`instruction`, `ui`, `auth`).

## 🔗 Future Integrations
The application is currently utilizing RxJS `delay` to simulate API latency via the `InstructionService`. Future iterations will replace these mock endpoints with REST/GraphQL connections to the Node.js/Java backend and the forthcoming Citi Direct APIs.