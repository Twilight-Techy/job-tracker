"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ResumeList } from "@/components/ResumeList";
import { ResumeModal } from "@/components/ResumeModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function DashboardResumesClient({ resumes }: { resumes: any[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState<any | null>(null);

  const handleAddResume = () => {
    setSelectedResume(null);
    setModalOpen(true);
  };

  const handleEditResume = (resume: any) => {
    setSelectedResume(resume);
    setModalOpen(true);
  };

  const handleDelete = async (resume: any) => {
    try {
      const res = await fetch(`/api/resumes/${resume.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Resume deleted successfully");
        router.refresh();
      } else {
        toast.error("Failed to delete resume");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting resume");
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saved Resumes</h1>
          <p className="text-muted-foreground mt-1">Manage and download your generated resumes.</p>
        </div>
        <Button onClick={handleAddResume} className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all rounded-full px-6">
          <Plus className="mr-2" size={18} />
          New Resume
        </Button>
      </div>

      <ResumeList 
        resumes={resumes} 
        onEditResume={handleEditResume} 
        onDeleteResume={handleDelete}
      />
      
      <ResumeModal 
        isOpen={modalOpen} 
        onOpenChange={setModalOpen} 
        resume={selectedResume} 
      />
    </>
  );
}
