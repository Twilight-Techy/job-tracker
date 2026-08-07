"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JobList } from "@/components/JobList";
import { JobModal, type Job } from "@/components/JobModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function DashboardJobsClient({ jobs, resumes }: { jobs: Job[], resumes: any[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleAddJob = () => {
    setSelectedJob(null);
    setModalOpen(true);
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setModalOpen(true);
  };

  const handleDelete = async (job: any) => {
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Job application deleted successfully");
        router.refresh();
      } else {
        toast.error("Failed to delete job application");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting job application");
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
          <p className="text-muted-foreground mt-1">Track and manage your job search journey.</p>
        </div>
        <Button onClick={handleAddJob} className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all rounded-full px-6">
          <Plus className="mr-2" size={18} />
          Add Application
        </Button>
      </div>

      <JobList jobs={jobs} onSelectJob={handleSelectJob} onDeleteJob={handleDelete} />
      
      <JobModal 
        isOpen={modalOpen} 
        onOpenChange={setModalOpen} 
        job={selectedJob} 
        resumes={resumes}
      />
    </>
  );
}
