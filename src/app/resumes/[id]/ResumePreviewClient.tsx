"use client";

import { Button } from "@/components/ui/button";
import { DownloadSimple, ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface ResumeContent {
  personalInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary?: string;
  experience?: Array<{
    title?: string;
    company?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string[];
  }>;
  education?: Array<{
    degree?: string;
    school?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
    coursework?: string;
  }>;
  skills?: string[];
  skillCategories?: Array<{
    category: string;
    items: string[];
  }>;
  projects?: Array<{
    name?: string;
    description?: string | string[];
    link?: string;
  }>;
  certifications?: Array<{
    title: string;
    issuer?: string;
    date?: string;
  }>;
  achievements?: Array<{
    title: string;
    description?: string[];
  }>;
}

export function ResumePreviewClient({ resume }: { resume: any }) {
  const searchParams = useSearchParams();
  const isExternal = resume.type === "upload" || resume.type === "link";
  const fileUrl = resume.fileUrl || "";
  const isWordDoc = fileUrl.toLowerCase().endsWith(".doc") || fileUrl.toLowerCase().endsWith(".docx");
  const iframeSrc = isWordDoc ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}` : fileUrl;

  let content: ResumeContent = {};
  if (!isExternal && typeof resume.content === 'object' && resume.content !== null) {
    content = resume.content as ResumeContent;
  }

  // Adjust document body background to a neutral color for viewing, but keep the paper white
  useEffect(() => {
    document.body.classList.add("bg-muted");
    
    // Auto print if requested (only for builder resumes)
    if (!isExternal && searchParams?.get("autoPrint") === "true") {
      setTimeout(() => window.print(), 500);
    }

    return () => document.body.classList.remove("bg-muted");
  }, [searchParams, isExternal]);

  const handleDownloadPdf = () => {
    if (!isExternal) {
      window.print();
    }
  };

  return (
    <div className="min-h-screen py-10 print:p-0 print:bg-white bg-muted/30">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 1cm; size: auto; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}} />
      {/* Floating Action Bar (Hidden when printing) */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background/80 backdrop-blur-md border border-border/50 shadow-xl px-6 py-3 rounded-full z-50 print:hidden transition-all hover:bg-background">
        <Link href="/dashboard/resumes">
          <Button variant="ghost" size="sm" className="rounded-full">
            <ArrowLeft className="mr-2" size={16} />
            Back
          </Button>
        </Link>
        <div className="w-px h-6 bg-border" />
        {isExternal && fileUrl ? (
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            <Button className="rounded-full shadow-md" size="sm">
              <DownloadSimple className="mr-2" size={16} />
              Open / Download
            </Button>
          </a>
        ) : (
          <Button onClick={handleDownloadPdf} className="rounded-full shadow-md" size="sm">
            <DownloadSimple className="mr-2" size={16} />
            Download PDF
          </Button>
        )}
      </div>

      {isExternal ? (
        <div className="max-w-[1000px] mx-auto h-[80vh] bg-white shadow-2xl rounded-xl overflow-hidden flex flex-col mt-12 border border-border/50">
          {fileUrl ? (
            <iframe 
              src={iframeSrc} 
              className="w-full h-full border-none" 
              title="Resume Preview"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <p>No valid URL provided for this external resume.</p>
            </div>
          )}
        </div>
      ) : (
        /* A4 Resume Paper Wrapper */
        <div className="max-w-[850px] mx-auto bg-white text-black shadow-2xl print:shadow-none print:w-full print:max-w-none print:m-0 print:overflow-visible min-h-[1056px] print:min-h-0 w-full">
          
          {/* Actual Resume Content */}
          <div className="p-8 sm:p-12 print:p-4 flex flex-col gap-6" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
            
            {/* Header - Personal Info */}
            <div className="text-center border-b border-gray-300 pb-6 mb-2">
              <h1 className="text-4xl font-bold uppercase tracking-wide text-gray-900 mb-2">
                {content.personalInfo?.fullName || "Your Name"}
              </h1>
              <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                {content.personalInfo?.email && <span>{content.personalInfo.email}</span>}
                {content.personalInfo?.phone && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span>{content.personalInfo.phone}</span>
                  </>
                )}
                {content.personalInfo?.location && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span>{content.personalInfo.location}</span>
                  </>
                )}
              </div>
              <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-sm text-blue-600 mt-1">
                {content.personalInfo?.linkedin && (
                  <a href={content.personalInfo.linkedin} className="hover:underline">{content.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</a>
                )}
                {content.personalInfo?.github && (
                  <>
                    <span className="text-gray-400">•</span>
                    <a href={content.personalInfo.github} className="hover:underline">{content.personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}</a>
                  </>
                )}
                {content.personalInfo?.portfolio && (
                  <>
                    <span className="text-gray-400">•</span>
                    <a href={content.personalInfo.portfolio} className="hover:underline">{content.personalInfo.portfolio.replace(/^https?:\/\/(www\.)?/, '')}</a>
                  </>
                )}
              </div>
            </div>

            {/* Summary */}
            {content.summary && (
              <section>
                <p className="text-sm leading-relaxed text-gray-700">{content.summary}</p>
              </section>
            )}

            {/* Experience */}
            {content.experience && content.experience.length > 0 && (
              <section>
                <h2 className="text-lg font-bold uppercase text-gray-900 border-b border-gray-200 pb-1 mb-3">Experience</h2>
                <div className="space-y-4">
                  {content.experience.map((exp, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-semibold text-gray-900 text-base">{exp.title}</h3>
                        <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                          {exp.startDate} {exp.endDate ? `— ${exp.endDate}` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-sm text-gray-800 italic">{exp.company}</span>
                        <span className="text-sm text-gray-500">{exp.location}</span>
                      </div>
                      {exp.description && exp.description.length > 0 && (
                        <ul className="list-disc list-outside ml-4 text-sm text-gray-700 space-y-1">
                          {exp.description.map((desc, dIdx) => (
                            <li key={dIdx} className="pl-1">{desc}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {content.education && content.education.length > 0 && (
              <section>
                <h2 className="text-lg font-bold uppercase text-gray-900 border-b border-gray-200 pb-1 mb-3">Education</h2>
                <div className="space-y-3">
                  {content.education.map((edu, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-semibold text-gray-900 text-base">{edu.school}</h3>
                        <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                          {edu.startDate} {edu.endDate ? `— ${edu.endDate}` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-gray-800">{edu.degree}</span>
                        {edu.gpa && <span className="text-sm text-gray-600">GPA: {edu.gpa}</span>}
                      </div>
                      {edu.coursework && (
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-semibold">Relevant Coursework:</span> {edu.coursework}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {content.projects && content.projects.length > 0 && (
              <section>
                <h2 className="text-lg font-bold uppercase text-gray-900 border-b border-gray-200 pb-1 mb-3">Projects</h2>
                <div className="space-y-3">
                  {content.projects.map((proj, idx) => (
                    <div key={idx}>
                      <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-base">{proj.name}</h3>
                        {proj.link && (
                          <a href={proj.link} className="text-xs text-blue-600 hover:underline">({proj.link.replace(/^https?:\/\/(www\.)?/, '')})</a>
                        )}
                      </div>
                      {proj.description && (
                        Array.isArray(proj.description) ? (
                          <ul className="list-disc list-outside ml-4 text-sm text-gray-700 space-y-1">
                            {proj.description.map((desc, dIdx) => (
                              <li key={dIdx} className="pl-1">{desc}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-700">{proj.description}</p>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills */}
            {((content.skillCategories && content.skillCategories.length > 0) || (content.skills && content.skills.length > 0)) && (
              <section>
                <h2 className="text-lg font-bold uppercase text-gray-900 border-b border-gray-200 pb-1 mb-2">Skills</h2>
                {content.skillCategories && content.skillCategories.length > 0 ? (
                  <ul className="text-sm text-gray-700 leading-relaxed space-y-1">
                    {content.skillCategories.map((cat, idx) => (
                      <li key={idx}>
                        <span className="font-bold">{cat.category}:</span> {cat.items.join(", ")}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {content.skills?.join(" • ")}
                  </p>
                )}
              </section>
            )}

            {/* Achievements & Leadership */}
            {content.achievements && content.achievements.length > 0 && (
              <section>
                <h2 className="text-lg font-bold uppercase text-gray-900 border-b border-gray-200 pb-1 mb-3">Achievements & Leadership</h2>
                <div className="space-y-3">
                  {content.achievements.map((ach, idx) => (
                    <div key={idx}>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{ach.title}</h3>
                      {ach.description && ach.description.length > 0 && (
                        <ul className="list-disc list-outside ml-4 text-sm text-gray-700 space-y-1">
                          {ach.description.map((desc, dIdx) => (
                            <li key={dIdx} className="pl-1">{desc}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {content.certifications && content.certifications.length > 0 && (
              <section>
                <h2 className="text-lg font-bold uppercase text-gray-900 border-b border-gray-200 pb-1 mb-3">Certifications</h2>
                <ul className="list-disc list-outside ml-4 text-sm text-gray-700 space-y-1">
                  {content.certifications.map((cert, idx) => (
                    <li key={idx} className="pl-1">
                      <span className="font-semibold">{cert.title}</span>
                      {cert.issuer && <span> — {cert.issuer}</span>}
                      {cert.date && <span> ({cert.date})</span>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
