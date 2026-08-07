# 💼 JobTracker

JobTracker is a modern, privacy-focused, AI-ready job application tracking system built to help you land your dream job faster. It allows you to track your job applications, tailor resumes, and seamlessly integrate your data with your favorite local AI desktop agents (like Claude Desktop, Cursor, and Windsurf) via the Model Context Protocol (MCP).

## ✨ Features

- **Application Tracking**: Keep track of the jobs you've applied to, along with salary, notes, and application status.
- **Dynamic Resumes**: Build and store tailored resumes optimized for specific job applications.
- **Master Context**: A central hub containing your base profile data (education, experiences, links).
- **AI Agent Integration**: Natively exposes an MCP (Model Context Protocol) server. Point your local AI agent (like Claude Desktop or Cursor) to the server to securely grant it access to read and update your JobTracker data.
- **Privacy First**: Fully local SQLite database configuration. Your data never leaves your environment unless you explicitly expose it.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Database:** [SQLite](https://sqlite.org/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** [Better Auth](https://better-auth.com/)
- **UI:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** [Phosphor Icons](https://phosphoricons.com/)
- **AI Integration:** [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Twilight-Techy/job-tracker.git
cd job-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Database Setup

JobTracker uses a local SQLite database (`sqlite.db`). Run the Drizzle migrations to set up the schema:

```bash
npm run db:push
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Sign up for an account to access the dashboard.

## 🤖 Model Context Protocol (MCP) Integration

JobTracker comes with a built-in MCP server that allows Desktop AI Agents to securely interact with your applications and resumes.

### How to use it:

1. Log into your JobTracker Dashboard and go to the **Settings & API** page to generate an API key.
2. The MCP server runs independently from the Next.js dev server. Start it by running:
   ```bash
   npm run mcp
   ```
3. Open your Desktop AI Agent (Claude, Cursor, etc.) and configure it to connect to your local MCP server via Server-Sent Events (SSE) using the URL provided in the `MCP & Integrations` dashboard page.

Once connected, your AI agent can automatically fetch job descriptions, read your master context, generate tailored resumes, and save them directly to your database!

## 📜 License

This project is licensed under the MIT License.
