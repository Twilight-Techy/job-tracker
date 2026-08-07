"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "@phosphor-icons/react";
import { generateApiKey } from "./actions";

export function SettingsClient({ apiKey }: { apiKey: string | null }) {
  const [copied, setCopied] = useState(false);
  const [copiedMcpCursor, setCopiedMcpCursor] = useState(false);
  const [copiedMcpClaude, setCopiedMcpClaude] = useState(false);
  const [copiedMcpAntigravity, setCopiedMcpAntigravity] = useState(false);

  const handleCopy = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        <h1 className="text-3xl font-bold tracking-tight">Settings & API</h1>
        <p className="text-muted-foreground mt-1">Manage your integrations and API keys.</p>
      </div>
      
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>AI Agent Integration</CardTitle>
          <CardDescription>
            Use the API Key below to allow your preferred AI Agent to interact with your Job Tracker on your behalf. The AI can manage jobs and resumes through the REST API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Your API Key</Label>
            <div className="flex gap-2">
              <Input 
                id="api-key"
                readOnly 
                value={apiKey || "No API Key generated yet"} 
                className={`font-mono ${!apiKey && 'text-muted-foreground'}`}
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleCopy} 
                disabled={!apiKey}
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <form action={generateApiKey}>
            <Button type="submit">
              {apiKey ? "Regenerate API Key" : "Generate API Key"}
            </Button>
          </form>
        </CardFooter>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Deployed MCP Server Configuration</CardTitle>
          <CardDescription>
            Configure your AI Agent to connect to your deployed MCP server via Server-Sent Events (SSE). 
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
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Connect your accounts to pull your data for resume building.
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
                    We use a Bring-Your-Own-Agent approach. You do not need to connect your GitHub directly to this app.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm mt-4">
                  <p>1. Go to your GitHub Settings &gt; Developer Settings &gt; Personal Access Tokens.</p>
                  <p>2. Generate a new Fine-grained Personal Access Token with read access to your repositories.</p>
                  <p>3. Configure your local AI Desktop Agent (e.g., Claude, Cursor) to use the <strong>official GitHub MCP Server</strong>, and provide it with your newly generated token.</p>
                  <p>4. Your agent will now be able to securely read your repos using the GitHub MCP tool and update your Master Context using the JobTracker MCP tool!</p>
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
                    We use a Bring-Your-Own-Agent approach. You do not need to OAuth with LinkedIn directly.
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
