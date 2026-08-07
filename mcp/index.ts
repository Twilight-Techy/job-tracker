import express from "express";
import cors from "cors";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";

// Import DB and schema from the existing app
import { db } from "../src/db";
import { jobs, resumes, userSettings, baseContexts } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function verifyApiKeyAndGetUser(req: express.Request): Promise<string> {
  const authHeader = req.headers.authorization;
  const queryKey = req.query.apiKey as string;

  let apiKey = queryKey;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    apiKey = authHeader.substring(7);
  }

  if (!apiKey) {
    throw new Error("API Key is missing. Provide it via 'Authorization: Bearer <KEY>' header or '?apiKey=<KEY>' query parameter.");
  }

  // Lookup the user by API key
  const settings = await db.select().from(userSettings).where(eq(userSettings.apiKey, apiKey)).limit(1);
  if (settings.length === 0) {
    throw new Error("Invalid API Key provided.");
  }

  return settings[0].userId;
}

const app = express();
app.use(cors());

// A map to keep track of transports per session ID if needed, 
// but for a simple single-tenant setup, one transport is usually enough.
// The SDK handles session IDs internally.
let transport: SSEServerTransport | null = null;
let server: Server | null = null;

// Ensure server is instantiated
function getOrInitServer() {
  if (server) return server;

  server = new Server(
    {
      name: "JobTracker-MCP",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "get_applications",
          description: "Retrieve a list of the user's tracked job applications.",
          inputSchema: {
            type: "object",
            properties: {
              status: { type: "string", description: "Optional status to filter by (e.g. Applied, Interviewing, Rejected)" },
            },
          },
        },
        {
          name: "add_application",
          description: "Add a new job application entry.",
          inputSchema: {
            type: "object",
            properties: {
              company: { type: "string" },
              jobTitle: { type: "string" },
              country: { type: "string" },
              location: { type: "string" },
              type: { type: "string", description: "Freelance, Full-time, Part-time, Contract" },
              workMode: { type: "string", description: "Remote, On Site, Hybrid" },
              applicationLink: { type: "string" },
              deadline: { type: "string", description: "ISO date string" },
              dateApplied: { type: "string", description: "ISO date string" },
              status: { type: "string", description: "Applied, Interview, Offer, Rejected, etc." },
              feedbackDate: { type: "string", description: "ISO date string" },
              source: { type: "string" },
              priority: { type: "string", description: "High, Medium, Low" },
              referralUsed: { type: "boolean" },
              currency: { type: "string" },
              estimatedMonthlySalaryOriginal: { type: "number" },
              level: { type: "string" },
              sponsorshipOffered: { type: "boolean" },
              requirements: { type: "string" },
              resumeUsedId: { type: "number" },
              notes: { type: "string" },
            },
            required: ["company", "jobTitle"],
          },
        },
        {
          name: "update_application",
          description: "Update fields on an existing job application.",
          inputSchema: {
            type: "object",
            properties: {
              id: { type: "number", description: "The ID of the job application" },
              company: { type: "string" },
              jobTitle: { type: "string" },
              country: { type: "string" },
              location: { type: "string" },
              type: { type: "string" },
              workMode: { type: "string" },
              applicationLink: { type: "string" },
              deadline: { type: "string" },
              dateApplied: { type: "string" },
              status: { type: "string" },
              feedbackDate: { type: "string" },
              source: { type: "string" },
              priority: { type: "string" },
              referralUsed: { type: "boolean" },
              currency: { type: "string" },
              estimatedMonthlySalaryOriginal: { type: "number" },
              level: { type: "string" },
              sponsorshipOffered: { type: "boolean" },
              requirements: { type: "string" },
              resumeUsedId: { type: "number" },
              notes: { type: "string" },
            },
            required: ["id"],
          },
        },
        {
          name: "get_resumes",
          description: "Retrieve a list of the user's available resumes.",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "get_resume_content",
          description: "Fetch the specific content of a resume. Returns the full resume object (including JSON content for builder types, or fileUrl for links/uploads).",
          inputSchema: {
            type: "object",
            properties: {
              id: { type: "number", description: "The ID of the resume" },
            },
            required: ["id"],
          },
        },
        {
          name: "create_resume",
          description: "Create a new resume (builder JSON variant, file upload, or external link) for the user, tailored for a specific application.",
          inputSchema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "The name of the resume (e.g. 'Frontend Engineer Variant')",
              },
              type: {
                type: "string",
                enum: ["builder", "upload", "link"],
                description: "The type of resume. Defaults to builder.",
              },
              fileUrl: {
                type: "string",
                description: "The URL of the file if type is upload or link.",
              },
              content: {
                type: "object",
                description: "The strict JSON content for builder resumes.",
                properties: {
                  personalInfo: {
                    type: "object",
                    properties: {
                      fullName: { type: "string" },
                      email: { type: "string" },
                      phone: { type: "string" },
                      location: { type: "string" },
                      linkedin: { type: "string" },
                      github: { type: "string" },
                      portfolio: { type: "string" }
                    }
                  },
                  summary: { type: "string" },
                  experience: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        company: { type: "string" },
                        location: { type: "string" },
                        startDate: { type: "string" },
                        endDate: { type: "string" },
                        description: {
                          type: "array",
                          items: { type: "string" }
                        }
                      }
                    }
                  },
                  education: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        degree: { type: "string" },
                        school: { type: "string" },
                        location: { type: "string" },
                        startDate: { type: "string" },
                        endDate: { type: "string" },
                        gpa: { type: "string" },
                        coursework: { type: "string" }
                      }
                    }
                  },
                  skills: {
                    type: "array",
                    items: { type: "string" }
                  },
                  skillCategories: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string" },
                        items: {
                          type: "array",
                          items: { type: "string" }
                        }
                      }
                    }
                  },
                  projects: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: {
                          type: "array",
                          items: { type: "string" }
                        },
                        link: { type: "string" }
                      }
                    }
                  },
                  certifications: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        issuer: { type: "string" },
                        date: { type: "string" }
                      }
                    }
                  },
                  achievements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: {
                          type: "array",
                          items: { type: "string" }
                        }
                      }
                    }
                  }
                }
              },
            },
            required: ["name"],
          },
        },
        {
          name: "update_resume",
          description: "Update an existing resume (JSON variant, upload, or link).",
          inputSchema: {
            type: "object",
            properties: {
              id: {
                type: "number",
                description: "The ID of the resume to update.",
              },
              name: {
                type: "string",
                description: "The name of the resume (e.g. 'Frontend Engineer Variant')",
              },
              type: {
                type: "string",
                enum: ["builder", "upload", "link"],
                description: "The type of resume. Defaults to builder.",
              },
              fileUrl: {
                type: "string",
                description: "The URL of the file if type is upload or link.",
              },
              content: {
                type: "object",
                description: "The strict JSON content for builder resumes.",
                properties: {
                  personalInfo: {
                    type: "object",
                    properties: {
                      fullName: { type: "string" },
                      email: { type: "string" },
                      phone: { type: "string" },
                      location: { type: "string" },
                      linkedin: { type: "string" },
                      github: { type: "string" },
                      portfolio: { type: "string" }
                    }
                  },
                  summary: { type: "string" },
                  experience: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        company: { type: "string" },
                        location: { type: "string" },
                        startDate: { type: "string" },
                        endDate: { type: "string" },
                        description: {
                          type: "array",
                          items: { type: "string" }
                        }
                      }
                    }
                  },
                  education: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        degree: { type: "string" },
                        school: { type: "string" },
                        location: { type: "string" },
                        startDate: { type: "string" },
                        endDate: { type: "string" },
                        gpa: { type: "string" },
                        coursework: { type: "string" }
                      }
                    }
                  },
                  skills: {
                    type: "array",
                    items: { type: "string" }
                  },
                  skillCategories: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string" },
                        items: {
                          type: "array",
                          items: { type: "string" }
                        }
                      }
                    }
                  },
                  projects: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: {
                          type: "array",
                          items: { type: "string" }
                        },
                        link: { type: "string" }
                      }
                    }
                  },
                  certifications: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        issuer: { type: "string" },
                        date: { type: "string" }
                      }
                    }
                  },
                  achievements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: {
                          type: "array",
                          items: { type: "string" }
                        }
                      }
                    }
                  }
                }
              },
            },
            required: ["id"],
          },
        },

        {
          name: "get_base_context",
          description: "Fetch the user's master resume base context. Useful to see existing data or what is missing before updating.",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "update_base_context",
          description: "Update or overwrite the user's master resume base context. Use this after extracting data from LinkedIn/GitHub to save it for the user.",
          inputSchema: {
            type: "object",
            properties: {
              content: {
                type: "string",
                description: "The raw markdown/text content containing all of the user's unstructured experience, skills, projects, and education.",
              },
            },
            required: ["content"],
          },
        },
      ],
    };
  });

  return server;
}

app.post("/register", (req, res) => {
  res.json({ client_id: "job-tracker", client_secret: "job-tracker-secret" });
});

app.all("/.well-known/*", (req, res) => {
  res.json({
    issuer: "https://jobtracker-mcp.onrender.com",
    authorization_endpoint: "https://jobtracker-mcp.onrender.com/sse",
    token_endpoint: "https://jobtracker-mcp.onrender.com/sse",
    registration_endpoint: "https://jobtracker-mcp.onrender.com/register"
  });
});

app.all("/sse", async (req, res) => {
  try {
    // We authenticate immediately on connection
    const userId = await verifyApiKeyAndGetUser(req);

    // Store userId in response locals so subsequent handlers (if they could access it) have it.
    // However, tool execution requests will come via POST /messages which is handled by the transport.
    // Since MCP doesn't pass the req to tool handlers directly, we need to authenticate again in the POST /messages
    // or rely on a session mapping. For simplicity and robustness on stateless serverless like Render, 
    // we require the API key on POST /messages too, or we can use a session map.
    // Actually, we'll authenticate in the POST route too.
    console.log(`SSE Connection established for user: ${userId}`);

    transport = new SSEServerTransport("/messages", res);
    const mcpServer = getOrInitServer();

    // Re-register tool handler to capture the authenticated userId or use a global context.
    // Since this is a simple implementation, we'll wrap the logic to extract userId during the tool call.
    // However, the tool handler doesn't get the HTTP req.
    // The safest way is to bind a custom handler when the transport connects if we needed isolated state,
    // but a global server is standard in MCP. We can map session IDs to User IDs if needed.
    // We will use a sessionMap.
    await mcpServer.connect(transport);
  } catch (error: any) {
    console.error("SSE Auth Error:", error.message);
    res.status(401).json({ error: error.message });
  }
});

// Map to store userId for the current session (For simplicity in this single-process node app)
// A robust implementation would parse session_id from the MCP payload, but the SDK doesn't expose it easily to the tool handler.
// We will just fetch it again via a middleware on POST /messages and store it globally for the tick.
let currentUserIdContext: string | null = null;

app.post("/messages", async (req, res) => {
  try {
    const userId = await verifyApiKeyAndGetUser(req);
    currentUserIdContext = userId;

    if (!transport) {
      return res.status(400).json({ error: "SSE connection not established" });
    }

    await transport.handlePostMessage(req, res);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  } finally {
    currentUserIdContext = null;
  }
});

// Re-register tool handler with dynamic user context
const mcpServer = getOrInitServer();
mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const userId = currentUserIdContext;
  if (!userId) {
    return { content: [{ type: "text", text: `Authentication Error: User context missing` }], isError: true };
  }

  try {
    switch (request.params.name) {
      case "get_applications": {
        const { status } = request.params.arguments as any;
        let query = db.select().from(jobs).where(eq(jobs.userId, userId));
        const allJobs = await query;
        const filteredJobs = status ? allJobs.filter(j => j.status?.toLowerCase() === status.toLowerCase()) : allJobs;
        return { content: [{ type: "text", text: JSON.stringify(filteredJobs, null, 2) }] };
      }

      case "add_application": {
        const args = request.params.arguments as any;
        const insertData = { ...args, userId };
        if (args.deadline) insertData.deadline = new Date(args.deadline);
        if (args.dateApplied) insertData.dateApplied = new Date(args.dateApplied);
        else insertData.dateApplied = new Date();
        if (args.feedbackDate) insertData.feedbackDate = new Date(args.feedbackDate);

        const newJob = await db.insert(jobs).values(insertData).returning();
        return { content: [{ type: "text", text: JSON.stringify(newJob[0], null, 2) }] };
      }

      case "update_application": {
        const { id, ...updates } = request.params.arguments as any;
        const existing = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
        if (!existing.length || existing[0].userId !== userId) {
          return { content: [{ type: "text", text: "Application not found or unauthorized." }], isError: true };
        }

        if (updates.deadline) updates.deadline = new Date(updates.deadline);
        if (updates.dateApplied) updates.dateApplied = new Date(updates.dateApplied);
        if (updates.feedbackDate) updates.feedbackDate = new Date(updates.feedbackDate);

        const updatedJob = await db.update(jobs).set(updates).where(eq(jobs.id, id)).returning();
        return { content: [{ type: "text", text: JSON.stringify(updatedJob[0], null, 2) }] };
      }

      case "get_resumes": {
        const allResumes = await db.select().from(resumes).where(eq(resumes.userId, userId));
        const safeResumes = allResumes.map(r => ({ id: r.id, name: r.name, type: r.type }));
        return { content: [{ type: "text", text: JSON.stringify(safeResumes, null, 2) }] };
      }

      case "get_resume_content": {
        const { id } = request.params.arguments as any;
        const resume = await db.select().from(resumes).where(eq(resumes.id, id)).limit(1);
        if (!resume.length || resume[0].userId !== userId) {
          return { content: [{ type: "text", text: "Resume not found or unauthorized." }], isError: true };
        }
        return { content: [{ type: "text", text: JSON.stringify(resume[0], null, 2) }] };
      }

      case "create_resume": {
        const { name, content, type, fileUrl } = request.params.arguments as any;
        const newResume = await db.insert(resumes).values({
          userId,
          name,
          content,
          type: type || "builder",
          fileUrl: fileUrl || null,
        }).returning();
        return { content: [{ type: "text", text: JSON.stringify(newResume[0], null, 2) }] };
      }

      case "update_resume": {
        const { id, ...updates } = request.params.arguments as any;
        const existing = await db.select().from(resumes).where(eq(resumes.id, id)).limit(1);
        if (!existing.length || existing[0].userId !== userId) {
          return { content: [{ type: "text", text: "Resume not found or unauthorized." }], isError: true };
        }

        const updatedResume = await db.update(resumes).set(updates).where(eq(resumes.id, id)).returning();
        return { content: [{ type: "text", text: JSON.stringify(updatedResume[0], null, 2) }] };
      }

      case "get_base_context": {
        const contextData = await db.select().from(baseContexts).where(eq(baseContexts.userId, userId)).limit(1);
        if (!contextData.length) {
          return { content: [{ type: "text", text: "No base context found for this user." }] };
        }
        return { content: [{ type: "text", text: JSON.stringify(contextData[0].content, null, 2) }] };
      }

      case "update_base_context": {
        const { content } = request.params.arguments as any;
        const existing = await db.select().from(baseContexts).where(eq(baseContexts.userId, userId)).limit(1);

        let updated;
        if (existing.length > 0) {
          updated = await db.update(baseContexts)
            .set({ content, updatedAt: new Date() })
            .where(eq(baseContexts.userId, userId))
            .returning();
        } else {
          updated = await db.insert(baseContexts)
            .values({ userId, content })
            .returning();
        }
        return { content: [{ type: "text", text: JSON.stringify(updated[0], null, 2) }] };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
    }
  } catch (e: any) {
    return { content: [{ type: "text", text: `Error executing tool: ${e.message}` }], isError: true };
  }
});

const PORT = process.env.PORT || 3001;

async function run() {
  if (process.argv.includes("--stdio")) {
    const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");

    // In Stdio mode, we assume the environment variable provides the API key or we operate in trusted local mode.
    // To strictly enforce the key even locally:
    const apiKey = process.env.JOB_TRACKER_API_KEY;
    if (!apiKey) {
      console.error("Missing JOB_TRACKER_API_KEY environment variable");
      process.exit(1);
    }

    const settings = await db.select().from(userSettings).where(eq(userSettings.apiKey, apiKey)).limit(1);
    if (settings.length === 0) {
      console.error("Invalid JOB_TRACKER_API_KEY");
      process.exit(1);
    }

    currentUserIdContext = settings[0].userId;
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
    console.error("Job Tracker MCP Server running with Stdio transport");
  } else {
    app.listen(PORT, () => {
      console.log(`Job Tracker MCP Server running with SSE on port ${PORT}`);
    });
  }
}

run().catch(console.error);
