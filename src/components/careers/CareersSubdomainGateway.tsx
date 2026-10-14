import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { SafarGoLogo } from '../common/SafarGoLogo';
import { JobPosting } from '../../types';
import { buildSubdomainUrl } from '../../lib/subdomain';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  Send,
  X,
  FileText,
  Building,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Phone,
  Mail
} from 'lucide-react';

export const CareersSubdomainGateway: React.FC = () => {
  const { jobPostings, applyForJob } = useData();
  const { success, error } = useToast();

  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Application Form State
  const [applicantName, setApplicantName] = useState('');
  const [applicantMobile, setApplicantMobile] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantCity, setApplicantCity] = useState('');
  const [applicantExperience, setApplicantExperience] = useState('0-1 वर्ष');
  const [applicantQualification, setApplicantQualification] = useState('Graduate');
  const [applicantBio, setApplicantBio] = useState('');
  const [applicantCoverNote, setApplicantCoverNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter open jobs
  const openJobs = (jobPostings || []).filter((j) => j.status === 'open');
  const departments = Array.from(new Set(openJobs.map((j) => j.department)));

  const filteredJobs = departmentFilter === 'all'
    ? openJobs
    : openJobs.filter((j) => j.department === departmentFilter);

  const handleOpenApply = (job: JobPosting) => {
    setSelectedJob(job);
    setIsApplyModalOpen(true);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    const cleanMobile = applicantMobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      error('मोबाइल अमान्य', 'कृपया 10-अंकों का सही मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!applicantName.trim() || !applicantEmail.trim() || !applicantCity.trim()) {
      error('विवरण अधूरा', 'कृपया नाम, ईमेल और शहर अवश्य भरें।');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await applyForJob({
        job_id: selectedJob.id,
        job_title: selectedJob.title,
        applicant_name: applicantName.trim(),
        mobile: cleanMobile,
        email: applicantEmail.trim(),
        city: applicantCity.trim(),
        experience: applicantExperience,
        highest_qualification: applicantQualification,
        resume_url_or_bio: applicantBio.trim() || 'अनुभव एवं प्रोफाइल विवरण सबमिट किया गया।',
        cover_note: applicantCoverNote.trim() || undefined,
      });

      if (ok) {
        setIsApplyModalOpen(false);
        // Reset form
        setApplicantName('');
        setApplicantMobile('');
        setApplicantEmail('');
        setApplicantCity('');
        setApplicantBio('');
        setApplicantCoverNote('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="p-4 sm:p-6 border-b border-blue-900/40 bg-slate-950/85 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SafarGoLogo size="sm" variant="light" showTagline={false} />
          <span className="px-2.5 py-1 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider">
            careers.safargo.in
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={buildSubdomainUrl('main')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
          >
            <span>पब्लिक बस पोर्टल</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href={`https://wa.me/919876543210?text=${encodeURIComponent('नमस्ते SafarGo HR टीम, मैं SafarGo में जॉब वैकेंसी के संबंध में संपर्क कर रहा हूँ।')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>HR WhatsApp</span>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 sm:py-14 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-5 max-w-3xl mx-auto animate-in fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-black uppercase tracking-wider text-blue-300 shadow-md">
            <Briefcase className="w-4 h-4 text-blue-400" />
            <span>SafarGo भर्ती एवं करियर मंच • वी आर हायरिंग!</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 font-bold">{openJobs.length} ओपन पद</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            SafarGo के साथ जुड़ें, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              ग्रामीण भारत में आजीविका क्रांति लाएं!
            </span>
          </h1>

          <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
            मध्य प्रदेश के कस्बों और जन सेवा केंद्रों को जोड़ने वाली सबसे तेजी से बढ़ती बस टिकटिंग व डिलीवरी कंपनी का हिस्सा बनें। आकर्षक मासिक वेतन, समय पर भुगतान, और सम्मानजनक करियर।
          </p>
        </div>

        {/* Department Filter Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setDepartmentFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              departmentFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            सभी पद ({openJobs.length})
          </button>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(dept)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                departmentFilter === dept
                  ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {filteredJobs.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800 space-y-2">
              <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-400">इस विभाग में फिलहाल कोई ओपनिंग उपलब्ध नहीं है।</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 transition-all shadow-xl space-y-6 relative group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {job.department}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                        {job.job_type === 'full_time' ? 'फुल टाइम' : job.job_type === 'remote' ? 'रिमोट / WFH' : 'पार्ट टाइम'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {job.openings} रिक्तियां
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white">{job.title}</h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-400 block font-medium">मासिक वेतन</span>
                    <strong className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                      {job.salary_range}
                    </strong>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {job.description}
                </p>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-blue-300 text-[11px] uppercase tracking-wider">
                      मुख्य जिम्मेदारियां (Responsibilities):
                    </h4>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      {job.responsibilities.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-blue-400 font-black">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-amber-300 text-[11px] uppercase tracking-wider">
                      आवश्यक योग्यता (Requirements):
                    </h4>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      {job.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-black">✓</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>{job.location}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{job.experience_required}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenApply(job)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                  >
                    <span>जॉब हेतु आवेदन करें (Apply Now)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-900">
        SafarGo Careers & Jobs Desk • Official Hiring Environment [careers.safargo.in]
      </footer>

      {/* Job Application Modal */}
      {isApplyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                  ऑनलाइन जॉब एप्लीकेशन
                </span>
                <h3 className="text-base font-black text-white">{selectedJob.title}</h3>
                <p className="text-[11px] text-slate-400">{selectedJob.location} • {selectedJob.salary_range}</p>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleApplySubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  आपका पूरा नाम (Applicant Name) *
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="उदा. राहुल शर्मा"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    मोबाइल नंबर (10 अंक) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={applicantMobile}
                    onChange={(e) => setApplicantMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="98260XXXXX"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-400 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    ईमेल पता (Email) *
                  </label>
                  <input
                    type="email"
                    required
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    placeholder="rahul@gmail.com"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-400 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    वर्तमान शहर / जिला (City) *
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantCity}
                    onChange={(e) => setApplicantCity(e.target.value)}
                    placeholder="उदा. भोपाल, गुना, सिरोंज"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    कार्य अनुभव (Work Experience) *
                  </label>
                  <select
                    value={applicantExperience}
                    onChange={(e) => setApplicantExperience(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="फ्रेशर (Fresher)">फ्रेशर (0 वर्ष)</option>
                    <option value="1-2 वर्ष">1-2 वर्ष</option>
                    <option value="2-4 वर्ष">2-4 वर्ष</option>
                    <option value="4+ वर्ष">4+ वर्ष</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  उच्चतम शैक्षणिक योग्यता (Highest Qualification) *
                </label>
                <select
                  value={applicantQualification}
                  onChange={(e) => setApplicantQualification(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  <option value="12वीं पास (Higher Secondary)">12वीं पास (12th Pass)</option>
                  <option value="स्नातक (Graduate / BA, B.Com, B.Sc)">स्नातक (Graduate)</option>
                  <option value="परास्नातक (Post Graduate / MA, MBA)">परास्नातक (Post Graduate)</option>
                  <option value="डिप्लोमा / आईटीआई (Diploma / ITI)">डिप्लोमा / आईटीआई</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  संक्षिप्त परिचय / पूर्व अनुभव विवरण (Bio / Experience)
                </label>
                <textarea
                  rows={2}
                  value={applicantBio}
                  onChange={(e) => setApplicantBio(e.target.value)}
                  placeholder="अपने पूर्व कार्य या अनुभव के बारे में संक्षेप में बताएं..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-400 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  SafarGo में यह जॉब क्यों करना चाहते हैं? (Cover Note)
                </label>
                <textarea
                  rows={2}
                  value={applicantCoverNote}
                  onChange={(e) => setApplicantCoverNote(e.target.value)}
                  placeholder="हमें बताएं कि आप इस पद के लिए सर्वश्रेष्ठ उम्मीदवार क्यों हैं..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-400 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'आवेदन जमा हो रहा है...' : 'आवेदन पत्र सबमिट करें (Submit Application)'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
