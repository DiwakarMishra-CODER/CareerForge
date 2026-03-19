import React from "react";
import { Mail, Phone, MapPin, Link as LinkIcon, Globe, Linkedin, Github } from "lucide-react";

export default function ResumeDisplay({ resumeData, template = "modern" }) {
  if (!resumeData) return null;

  const hasContent = (section) => {
    if (!section) return false;
    if (Array.isArray(section)) return section.length > 0 && section.some(item => Object.values(item).some(val => !!val));
    if (typeof section === 'object') return Object.keys(section).length > 0;
    return true;
  }

  const data = {
    ...resumeData,
    personal_info: {
      full_name: resumeData.personal_info?.full_name || "Your Name",
      title: resumeData.personal_info?.title || "Professional Title",
      email: resumeData.personal_info?.email || "",
      phone: resumeData.personal_info?.phone || "",
      location: resumeData.personal_info?.location || "",
      ...resumeData.personal_info
    }
  };

  const templates = {
    modern: <ModernTemplate data={data} hasContent={hasContent} />,
    classic: <ClassicTemplate data={data} hasContent={hasContent} />,
    creative: <CreativeTemplate data={data} hasContent={hasContent} />,
    minimalist: <MinimalistTemplate data={data} hasContent={hasContent} />,
    executive: <ExecutiveTemplate data={data} hasContent={hasContent} />,
    professional: <ProfessionalTemplate data={data} hasContent={hasContent} />,
  };

  return (
    <div className="h-full bg-white text-slate-900 shadow-sm print:shadow-none overflow-y-auto print:overflow-visible">
      {templates[template] || templates.modern}
    </div>
  );
}

const SectionHeader = ({ title, className = "" }) => (
  <h2 className={`text-sm font-bold tracking-wider uppercase border-b-2 mb-3 pb-1 ${className}`}>
    {title}
  </h2>
);

// --- 1. THE SILICON VALLEY (Modern Tech) ---
const ModernTemplate = ({ data, hasContent }) => (
  <div className="p-10 font-sans flex flex-col h-full bg-white">
    <header className="mb-8 border-l-[6px] border-emerald-500 pl-6">
      <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-1 uppercase font-['Outfit']">{data.personal_info.full_name}</h1>
      <p className="text-xl text-emerald-600 font-bold tracking-wide uppercase font-['Inter']">{data.personal_info.title}</p>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-bold text-slate-400 font-['Inter']">
        {data.personal_info.email && <div className="flex items-center gap-1.5"><Mail size={14} className="text-emerald-500"/> {data.personal_info.email}</div>}
        {data.personal_info.phone && <div className="flex items-center gap-1.5"><Phone size={14} className="text-emerald-500"/> {data.personal_info.phone}</div>}
        {data.personal_info.location && <div className="flex items-center gap-1.5"><MapPin size={14} className="text-emerald-500"/> {data.personal_info.location}</div>}
      </div>
    </header>

    <div className="flex-grow space-y-8 pr-2">
      {hasContent(data.summary) && (
        <section>
          <SectionHeader title="Performance Profile" className="text-slate-900 border-slate-100" />
          <p className="text-[13.5px] leading-relaxed text-slate-600 font-['Inter'] font-medium">{data.summary}</p>
        </section>
      )}

      {hasContent(data.experience) && (
        <section>
          <SectionHeader title="Technical Experience" className="text-slate-900 border-slate-100" />
          <div className="space-y-6">
            {data.experience.map((exp) => (
              <div key={exp.id} className="group">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-black text-base text-slate-900 font-['Outfit']">{exp.title}</h3>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 rounded-full px-3 py-1 uppercase tracking-widest">{exp.start_date} — {exp.end_date || "Present"}</span>
                </div>
                <p className="text-[13px] font-bold text-slate-400 mb-3 font-['Inter'] uppercase tracking-wider">{exp.company}</p>
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-slate-600 font-['Inter'] font-medium">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-10">
        {hasContent(data.education) && (
          <section>
            <SectionHeader title="Academic" className="text-slate-900 border-slate-100" />
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="font-bold text-slate-900 font-['Outfit'] text-[15px]">{edu.degree}</h3>
                  <p className="text-[13px] font-bold text-slate-400 mt-1 uppercase">{edu.university}</p>
                  <p className="text-[11px] font-black text-emerald-500 mt-2 tracking-widest uppercase">{edu.graduation_date}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {hasContent(data.skills) && (
          <section>
            <SectionHeader title="Core Stack" className="text-slate-900 border-slate-100" />
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, i) => (
                <span key={i} className="text-[11px] font-black bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                    {skill}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  </div>
);

// --- 2. THE WALL STREET (Classic Finance) ---
const ClassicTemplate = ({ data, hasContent }) => (
  <div className="p-12 font-serif flex flex-col h-full bg-[#fdfdfd] text-[#111]">
    <header className="text-center mb-10 border-b-[1px] border-black pb-8">
      <h1 className="text-[42px] font-['Playfair_Display'] font-black tracking-tight mb-2 uppercase leading-none">{data.personal_info.full_name}</h1>
      <p className="text-lg italic font-['Playfair_Display'] text-slate-600 mb-4">{data.personal_info.title}</p>
      <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 text-xs font-['Inter'] font-bold tracking-widest text-slate-500 uppercase">
        {data.personal_info.email && <span>{data.personal_info.email}</span>}
        {data.personal_info.phone && <span>{data.personal_info.phone}</span>}
        {data.personal_info.location && <span>{data.personal_info.location}</span>}
      </div>
    </header>

    <div className="space-y-10">
      {hasContent(data.summary) && (
        <section>
          <h2 className="text-sm font-black text-center mb-4 uppercase tracking-[.3em] font-['Inter']">Summary</h2>
          <p className="text-[13px] leading-[1.6] text-center max-w-2xl mx-auto font-medium">{data.summary}</p>
        </section>
      )}

      {hasContent(data.experience) && (
        <section>
          <h2 className="text-sm font-black mb-6 uppercase tracking-[.3em] font-['Inter'] border-b">Professional Experience</h2>
          <div className="space-y-8">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-['Playfair_Display'] text-lg font-black">{exp.company}</h3>
                  <span className="text-[11px] font-black font-['Inter'] tracking-tighter">{exp.start_date.toUpperCase()} — {exp.end_date ? exp.end_date.toUpperCase() : "PRESENT"}</span>
                </div>
                <p className="text-[13px] italic font-medium text-slate-700 mb-3">{exp.title}</p>
                <p className="text-[13px] leading-relaxed font-['Inter'] text-slate-800 whitespace-pre-wrap">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-12 pt-4 border-t border-slate-100">
        {hasContent(data.education) && (
          <section>
            <h2 className="text-xs font-black mb-4 uppercase tracking-[.2em] font-['Inter']">Academic Credentials</h2>
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-4">
                <p className="text-[14px] font-['Playfair_Display'] font-black leading-tight">{edu.university}</p>
                <p className="text-xs italic text-slate-600 mt-1">{edu.degree}</p>
                <p className="text-[10px] font-black font-['Inter'] text-slate-400 mt-2 uppercase">{edu.graduation_date}</p>
              </div>
            ))}
          </section>
        )}
        {hasContent(data.skills) && (
          <section>
            <h2 className="text-xs font-black mb-4 uppercase tracking-[.2em] font-['Inter']">Core Competencies</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {data.skills.map((skill, i) => (
                <div key={i} className="text-xs font-['Inter'] font-medium text-slate-700 uppercase tracking-wide">
                    {skill}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  </div>
);

// --- 3. THE CREATIVE PULSE (Design/Bold) ---
const CreativeTemplate = ({ data, hasContent }) => (
  <div className="font-sans flex h-full bg-[#fafafa]">
    {/* Sidebar */}
    <aside className="w-[280px] bg-slate-900 text-white p-10 flex flex-col pt-16">
      <div className="mb-12">
        <h1 className="text-[32px] font-black font-['Outfit'] leading-[1.1] mb-2 uppercase text-emerald-400">{data.personal_info.full_name}</h1>
        <p className="text-sm font-bold tracking-[.2em] uppercase text-slate-400">{data.personal_info.title}</p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[.35em] text-emerald-500 mb-6">Contact Info</h2>
          <div className="space-y-4 text-xs font-medium text-slate-300">
            {data.personal_info.email && <div className="flex items-center gap-3"><Mail size={14}/> {data.personal_info.email}</div>}
            {data.personal_info.phone && <div className="flex items-center gap-3"><Phone size={14}/> {data.personal_info.phone}</div>}
            {data.personal_info.location && <div className="flex items-center gap-3"><MapPin size={14}/> {data.personal_info.location}</div>}
          </div>
        </section>

        {hasContent(data.skills) && (
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[.35em] text-emerald-500 mb-6">Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, i) => (
                <span key={i} className="text-[10px] bg-white/10 px-2.5 py-1.5 rounded-md font-bold uppercase tracking-widest transition-colors hover:bg-emerald-500/20">
                    {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {hasContent(data.education) && (
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[.35em] text-emerald-500 mb-6">Academic</h2>
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-6 last:mb-0">
                <p className="text-xs font-black text-white leading-tight mb-1">{edu.degree}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{edu.university}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </aside>

    {/* Main Content */}
    <main className="flex-grow p-12 flex flex-col bg-white">
      {hasContent(data.summary) && (
        <section className="mb-12">
          <SectionHeader title="About" className="text-slate-900 border-slate-100" />
          <p className="text-sm leading-relaxed text-slate-600 font-medium font-['Inter']">{data.summary}</p>
        </section>
      )}

      {hasContent(data.experience) && (
        <section>
          <SectionHeader title="Career Trajectory" className="text-slate-900 border-slate-100" />
          <div className="space-y-10 relative before:absolute before:left-0 before:top-4 before:bottom-0 before:w-[2px] before:bg-slate-50 before:ml-[5px]">
            {data.experience.map((exp) => (
              <div key={exp.id} className="relative pl-8">
                <div className="absolute left-0 top-1.5 w-3 h-3 bg-emerald-500 rounded-full ring-4 ring-emerald-50" />
                <div className="mb-3">
                  <h3 className="font-black text-slate-900 font-['Outfit'] text-[17px] leading-tight mb-1">{exp.title}</h3>
                  <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-slate-400">
                    <span>{exp.company}</span>
                    <span className="text-emerald-500">{exp.start_date} — {exp.end_date || "Present"}</span>
                  </div>
                </div>
                <p className="text-[13px] leading-relaxed text-slate-600 font-['Inter'] font-medium whitespace-pre-wrap">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  </div>
);

// --- 4. THE MINIMALIST PRO (Clean/Whitespace) ---
const MinimalistTemplate = ({ data, hasContent }) => (
  <div className="p-16 font-sans flex flex-col h-full bg-white text-slate-900 font-['Outfit']">
    <header className="mb-16">
      <h1 className="text-[48px] font-black tracking-tighter mb-2 leading-none">{data.personal_info.full_name}</h1>
      <p className="text-xl font-bold text-slate-400 tracking-tight">{data.personal_info.title}</p>
      
      <div className="mt-8 flex gap-8 text-[12px] font-black uppercase tracking-[.2em] text-slate-300">
        {data.personal_info.email && <div>{data.personal_info.email}</div>}
        {data.personal_info.phone && <div>{data.personal_info.phone}</div>}
        {data.personal_info.location && <div>{data.personal_info.location}</div>}
      </div>
    </header>

    <div className="space-y-16 max-w-2xl">
      {hasContent(data.summary) && (
        <section>
          <p className="text-[18px] leading-relaxed font-bold text-slate-800 tracking-tight">{data.summary}</p>
        </section>
      )}

      {hasContent(data.experience) && (
        <section>
          <div className="space-y-12">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-4">
                  <h3 className="text-xl font-black">{exp.company}</h3>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{exp.start_date} — {exp.end_date || "Present"}</span>
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">{exp.title}</p>
                <p className="text-[14px] leading-relaxed text-slate-600 font-bold whitespace-pre-wrap">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-20">
        {hasContent(data.skills) && (
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[.3em] text-slate-200 mb-8">Capabilities</h2>
            <div className="flex flex-col gap-3">
              {data.skills.map((skill, i) => (
                <div key={i} className="text-sm font-black text-slate-800 hover:text-emerald-500 transition-colors cursor-default">
                    {skill}
                </div>
              ))}
            </div>
          </section>
        )}
        {hasContent(data.education) && (
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[.3em] text-slate-200 mb-8">Knowledge</h2>
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-6">
                <p className="text-sm font-black text-slate-800 leading-tight mb-1">{edu.degree}</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase">{edu.university}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  </div>
);

// --- 5. THE EXECUTIVE SUITE (Leadership/Centric) ---
const ExecutiveTemplate = ({ data, hasContent }) => (
  <div className="p-12 font-sans flex flex-col h-full bg-[#f8f9fa] border-[20px] border-white shadow-inner">
    <header className="text-center mb-12">
      <h1 className="text-[36px] font-black font-['Outfit'] tracking-tight text-slate-900 border-b-4 border-slate-900 inline-block px-10 pb-2 mb-4 uppercase">{data.personal_info.full_name}</h1>
      <p className="text-xl font-black text-slate-400 font-['Inter'] tracking-[.15em] mb-6 uppercase">{data.personal_info.title}</p>
      <div className="flex justify-center flex-wrap gap-8 text-[11px] font-black uppercase tracking-widest text-slate-500 font-['Inter']">
        {data.personal_info.email && <div className="flex items-center gap-2"><Mail size={12}/> {data.personal_info.email}</div>}
        {data.personal_info.phone && <div className="flex items-center gap-2"><Phone size={12}/> {data.personal_info.phone}</div>}
        {data.personal_info.location && <div className="flex items-center gap-2"><MapPin size={12}/> {data.personal_info.location}</div>}
      </div>
    </header>

    <div className="max-w-4xl mx-auto w-full space-y-12">
      {hasContent(data.summary) && (
        <section className="bg-white p-8 rounded-2xl shadow-sm">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[.4em] mb-6 text-center border-b pb-4">Executive Brief</h2>
          <p className="text-[15px] leading-relaxed text-slate-700 italic font-medium text-center font-serif">{data.summary}</p>
        </section>
      )}

      {hasContent(data.experience) && (
        <section>
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[.4em] mb-8 border-l-4 border-slate-900 pl-4">Career Signature</h2>
          <div className="space-y-12">
            {data.experience.map((exp) => (
              <div key={exp.id} className="grid grid-cols-[200px_1fr] gap-10">
                <div className="text-right pt-1">
                   <p className="text-[11px] font-black text-slate-400 tracking-widest uppercase mb-2">{exp.start_date} — {exp.end_date || "PRESENT"}</p>
                   <p className="text-[13px] font-black text-slate-900 uppercase tracking-wider">{exp.company}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-r-4 border-slate-100">
                  <h3 className="font-black text-lg text-slate-900 font-['Outfit'] mb-3 leading-tight">{exp.title}</h3>
                  <p className="text-[13.5px] leading-relaxed text-slate-600 font-['Inter'] font-medium whitespace-pre-wrap">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-10">
         {hasContent(data.education) && (
          <section>
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[.3em] mb-6 border-l-4 border-slate-300 pl-4">Academic History</h2>
            {data.education.map((edu) => (
              <div key={edu.id} className="bg-white p-6 rounded-2xl shadow-sm space-y-2 mb-4">
                <p className="text-[15px] font-black text-slate-900 leading-tight">{edu.degree}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{edu.university}</p>
                <p className="text-[10px] font-black text-slate-900 mt-2 tracking-widest uppercase">{edu.graduation_date}</p>
              </div>
            ))}
          </section>
        )}
        {hasContent(data.skills) && (
          <section>
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[.3em] mb-6 border-l-4 border-slate-300 pl-4">Core Competencies</h2>
            <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-wrap gap-2">
              {data.skills.map((skill, i) => (
                <span key={i} className="text-[11px] font-black bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-100 uppercase tracking-widest">
                    {skill}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  </div>
);

// --- 6. THE ATS GOLD (Scanner Optimized/Universal) ---
const ProfessionalTemplate = ({ data, hasContent }) => (
  <div className="p-10 font-['Inter'] flex flex-col h-full bg-white text-black text-[13px]">
    {/* Contact Info Header */}
    <header className="text-center mb-6 space-y-1">
      <h1 className="text-[28px] font-bold text-black uppercase tracking-tight">{data.personal_info.full_name}</h1>
      <div className="flex justify-center gap-2 font-medium">
        {data.personal_info.location && <span>{data.personal_info.location} | </span>}
        {data.personal_info.phone && <span>{data.personal_info.phone} | </span>}
        {data.personal_info.email && <span className="underline">{data.personal_info.email}</span>}
      </div>
      <p className="font-bold uppercase pt-1 tracking-wide">{data.personal_info.title}</p>
    </header>

    {/* Standard Sections for ATS */}
    <div className="space-y-6">
      {hasContent(data.summary) && (
        <section>
          <h2 className="font-bold border-b border-black text-sm uppercase mb-2">Summary of Qualifications</h2>
          <p className="leading-relaxed whitespace-pre-wrap">{data.summary}</p>
        </section>
      )}

      {hasContent(data.skills) && (
        <section>
          <h2 className="font-bold border-b border-black text-sm uppercase mb-2">Technical Skills & Expertise</h2>
          <div className="font-medium">
            <span className="font-bold">Core Skills: </span>
            {data.skills.join(", ")}
          </div>
        </section>
      )}

      {hasContent(data.experience) && (
        <section>
          <h2 className="font-bold border-b border-black text-sm uppercase mb-3">Professional Experience</h2>
          <div className="space-y-5">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <div className="flex gap-2 items-center">
                     <span className="font-bold text-[14px]">{exp.company}</span>
                     <span>—</span>
                     <span className="italic font-bold">{exp.title}</span>
                  </div>
                  <span className="font-bold tabular-nums tracking-tighter">{exp.start_date.toUpperCase()} – {exp.end_date ? exp.end_date.toUpperCase() : "PRESENT"}</span>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap font-medium">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {hasContent(data.education) && (
        <section>
          <h2 className="font-bold border-b border-black text-sm uppercase mb-3">Academic Foundation</h2>
          <div className="space-y-3">
            {data.education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div className="flex gap-2 items-center italic">
                   <span className="font-bold not-italic">{edu.university}</span>
                   <span>—</span>
                   <span>{edu.degree}</span>
                </div>
                <span className="font-bold tabular-nums tracking-tighter">{edu.graduation_date.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {hasContent(data.certifications) && (
        <section>
            <h2 className="font-bold border-b border-black text-sm uppercase mb-2">Certifications & Honors</h2>
            <div className="flex flex-wrap gap-x-4 font-medium">
                {data.certifications.map(cert => (
                    <div key={cert.id}>• {cert.name}</div>
                ))}
            </div>
        </section>
      )}
    </div>
  </div>
);
