import { spawn } from "child_process";

const processEnv = {
  ...process.env,
  JOB_TRACKER_API_KEY: process.env.JOB_TRACKER_API_KEY || "",
};

const child = spawn("npx", ["tsx", "--env-file=.env.local", "mcp/index.ts", "--stdio"], {
  cwd: "C:/MyProjects/job-tracker",
  env: processEnv,
  shell: true,
});

child.stdout.on("data", (data) => {
  console.log("=== MCP STDIO JSON-RPC RESPONSE ===");
  console.log(data.toString());
});

child.stderr.on("data", (data) => {
  console.error("STDIO Stderr:", data.toString());
});

const initReq = JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "antigravity-test-client", version: "1.0.0" }
  }
}) + "\n";

const toolCallReq = JSON.stringify({
  jsonrpc: "2.0",
  id: 2,
  method: "tools/call",
  params: {
    name: "add_application",
    arguments: {
      company: "Stripe",
      jobTitle: "Staff Software Engineer - Infrastructure",
      country: "United States",
      location: "San Francisco, CA",
      type: "Full-time",
      level: "Senior",
      workMode: "Hybrid",
      sponsorshipOffered: true,
      applicationLink: "https://stripe.com/jobs/staff-software-engineer",
      deadline: "2026-09-01T00:00:00.000Z",
      dateApplied: "2026-08-07T00:00:00.000Z",
      status: "Applied",
      feedbackDate: "2026-08-14T00:00:00.000Z",
      source: "LinkedIn",
      priority: "High",
      referralUsed: true,
      currency: "USD",
      estimatedMonthlySalaryOriginal: 18500,
      requirements: "• 7+ years experience with distributed systems\n• PostgreSQL performance tuning\n• TypeScript / Go / Rust",
      notes: "Referred by Alex from the Platform team. Recruiter chat scheduled for next Tuesday."
    }
  }
}) + "\n";

child.stdin.write(initReq);
setTimeout(() => {
  child.stdin.write(toolCallReq);
}, 1200);

setTimeout(() => {
  child.kill();
  process.exit(0);
}, 3500);
