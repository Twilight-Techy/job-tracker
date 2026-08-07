"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Check, Robot, PencilSimple, X } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export function ProfileClient({ initialContext, userId }: { initialContext: any, userId: string }) {
  const getInitialString = () => {
    if (!initialContext) return "";
    if (typeof initialContext === "string") return initialContext;
    return JSON.stringify(initialContext, null, 2);
  };

  const [content, setContent] = useState(getInitialString());
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/context", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        toast.success("Context saved successfully");
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error("Failed to save context");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error saving context");
    } finally {
      setSaving(false);
    }
  };

  const copyPrompt = () => {
    const prompt = `I need you to build my master resume base context. 
1. Read my exported LinkedIn PDF (attached).
2. Look at my GitHub repositories to extract my top projects.
3. Call the "update_base_context" tool from the JobTracker MCP Server to save the extracted unstructured markdown text.`;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Master Resume Context</h2>
          <p className="text-muted-foreground mt-1 text-sm max-w-xl">
            This is your unstructured master context. Paste anything here: LinkedIn summaries, GitHub readmes, 
            skill lists, or rough bullet points. Your AI agent will read this raw text to build a tailored resume or application later.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="shrink-0 bg-primary/10 text-primary hover:bg-primary/20">
              <Robot className="mr-2" size={20} weight="duotone" />
              Agent Setup Instructions
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Bring Your Own Agent (MCP)</DialogTitle>
              <DialogDescription>
                Use your favorite desktop AI agent (Claude Desktop, Cursor, Gemini Desktop, etc.) to automatically dump your history into your flexible context using the Job Tracker MCP tool.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Step 1: Setup the MCP Tool</h4>
                <p className="text-sm text-muted-foreground">
                  Ensure your agent is configured to use the Job Tracker MCP server running locally on port 3001, and that it has access to your GitHub Personal Access Token if you want it to fetch private repositories.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Step 2: Provide LinkedIn Data</h4>
                <p className="text-sm text-muted-foreground">
                  Go to your LinkedIn profile, click "More" and select "Save to PDF". Attach this PDF to your chat with the AI agent.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Step 3: Run the Prompt</h4>
                <p className="text-sm text-muted-foreground">
                  Copy and paste the following prompt to your agent:
                </p>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap font-mono text-muted-foreground">
                    I need you to build my master resume base context.&#10;
                    1. Read my exported LinkedIn PDF (attached).&#10;
                    2. Look at my GitHub repositories to extract my top projects.&#10;
                    3. Call the "update_base_context" tool from the JobTracker MCP Server to save the extracted unstructured markdown text.
                  </pre>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={copyPrompt}
                  >
                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border rounded-xl shadow-sm flex flex-col min-h-[600px]">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h3 className="font-medium text-lg">Context Data</h3>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <PencilSimple className="mr-2" size={16} />
              Edit Manually
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
              <X className="mr-2" size={16} />
              Cancel Edit
            </Button>
          )}
        </div>

        <div className="flex-1 p-6 relative overflow-y-auto max-h-[800px]">
          {isEditing ? (
            <Textarea 
              className="min-h-[500px] w-full font-mono text-sm resize-y p-4 focus-visible:ring-primary/20 bg-background"
              placeholder="# Experience&#10;&#10;...&#10;&#10;# Skills&#10;&#10;...&#10;&#10;Dump all your raw career context here! Markdown works best."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-h1:text-xl prose-h2:text-lg">
              {content ? (
                <ReactMarkdown>{content}</ReactMarkdown>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground text-center">
                  <Robot size={48} className="mb-4 opacity-50" />
                  <p>Your master context is empty.</p>
                  <p className="text-sm mt-2 max-w-sm">
                    Use your AI agent to populate this automatically, or click "Edit Manually" to paste your data.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {isEditing && (
          <div className="p-4 bg-muted/30 border-t border-border flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving Context..." : "Save Master Context"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
