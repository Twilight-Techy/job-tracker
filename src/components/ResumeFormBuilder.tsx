"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "@phosphor-icons/react";

export function ResumeFormBuilder({ content, setContent }: { content: any, setContent: (c: any) => void }) {
  const c = content || {};

  const update = (key: string, value: any) => setContent({ ...c, [key]: value });
  
  const updatePersonal = (field: string, value: string) => {
    update('personalInfo', { ...(c.personalInfo || {}), [field]: value });
  };

  const handleArrayAdd = (key: string, emptyObj: any) => {
    const arr = c[key] || [];
    update(key, [...arr, emptyObj]);
  };

  const handleArrayUpdate = (key: string, index: number, field: string, value: any) => {
    const arr = [...(c[key] || [])];
    arr[index] = { ...arr[index], [field]: value };
    update(key, arr);
  };

  const handleArrayRemove = (key: string, index: number) => {
    const arr = [...(c[key] || [])];
    arr.splice(index, 1);
    update(key, arr);
  };

  return (
    <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 pb-4">
      
      {/* Personal Info */}
      <section className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-1">Personal Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Full Name</Label>
            <Input value={c.personalInfo?.fullName || ''} onChange={e => updatePersonal('fullName', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" value={c.personalInfo?.email || ''} onChange={e => updatePersonal('email', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Phone</Label>
            <Input value={c.personalInfo?.phone || ''} onChange={e => updatePersonal('phone', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Location</Label>
            <Input value={c.personalInfo?.location || ''} onChange={e => updatePersonal('location', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>LinkedIn URL</Label>
            <Input value={c.personalInfo?.linkedin || ''} onChange={e => updatePersonal('linkedin', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>GitHub URL</Label>
            <Input value={c.personalInfo?.github || ''} onChange={e => updatePersonal('github', e.target.value)} />
          </div>
          <div className="space-y-1 col-span-2">
            <Label>Portfolio URL</Label>
            <Input value={c.personalInfo?.portfolio || ''} onChange={e => updatePersonal('portfolio', e.target.value)} />
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-1">Summary</h3>
        <Textarea rows={3} value={c.summary || ''} onChange={e => update('summary', e.target.value)} placeholder="A brief professional summary..." />
      </section>

      {/* Experience */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b pb-1">
          <h3 className="font-semibold text-lg">Experience</h3>
          <Button type="button" variant="ghost" size="sm" onClick={() => handleArrayAdd('experience', { title: '', company: '', startDate: '', endDate: '', description: [] })}>
            <Plus size={16} className="mr-1" /> Add
          </Button>
        </div>
        {(c.experience || []).map((exp: any, i: number) => (
          <div key={i} className="p-4 border rounded-md relative space-y-3 bg-card/30">
            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => handleArrayRemove('experience', i)}>
              <Trash size={16} />
            </Button>
            <div className="grid grid-cols-2 gap-3 pr-8">
              <div className="space-y-1">
                <Label>Job Title</Label>
                <Input value={exp.title || ''} onChange={e => handleArrayUpdate('experience', i, 'title', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Company</Label>
                <Input value={exp.company || ''} onChange={e => handleArrayUpdate('experience', i, 'company', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Location</Label>
                <Input value={exp.location || ''} onChange={e => handleArrayUpdate('experience', i, 'location', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Dates (e.g. Jan 2020 - Present)</Label>
                <div className="flex gap-2">
                  <Input placeholder="Start" value={exp.startDate || ''} onChange={e => handleArrayUpdate('experience', i, 'startDate', e.target.value)} />
                  <Input placeholder="End" value={exp.endDate || ''} onChange={e => handleArrayUpdate('experience', i, 'endDate', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Description (Bullet points, one per line)</Label>
                <Textarea 
                  rows={4}
                  value={(exp.description || []).join('\n')} 
                  onChange={e => handleArrayUpdate('experience', i, 'description', e.target.value.split('\n').filter((l: string) => l.trim() !== ''))} 
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b pb-1">
          <h3 className="font-semibold text-lg">Education</h3>
          <Button type="button" variant="ghost" size="sm" onClick={() => handleArrayAdd('education', { degree: '', school: '', startDate: '', endDate: '' })}>
            <Plus size={16} className="mr-1" /> Add
          </Button>
        </div>
        {(c.education || []).map((edu: any, i: number) => (
          <div key={i} className="p-4 border rounded-md relative space-y-3 bg-card/30">
            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => handleArrayRemove('education', i)}>
              <Trash size={16} />
            </Button>
            <div className="grid grid-cols-2 gap-3 pr-8">
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <Label>Degree / Program</Label>
                <Input value={edu.degree || ''} onChange={e => handleArrayUpdate('education', i, 'degree', e.target.value)} />
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <Label>School</Label>
                <Input value={edu.school || ''} onChange={e => handleArrayUpdate('education', i, 'school', e.target.value)} />
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <Label>Dates</Label>
                <div className="flex gap-2">
                  <Input placeholder="Start" value={edu.startDate || ''} onChange={e => handleArrayUpdate('education', i, 'startDate', e.target.value)} />
                  <Input placeholder="End" value={edu.endDate || ''} onChange={e => handleArrayUpdate('education', i, 'endDate', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <Label>GPA (Optional)</Label>
                <Input value={edu.gpa || ''} onChange={e => handleArrayUpdate('education', i, 'gpa', e.target.value)} />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Relevant Coursework</Label>
                <Input value={edu.coursework || ''} onChange={e => handleArrayUpdate('education', i, 'coursework', e.target.value)} />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Projects */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b pb-1">
          <h3 className="font-semibold text-lg">Projects</h3>
          <Button type="button" variant="ghost" size="sm" onClick={() => handleArrayAdd('projects', { name: '', description: '', link: '' })}>
            <Plus size={16} className="mr-1" /> Add
          </Button>
        </div>
        {(c.projects || []).map((proj: any, i: number) => (
          <div key={i} className="p-4 border rounded-md relative space-y-3 bg-card/30">
            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => handleArrayRemove('projects', i)}>
              <Trash size={16} />
            </Button>
            <div className="grid grid-cols-2 gap-3 pr-8">
              <div className="space-y-1">
                <Label>Project Name</Label>
                <Input value={proj.name || ''} onChange={e => handleArrayUpdate('projects', i, 'name', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Link URL</Label>
                <Input value={proj.link || ''} onChange={e => handleArrayUpdate('projects', i, 'link', e.target.value)} />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Description (Bullet points, one per line)</Label>
                <Textarea 
                  rows={4}
                  value={Array.isArray(proj.description) ? proj.description.join('\n') : (proj.description || '')} 
                  onChange={e => handleArrayUpdate('projects', i, 'description', e.target.value.split('\n').filter((l: string) => l.trim() !== ''))} 
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b pb-1">
          <h3 className="font-semibold text-lg">Skills</h3>
          <Button type="button" variant="ghost" size="sm" onClick={() => handleArrayAdd('skillCategories', { category: '', items: [] })}>
            <Plus size={16} className="mr-1" /> Add Category
          </Button>
        </div>
        
        {/* Legacy Skills fallback */}
        {(!c.skillCategories || c.skillCategories.length === 0) && (
          <div className="space-y-1">
            <Label>Legacy Skills (Comma separated)</Label>
            <Textarea 
              rows={2}
              value={(c.skills || []).join(', ')} 
              onChange={e => update('skills', e.target.value.split(',').map((s: string) => s.trim()).filter((s: string) => s))} 
              placeholder="React, TypeScript, Node.js..."
            />
          </div>
        )}

        {(c.skillCategories || []).map((cat: any, i: number) => (
          <div key={i} className="p-4 border rounded-md relative space-y-3 bg-card/30">
            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => handleArrayRemove('skillCategories', i)}>
              <Trash size={16} />
            </Button>
            <div className="grid grid-cols-1 gap-3 pr-8">
              <div className="space-y-1">
                <Label>Category Name</Label>
                <Input value={cat.category || ''} onChange={e => handleArrayUpdate('skillCategories', i, 'category', e.target.value)} placeholder="e.g. Languages, Cloud, Soft Skills" />
              </div>
              <div className="space-y-1">
                <Label>Skills (Comma separated)</Label>
                <Textarea 
                  rows={2}
                  value={(cat.items || []).join(', ')} 
                  onChange={e => handleArrayUpdate('skillCategories', i, 'items', e.target.value.split(',').map((s: string) => s.trim()).filter((s: string) => s))} 
                  placeholder="Python, Java, TypeScript..."
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Certifications */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b pb-1">
          <h3 className="font-semibold text-lg">Certifications</h3>
          <Button type="button" variant="ghost" size="sm" onClick={() => handleArrayAdd('certifications', { title: '', issuer: '', date: '' })}>
            <Plus size={16} className="mr-1" /> Add
          </Button>
        </div>
        {(c.certifications || []).map((cert: any, i: number) => (
          <div key={i} className="p-4 border rounded-md relative space-y-3 bg-card/30">
            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => handleArrayRemove('certifications', i)}>
              <Trash size={16} />
            </Button>
            <div className="grid grid-cols-2 gap-3 pr-8">
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <Label>Title</Label>
                <Input value={cert.title || ''} onChange={e => handleArrayUpdate('certifications', i, 'title', e.target.value)} />
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <Label>Issuer</Label>
                <Input value={cert.issuer || ''} onChange={e => handleArrayUpdate('certifications', i, 'issuer', e.target.value)} />
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <Label>Date</Label>
                <Input value={cert.date || ''} onChange={e => handleArrayUpdate('certifications', i, 'date', e.target.value)} />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Achievements */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b pb-1">
          <h3 className="font-semibold text-lg">Achievements & Leadership</h3>
          <Button type="button" variant="ghost" size="sm" onClick={() => handleArrayAdd('achievements', { title: '', description: [] })}>
            <Plus size={16} className="mr-1" /> Add
          </Button>
        </div>
        {(c.achievements || []).map((ach: any, i: number) => (
          <div key={i} className="p-4 border rounded-md relative space-y-3 bg-card/30">
            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => handleArrayRemove('achievements', i)}>
              <Trash size={16} />
            </Button>
            <div className="grid grid-cols-2 gap-3 pr-8">
              <div className="space-y-1 col-span-2">
                <Label>Title</Label>
                <Input value={ach.title || ''} onChange={e => handleArrayUpdate('achievements', i, 'title', e.target.value)} />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Description (Bullet points, one per line)</Label>
                <Textarea 
                  rows={3}
                  value={(ach.description || []).join('\n')} 
                  onChange={e => handleArrayUpdate('achievements', i, 'description', e.target.value.split('\n').filter((l: string) => l.trim() !== ''))} 
                />
              </div>
            </div>
          </div>
        ))}
      </section>

    </div>
  );
}
