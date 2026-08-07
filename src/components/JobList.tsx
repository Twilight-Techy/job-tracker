"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Briefcase, BuildingOffice, CalendarBlank, MapPin, Trash, DotsThreeVertical } from "@phosphor-icons/react";
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

import { Job } from "@/components/JobModal";

export function JobList({ jobs, onSelectJob, onDeleteJob }: { jobs: Job[], onSelectJob?: (job: Job) => void, onDeleteJob?: (job: Job) => void }) {
  if (jobs.length === 0) {
    return (
      <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed">
        <Briefcase size={48} className="text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
        <p className="text-muted-foreground max-w-sm">
          Start tracking your next career move by adding your first job application.
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

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'offer': return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case 'rejected': return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      case 'interview': return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      default: return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
    }
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
              <th scope="col" className="px-6 py-4 font-semibold">Job Title</th>
              <th scope="col" className="px-6 py-4 font-semibold">Company</th>
              <th scope="col" className="px-6 py-4 font-semibold">Location</th>
              <th scope="col" className="px-6 py-4 font-semibold">Status</th>
              <th scope="col" className="px-6 py-4 font-semibold">Applied</th>
              <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <motion.tbody variants={container}>
            {jobs.map((job) => (
              <motion.tr 
                key={job.id} 
                variants={item}
                onClick={() => onSelectJob?.(job)}
                className="bg-transparent border-b border-border/30 hover:bg-muted/10 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                  {job.jobTitle}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-muted-foreground">
                    <BuildingOffice className="mr-2" size={16} />
                    {job.company}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-muted-foreground">
                    {job.location ? (
                      <>
                        <MapPin className="mr-2" size={16} />
                        {job.location}
                      </>
                    ) : (
                      <span className="text-muted-foreground/50">-</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="secondary" className={`${getStatusColor(job.status)} border-0`}>
                    {job.status || 'Applied'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  <div className="flex items-center">
                    <CalendarBlank className="mr-2" size={16} />
                    {job.dateApplied ? formatDistanceToNow(new Date(job.dateApplied), { addSuffix: true }).replace(/^\w/, c => c.toUpperCase()) : 'Unknown'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2 transition-opacity">
                    {onDeleteJob && (
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
                              This action cannot be undone. This will permanently delete your job application for {job.jobTitle} at {job.company}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteJob(job);
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
            ))}
          </motion.tbody>
        </table>
      </div>
    </motion.div>
  );
}
