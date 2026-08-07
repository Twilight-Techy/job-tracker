"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Check, Briefcase, FileText, Brain } from "@phosphor-icons/react";
import Link from "next/link";

export function MCPClient({ apiKey }: { apiKey: string | null }) {
  const [copiedMcpCursor, setCopiedMcpCursor] = useState(false);
  const [copiedMcpClaude, setCopiedMcpClaude] = useState(false);
  const [copiedMcpAntigravity, setCopiedMcpAntigravity] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mcpUrl = mounted 
    ? (window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin) 
    : 'https://your-mcp-app.onrender.com';

  const cursorConfig = `{
  "mcpServers": {
    "job-tracker": {
      "type": "sse",
      "url": "${mcpUrl}/sse?apiKey=${apiKey || 'YOUR_API_KEY'}"
    }
  }
}`;

  const claudeConfig = `{
  "mcpServers": {
    "job-tracker": {
      "command": "npx",
      "args": [
        "-y",
        "@smithery/cli@latest",
        "proxy",
        "${mcpUrl}/sse?apiKey=${apiKey || 'YOUR_API_KEY'}"
      ]
    }
  }
}`;

  const antigravityConfig = `{
  "mcpServers": {
    "job-tracker": {
      "serverUrl": "${mcpUrl}/sse?apiKey=${apiKey || 'YOUR_API_KEY'}"
    }
  }
}`;

  const handleCopyMcpCursor = () => {
    navigator.clipboard.writeText(cursorConfig);
    setCopiedMcpCursor(true);
    setTimeout(() => setCopiedMcpCursor(false), 2000);
  };

  const handleCopyMcpClaude = () => {
    navigator.clipboard.writeText(claudeConfig);
    setCopiedMcpClaude(true);
    setTimeout(() => setCopiedMcpClaude(false), 2000);
  };

  const handleCopyMcpAntigravity = () => {
    navigator.clipboard.writeText(antigravityConfig);
    setCopiedMcpAntigravity(true);
    setTimeout(() => setCopiedMcpAntigravity(false), 2000);
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">MCP & AI Integrations</h1>
        <p className="text-muted-foreground mt-1">
          Connect your favorite Desktop AI agents (like Claude Desktop, Cursor, or Antigravity) directly to your Job Tracker.
        </p>
      </div>

      {!apiKey && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">API Key Required</CardTitle>
            <CardDescription className="text-destructive/80">
              You haven't generated an API key yet. Please go to your <Link href="/dashboard/settings" className="underline font-bold">Settings</Link> to generate one before configuring MCP.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Deployed MCP Server Configuration</CardTitle>
          <CardDescription>
            Configure your AI Agent to connect to your deployed MCP server via Server-Sent Events (SSE). 
            Your API Key is already injected below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="antigravity" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="antigravity">Antigravity</TabsTrigger>
              <TabsTrigger value="cursor">Cursor / Windsurf</TabsTrigger>
              <TabsTrigger value="claude">Claude Desktop</TabsTrigger>
            </TabsList>

            <TabsContent value="antigravity">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Antigravity supports SSE endpoints natively via the <code>serverUrl</code> property. Add this to your <code>mcp_config.json</code>:
                </p>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap font-mono text-muted-foreground overflow-x-auto pr-12">
{antigravityConfig}
                  </pre>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={handleCopyMcpAntigravity}
                  >
                    {copiedMcpAntigravity ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="cursor">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap font-mono text-muted-foreground overflow-x-auto pr-12">
{cursorConfig}
                </pre>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={handleCopyMcpCursor}
                >
                  {copiedMcpCursor ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="claude">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Claude Desktop does not natively support SSE URLs yet, so it requires an npx proxy command.
                </p>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap font-mono text-muted-foreground overflow-x-auto pr-12">
{claudeConfig}
                  </pre>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={handleCopyMcpClaude}
                  >
                    {copiedMcpClaude ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Available Tools for AI Agents</CardTitle>
          <CardDescription>
            Once connected, your AI agent can use the following tools to manage your data automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2"><Briefcase className="text-primary" /> Applications (Jobs)</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li><strong>get_applications:</strong> Retrieve a list of your tracked job applications.</li>
              <li><strong>add_application:</strong> Add a new job application entry (including title, company, requirements, salary, etc.).</li>
              <li><strong>update_application:</strong> Update fields on an existing job application.</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2"><FileText className="text-primary" /> Resumes</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li><strong>get_resumes:</strong> Retrieve a list of your available resumes.</li>
              <li><strong>get_resume_content:</strong> Fetch the specific content of a resume (JSON builder format, file upload, or external link).</li>
              <li><strong>create_resume:</strong> Create a new customized resume for a specific application.</li>
              <li><strong>update_resume:</strong> Update an existing resume.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2"><Brain className="text-primary" /> Master Context</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li><strong>get_base_context:</strong> Fetch your master resume base context to see existing data or identify missing details.</li>
              <li><strong>update_base_context:</strong> Update or overwrite your master resume base context. Great for extracting and saving data from your GitHub or LinkedIn.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>External Integrations (Bring Your Own Agent)</CardTitle>
          <CardDescription>
            Use your AI agent to securely pull external data directly into your Master Context.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
            <div>
              <h3 className="font-medium">GitHub Integration</h3>
              <p className="text-sm text-muted-foreground">Pull your repositories and stats.</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Connect GitHub</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Connect GitHub</DialogTitle>
                  <DialogDescription>
                    You do not need to connect your GitHub directly to this app.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm mt-4">
                  <p>1. Go to your GitHub Settings &gt; Developer Settings &gt; Personal Access Tokens.</p>
                  <p>2. Generate a new Fine-grained Personal Access Token with read access to your repositories.</p>
                  <p>3. Configure your local AI Desktop Agent to use the <strong>official GitHub MCP Server</strong> with this token.</p>
                  <p>4. Your agent will now be able to securely read your repos and update your Master Context using the JobTracker MCP tools!</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
            <div>
              <h3 className="font-medium">LinkedIn Integration</h3>
              <p className="text-sm text-muted-foreground">Pull your work experience and education.</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Connect LinkedIn</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Connect LinkedIn</DialogTitle>
                  <DialogDescription>
                    You do not need to OAuth with LinkedIn directly.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm mt-4">
                  <p>1. Go to your LinkedIn Profile page.</p>
                  <p>2. Click the <strong>More</strong> button (next to Add profile section).</p>
                  <p>3. Select <strong>Save to PDF</strong>.</p>
                  <p>4. Drag and drop this PDF into your chat with your Desktop AI Agent (configured with our MCP Server), and tell it to update your base context!</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
