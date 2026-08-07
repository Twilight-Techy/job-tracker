"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudArrowUp, FilePdf, FileText, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import { ResumeFormBuilder } from "@/components/ResumeFormBuilder";

interface Resume {
  id: number;
  name: string;
  type?: string;
  fileUrl?: string;
  content: any; // JSON
}

interface ResumeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  resume?: Resume | null; // null for create
}

export function ResumeModal({ isOpen, onOpenChange, resume }: ResumeModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [parsedContent, setParsedContent] = useState<any>({});
  const [builderMode, setBuilderMode] = useState<"form" | "json">("form");
  const [type, setType] = useState("builder");
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (resume) {
      setName(resume.name);
      setType(resume.type || "builder");
      setFileUrl(resume.fileUrl || "");
      if (resume.content) {
        setContent(JSON.stringify(resume.content, null, 2));
        setParsedContent(resume.content);
      } else {
        setContent("");
        setParsedContent({});
      }
    } else {
      setName("");
      setType("builder");
      setFileUrl("");
      setContent("");
      setParsedContent({});
      setSelectedFileName(null);
    }
  }, [resume, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFileName(e.target.files[0].name);
    }
  };

  const clearFile = () => {
    setSelectedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalFileUrl = fileUrl;
      let finalContent = null;

      if (type === "builder") {
        if (builderMode === "json") {
          try {
            finalContent = JSON.parse(content);
          } catch {
            toast.error("Invalid JSON format");
            setLoading(false);
            return;
          }
        } else {
          finalContent = parsedContent;
        }
      } else if (type === "upload") {
        if (!resume && fileInputRef.current?.files?.[0]) {
          const file = fileInputRef.current.files[0];
          const uploadRes = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
            method: 'POST',
            body: file,
          });
          if (!uploadRes.ok) {
            throw new Error("Failed to upload file");
          }
          const blob = await uploadRes.json();
          finalFileUrl = blob.url;
        } else if (!resume && !fileInputRef.current?.files?.[0]) {
          toast.error("Please select a file to upload.");
          setLoading(false);
          return;
        }
      }

      const endpoint = resume ? `/api/resumes/${resume.id}` : "/api/resumes";
      const method = resume ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          fileUrl: finalFileUrl,
          content: finalContent,
        }),
      });

      if (res.ok) {
        toast.success(resume ? "Resume updated successfully" : "Resume added successfully");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error("Failed to save resume");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{resume ? "Edit Resume" : "Create New Resume"}</DialogTitle>
          <DialogDescription>
            {resume ? "Modify your resume details below." : "Add a new resume variant."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resumeName">Resume Name</Label>
            <Input 
              id="resumeName" 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Frontend Engineer Variant"
            />
          </div>

          <Tabs value={type} onValueChange={setType} className="w-full">
            {!resume && (
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="builder">JSON Builder</TabsTrigger>
                <TabsTrigger value="upload">Upload File</TabsTrigger>
                <TabsTrigger value="link">Provide Link</TabsTrigger>
              </TabsList>
            )}

            <TabsContent value="builder" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="resumeContent">Resume Data</Label>
                <div className="flex bg-muted/50 p-1 rounded-lg">
                  <Button type="button" variant="ghost" size="sm" onClick={() => {
                    if (builderMode === "json") {
                      try {
                        setParsedContent(JSON.parse(content || "{}"));
                      } catch {
                        toast.error("Please fix JSON errors before switching to form view");
                        return;
                      }
                    }
                    setBuilderMode("form");
                  }} className={`h-7 text-xs px-3 ${builderMode === "form" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Form View</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => {
                    if (builderMode === "form") {
                      setContent(JSON.stringify(parsedContent, null, 2));
                    }
                    setBuilderMode("json");
                  }} className={`h-7 text-xs px-3 ${builderMode === "json" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>JSON View</Button>
                </div>
              </div>

              {builderMode === "form" ? (
                <div className="bg-card/50 border rounded-xl p-4 mt-2">
                  <ResumeFormBuilder content={parsedContent} setContent={setParsedContent} />
                </div>
              ) : (
                <Textarea 
                  id="resumeContent" 
                  required={type === "builder"} 
                  rows={15}
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  placeholder='{"experience": [...], "education": [...]}'
                  className="font-mono text-sm"
                />
              )}
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 mt-4">
              {!resume ? (
                <div className="space-y-2">
                  <Label>Select File (PDF, DOCX)</Label>
                  <div 
                    className="mt-2 border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center bg-card/50 hover:bg-accent/30 transition-colors cursor-pointer relative"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      id="fileUpload" 
                      type="file"
                      accept=".pdf,.doc,.docx"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    {!selectedFileName ? (
                      <>
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                          <CloudArrowUp size={32} weight="duotone" />
                        </div>
                        <h4 className="text-sm font-semibold mb-1">Click to upload your resume</h4>
                        <p className="text-xs text-muted-foreground text-center">
                          Supports PDF, DOC, DOCX up to 5MB.
                        </p>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center relative w-full">
                        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                          {selectedFileName?.toLowerCase().endsWith('.doc') || selectedFileName?.toLowerCase().endsWith('.docx') ? (
                            <FileText size={32} weight="fill" />
                          ) : (
                            <FilePdf size={32} weight="fill" />
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-center break-all">{selectedFileName}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-6 -right-6 rounded-full h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearFile();
                          }}
                          type="button"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center">
                    Files are securely hosted via Vercel Blob.
                  </p>
                </div>
              ) : (
                <div className="text-sm p-6 bg-accent/30 rounded-xl text-center border border-border/50 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                     {fileUrl?.toLowerCase().endsWith('.doc') || fileUrl?.toLowerCase().endsWith('.docx') ? (
                       <FileText size={24} weight="fill" />
                     ) : (
                       <FilePdf size={24} weight="fill" />
                     )}
                  </div>
                  <p className="font-medium text-foreground">Uploaded File</p>
                  <a href={fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline mt-2 inline-block break-all max-w-full">
                    {fileUrl}
                  </a>
                  <p className="text-muted-foreground mt-4 text-xs">To replace this file, please delete this one and create a new resume entry.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="link" className="space-y-2 mt-4">
              <Label htmlFor="externalLink">External Link (Google Drive, OneDrive, etc.)</Label>
              <Input 
                id="externalLink" 
                type="url"
                required={type === "link"}
                value={fileUrl} 
                onChange={(e) => setFileUrl(e.target.value)} 
                placeholder="https://..."
              />
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6 pt-4 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Resume"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
