"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { FilePdf, DownloadSimple, CalendarBlank, FileText, Link as LinkIcon, FileDoc, Eye, Layout, Trash, DotsThreeVertical } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Resume {
  id: number;
  name: string;
  createdAt: Date | null;
  type?: string;
  fileUrl?: string;
}

export function ResumeList({ resumes, onEditResume, onDeleteResume }: { resumes: Resume[], onEditResume?: (resume: Resume) => void, onDeleteResume?: (resume: Resume) => void }) {
  const router = useRouter();
  
  if (resumes.length === 0) {
    return (
      <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed">
        <FileText size={48} className="text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No resumes saved</h3>
        <p className="text-muted-foreground max-w-sm">
          Create your first resume using the builder above to get started.
        </p>
      </Card>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="overflow-hidden rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm mt-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border/50">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold">Resume Name</th>
              <th scope="col" className="px-6 py-4 font-semibold">Format</th>
              <th scope="col" className="px-6 py-4 font-semibold">Created</th>
              <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <motion.tbody variants={container}>
            {resumes.map((resume) => {
              const isLink = resume.type === "link";
              const isUpload = resume.type === "upload" || (resume.type === "link" && resume.fileUrl && !resume.fileUrl.startsWith('http'));
              const isPdf = resume.fileUrl?.toLowerCase().endsWith(".pdf");
              const isBuilder = resume.type === "builder" || !resume.type;
              const linkUrl = `/resumes/${resume.id}`;

              return (
                <motion.tr 
                  key={resume.id} 
                  variants={item}
                  onClick={() => router.push(linkUrl)}
                  className="bg-transparent border-b border-border/30 hover:bg-muted/10 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        {isBuilder ? <Layout size={20} weight="fill" /> : isLink ? <LinkIcon size={20} weight="fill" /> : isPdf ? <FilePdf size={20} weight="fill" /> : <FileDoc size={20} weight="fill" />}
                      </div>
                      <span className="line-clamp-1">{resume.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <span className="capitalize">{resume.type || "Builder"}</span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <div className="flex items-center">
                      <CalendarBlank className="mr-2" size={16} />
                      {resume.createdAt ? formatDistanceToNow(new Date(resume.createdAt), { addSuffix: true }).replace(/^\w/, c => c.toUpperCase()) : 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      <Button asChild variant="default" size="sm" className="h-8 shadow-sm">
                        <Link href={linkUrl}>
                          <Eye className="mr-1.5" size={14} />
                          View
                        </Link>
                      </Button>
                      <Button variant="secondary" size="sm" className="h-8 shadow-sm bg-secondary text-secondary-foreground hover:bg-secondary/80" onClick={() => onEditResume?.(resume)}>
                        <FileText className="mr-1.5" size={14} />
                        Edit
                      </Button>
                      {onDeleteResume && (
                        <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-muted"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DotsThreeVertical size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                                  <Trash className="mr-2" size={14} />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your resume "{resume.name}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteResume(resume);
                                }}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>
    </motion.div>
  );
}
