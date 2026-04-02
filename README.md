# RecepForge

RecepForge is a role-based clinic management platform designed to streamline operations for receptionists and doctors. It provides secure, separate dashboards for appointment scheduling, patient registry management, and clinical documentation.

## Core Features

- **Role-Based Access Control:** Highly secure, dedicated workspaces for Receptionists and Doctors.
- **OPD Scheduling:** One-click appointment booking with auto-conflict detection.
- **Live Appointment Queue:** Real-time status board tracking patient journeys.
- **Patient Registry:** Complete patient profiles with demographics and medical history.
- **Doctor Workspace:** SOAP-format clinical notes, one-tap visit flow, and historical records.
- **Real-Time Sync:** Instant UI updates across all devices powered by a WebSocket database.

## Tech Stack

- **Frontend:** Next.js (App Router), React 19, Tailwind CSS v4
- **Backend & Database:** Convex (Real-time Database and Serverless Functions)
- **Authentication:** Clerk Auth

## Setup Instructions

1. **Clone the repository:**
   \`\`\`bash
   git clone <repo_url>
   cd recepforge-webapp
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables:**
   Copy the example environment file and fill in your keys:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

4. **Initialize Backend:**
   \`\`\`bash
   npx convex dev
   \`\`\`

5. **Run the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.
