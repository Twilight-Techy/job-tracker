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

let outputData = "";

child.stdout.on("data", (data) => {
  const str = data.toString();
  outputData += str;
  console.log("MCP OUT:", str);
});

child.stderr.on("data", (data) => {
  console.error("MCP STDERR:", data.toString());
});

const initReq = JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "antigravity-agent", version: "1.0.0" }
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
      level: "Staff",
      workMode: "Hybrid",
      sponsorshipOffered: true,
      applicationLink: "https://stripe.com/jobs/staff-software-engineer-infrastructure",
      deadline: "2026-09-15T23:59:59.000Z",
      dateApplied: "2026-08-07T00:00:00.000Z",
      status: "Applied",
      feedbackDate: "2026-08-25T00:00:00.000Z",
      source: "LinkedIn",
      priority: "High",
      referralUsed: true,
      currency: "USD",
      estimatedMonthlySalaryOriginal: 22000,
      requirements: "• 8+ years of experience designing and scaling distributed storage, compute, or networking infrastructure\n• Strong background in systems programming (Go, C++, Rust)\n• Expertise with Kubernetes, cloud architecture, and multi-tenant platforms\n• Proven track record of leading complex technical initiatives across engineering teams",
      notes: "Submitted via employee referral from Platform Architect. Recruiter screen scheduled for mid-August."
    }
  }
}) + "\n";

child.stdin.write(initReq);
setTimeout(() => {
  child.stdin.write(toolCallReq);
}, 1500);

setTimeout(() => {
  child.kill();
  process.exit(0);
}, 4500);
