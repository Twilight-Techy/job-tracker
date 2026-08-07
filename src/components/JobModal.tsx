"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export interface Job {
  id: number;
  company: string;
  jobTitle: string;
  country: string | null;
  location: string | null;
  type: string | null;
  level: string | null;
  workMode: string | null;
  sponsorshipOffered: boolean | null;
  status: string | null;
  applicationLink: string | null;
  deadline: Date | string | null;
  dateApplied: Date | string | null;
  feedbackDate: Date | string | null;
  source: string | null;
  priority: string | null;
  referralUsed: boolean | null;
  currency: string | null;
  estimatedMonthlySalaryOriginal: number | null;
  resumeUsedId: number | null;
  requirements: string | null;
  notes: string | null;
  createdAt: Date | string | null;
}

interface JobModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  job?: Job | null; // null means create mode
  resumes?: any[];
}

export function JobModal({ isOpen, onOpenChange, job, resumes = [] }: JobModalProps) {
  const router = useRouter();
  
  const mode = job ? 'view' : 'create';
  const [isEditing, setIsEditing] = useState(mode === 'create');
  const [loading, setLoading] = useState(false);
  const [liveRates, setLiveRates] = useState<Record<string, number> | null>(null);
  const [liveRatesLoading, setLiveRatesLoading] = useState(false);

  const [formData, setFormData] = useState({
    company: "",
    jobTitle: "",
    country: "",
    location: "",
    type: "Full-time",
    workMode: "Remote",
    status: "To Apply",
    applicationLink: "",
    deadline: "",
    dateApplied: "",
    feedbackDate: "",
    source: "",
    priority: "Medium",
    referralUsed: "false",
    currency: "USD",
    estimatedMonthlySalaryOriginal: "",
    resumeUsedId: "none",
    level: "Entry-level",
    sponsorshipOffered: "false",
    requirements: "",
    notes: ""
  });

  const formatDateForInput = (dateVal: any) => {
    if (!dateVal) return "";
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (job) {
      setIsEditing(false);
      setFormData({
        company: job.company || "",
        jobTitle: job.jobTitle || "",
        country: job.country || "",
        location: job.location || "",
        type: job.type || "Full-time",
        workMode: job.workMode || "Remote",
        status: job.status || "Applied",
        applicationLink: job.applicationLink || "",
        deadline: formatDateForInput(job.deadline),
        dateApplied: formatDateForInput(job.dateApplied),
        feedbackDate: formatDateForInput(job.feedbackDate),
        source: job.source || "",
        priority: job.priority || "Medium",
        referralUsed: job.referralUsed ? "true" : "false",
        currency: job.currency || "USD",
        estimatedMonthlySalaryOriginal: job.estimatedMonthlySalaryOriginal?.toString() || "",
        resumeUsedId: job.resumeUsedId?.toString() || "none",
        level: job.level || "Entry-level",
        sponsorshipOffered: job.sponsorshipOffered ? "true" : "false",
        requirements: job.requirements || "",
        notes: job.notes || ""
      });
    } else {
      setIsEditing(true);
      setFormData({
        company: "",
        jobTitle: "",
        country: "",
        location: "",
        type: "Full-time",
        workMode: "Remote",
        status: "To Apply",
        applicationLink: "",
        deadline: "",
        dateApplied: "",
        feedbackDate: "",
        source: "",
        priority: "Medium",
        referralUsed: "false",
        currency: "USD",
        estimatedMonthlySalaryOriginal: "",
        resumeUsedId: "none",
        level: "Entry-level",
        sponsorshipOffered: "false",
        requirements: "",
        notes: ""
      });
    }
  }, [job, isOpen]);

  // Fetch live rates when in view mode and there's a salary to display
  useEffect(() => {
    if (!isOpen || isEditing || !job || job.estimatedMonthlySalaryOriginal === null || !job.currency) {
      return;
    }

    const fetchRates = async () => {
      setLiveRatesLoading(true);
      try {
        const rateRes = await fetch(`/api/currency?from=${job.currency}&to=NGN`);
        if (rateRes.ok) {
          const data = await rateRes.json();
          if (data.rates) {
            setLiveRates(data.rates);
          }
        }
      } catch (err) {
        console.error("Failed to fetch live rates");
      } finally {
        setLiveRatesLoading(false);
      }
    };
    
    fetchRates();
  }, [isOpen, isEditing, job]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = job ? `/api/jobs/${job.id}` : "/api/jobs";
      const method = job ? "PUT" : "POST";
      
      const payload = {
        ...formData,
        referralUsed: formData.referralUsed === "true",
        sponsorshipOffered: formData.sponsorshipOffered === "true",
        resumeUsedId: formData.resumeUsedId === "none" ? null : parseInt(formData.resumeUsedId),
        deadline: formData.deadline || null,
        dateApplied: formData.dateApplied || null,
        feedbackDate: formData.feedbackDate || null,
        estimatedMonthlySalaryOriginal: formData.estimatedMonthlySalaryOriginal || null,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(job ? "Application updated successfully" : "Application added successfully");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error("Failed to save application");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving application");
    } finally {
      setLoading(false);
    }
  };

  const dateToUseForTimeSince = job?.dateApplied || job?.createdAt;
  const rawTimeSince = dateToUseForTimeSince ? formatDistanceToNow(new Date(dateToUseForTimeSince)) : null;
  const timeSinceApplied = rawTimeSince ? rawTimeSince.charAt(0).toUpperCase() + rawTimeSince.slice(1) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{job ? (isEditing ? 'Edit Application' : 'Application Details') : 'Add Application'}</DialogTitle>
          <DialogDescription>
            {job && !isEditing ? "View details below. Click edit to make changes." : "Fill out the details of your job application."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 pt-2">
            
            {!isEditing && job && (
              <div className="mb-6 p-4 bg-muted/50 rounded-lg flex flex-wrap gap-4 text-sm">
                {timeSinceApplied && (
                  <div className="flex-1 min-w-[120px]">
                    <span className="block text-muted-foreground mb-1">Time Since Applied</span>
                    <span className="font-semibold">{timeSinceApplied} ago</span>
                  </div>
                )}
                {job.estimatedMonthlySalaryOriginal !== null && (
                  <>
                    <div className="flex-1 min-w-[120px]">
                      <span className="block text-muted-foreground mb-1">Monthly Salary</span>
                      <span className="font-semibold">
                        {job.currency === "USD" ? "$" : job.currency === "GBP" ? "£" : job.currency === "EUR" ? "€" : job.currency === "NGN" ? "₦" : ""}
                        {Math.round(job.estimatedMonthlySalaryOriginal).toLocaleString()} {job.currency}
                      </span>
                    </div>
                    {job.currency !== "USD" && (
                      <div className="flex-1 min-w-[120px]">
                        <span className="block text-muted-foreground mb-1">Equivalent (USD)</span>
                        <span className="font-semibold">
                          {liveRatesLoading ? "Loading..." : liveRates?.USD ? `$${Math.round(job.estimatedMonthlySalaryOriginal * liveRates.USD).toLocaleString()}` : "-"}
                        </span>
                      </div>
                    )}
                    {job.currency !== "NGN" && (
                      <div className="flex-1 min-w-[120px]">
                        <span className="block text-muted-foreground mb-1">Equivalent (NGN)</span>
                        <span className="font-semibold">
                          {liveRatesLoading ? "Loading..." : liveRates?.NGN ? `₦${Math.round(job.estimatedMonthlySalaryOriginal * liveRates.NGN).toLocaleString()}` : "-"}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company {isEditing && '*'}</Label>
                <Input id="company" name="company" value={formData.company} onChange={handleChange} required={isEditing} readOnly={!isEditing} className={!isEditing ? "bg-muted" : ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title {isEditing && '*'}</Label>
                <Input id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} required={isEditing} readOnly={!isEditing} className={!isEditing ? "bg-muted" : ""} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Job Type</Label>
                <Select disabled={!isEditing} value={formData.type} onValueChange={(val) => handleSelectChange('type', val)}>
                  <SelectTrigger id="type" className={!isEditing ? "bg-muted opacity-100" : ""}>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select disabled={!isEditing} value={formData.level} onValueChange={(val) => handleSelectChange('level', val)}>
                  <SelectTrigger id="level" className={!isEditing ? "bg-muted opacity-100" : ""}>
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Entry-level">Entry-level</SelectItem>
                    <SelectItem value="Mid-level">Mid-level</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workMode">Work Mode</Label>
                <Select disabled={!isEditing} value={formData.workMode} onValueChange={(val) => handleSelectChange('workMode', val)}>
                  <SelectTrigger id="workMode" className={!isEditing ? "bg-muted opacity-100" : ""}>
                    <SelectValue placeholder="Work Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="On Site">On Site</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" value={formData.country} onChange={handleChange} readOnly={!isEditing} className={!isEditing ? "bg-muted" : ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location / City</Label>
                <Input id="location" name="location" value={formData.location} onChange={handleChange} readOnly={!isEditing} className={!isEditing ? "bg-muted" : ""} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select disabled={!isEditing} value={formData.status} onValueChange={(val) => handleSelectChange('status', val)}>
                  <SelectTrigger id="status" className={!isEditing ? "bg-muted opacity-100" : ""}>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Apply">To Apply</SelectItem>
                    <SelectItem value="Applied">Applied</SelectItem>
                    <SelectItem value="Interview">Interview</SelectItem>
                    <SelectItem value="Offer">Offer</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select disabled={!isEditing} value={formData.priority} onValueChange={(val) => handleSelectChange('priority', val)}>
                  <SelectTrigger id="priority" className={!isEditing ? "bg-muted opacity-100" : ""}>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" type="date" name="deadline" value={formData.deadline} onChange={handleChange} readOnly={!isEditing} className={!isEditing ? "bg-muted" : ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateApplied">Date Applied</Label>
                <Input id="dateApplied" type="date" name="dateApplied" value={formData.dateApplied} onChange={handleChange} readOnly={!isEditing} className={!isEditing ? "bg-muted" : ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedbackDate">Feedback Date</Label>
                <Input id="feedbackDate" type="date" name="feedbackDate" value={formData.feedbackDate} onChange={handleChange} readOnly={!isEditing} className={!isEditing ? "bg-muted" : ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Source (e.g. LinkedIn, Indeed)</Label>
                <Input id="source" name="source" value={formData.source} onChange={handleChange} readOnly={!isEditing} className={!isEditing ? "bg-muted" : ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralUsed">Referral Used?</Label>
                <Select disabled={!isEditing} value={formData.referralUsed} onValueChange={(val) => handleSelectChange('referralUsed', val)}>
                  <SelectTrigger id="referralUsed" className={!isEditing ? "bg-muted opacity-100" : ""}>
                    <SelectValue placeholder="Referral Used" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="resumeUsedId">Resume Used</Label>
                <Select disabled={!isEditing} value={formData.resumeUsedId} onValueChange={(val) => handleSelectChange('resumeUsedId', val)}>
                  <SelectTrigger id="resumeUsedId" className={!isEditing ? "bg-muted opacity-100" : ""}>
                    <SelectValue placeholder="Select Resume" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {resumes.map(r => (
                      <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sponsorshipOffered">Visa / Relocation Sponsorship</Label>
                <Select disabled={!isEditing} value={formData.sponsorshipOffered} onValueChange={(val) => handleSelectChange('sponsorshipOffered', val)}>
                  <SelectTrigger id="sponsorshipOffered" className={!isEditing ? "bg-muted opacity-100" : ""}>
                    <SelectValue placeholder="Sponsorship Offered" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedMonthlySalaryOriginal">Monthly Salary</Label>
                <div className="flex gap-2">
                  <Input id="estimatedMonthlySalaryOriginal" type="number" name="estimatedMonthlySalaryOriginal" value={formData.estimatedMonthlySalaryOriginal} onChange={handleChange} readOnly={!isEditing} className={`flex-1 ${!isEditing ? "bg-muted" : ""}`} placeholder="Amount" />
                  <Select disabled={!isEditing} value={formData.currency} onValueChange={(val) => handleSelectChange('currency', val)}>
                    <SelectTrigger id="currency" className={`w-[100px] ${!isEditing ? "bg-muted opacity-100" : ""}`}>
                      <SelectValue placeholder="Cur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="NGN">NGN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicationLink">Application Link</Label>
                <Input id="applicationLink" name="applicationLink" value={formData.applicationLink} onChange={handleChange} readOnly={!isEditing} className={!isEditing ? "bg-muted" : ""} />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea id="requirements" name="requirements" value={formData.requirements} onChange={handleChange} rows={4} readOnly={!isEditing} className={!isEditing ? "bg-muted" : ""} placeholder="Skills, years of experience, or other requirements..." />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={4} readOnly={!isEditing} className={!isEditing ? "bg-muted" : ""} />
              </div>
            </div>
          </div>
          
          <DialogFooter className="p-6 pt-4 border-t">
            {!isEditing ? (
              <Button type="button" onClick={() => setIsEditing(true)}>Edit Details</Button>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={() => job ? setIsEditing(false) : onOpenChange(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Application"}</Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
