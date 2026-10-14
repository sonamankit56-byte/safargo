import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { JobPosting, JobApplication, JobType, ApplicationStatus } from '../../types';
import {
  Briefcase,
  PlusCircle,
  Users,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock3,
  Phone,
  Mail,
  Edit,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Send,
  Building,
  GraduationCap
} from 'lucide-react';

export const AdminJobsDesk: React.FC = () => {
  const { jobPostings, jobApplications, addJobPosting, updateJobPosting, deleteJobPosting, updateJobApplicationStatus } = useData();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);

  // New Job Form State
  const [jobTitle, setJobTitle] = useState('');
  const [jobDepartment, setJobDepartment] = useState('Operations & Network');
  const [jobLocation, setJobLocation] = useState('Bhopal / Indore, MP');
  const [jobType, setJobType] = useState<JobType>('full_time');
  const [jobSalary, setJobSalary] = useState('₹18,000 - ₹25,000 / माह');
  const [jobOpenings, setJobOpenings] = useState(3);
  const [jobExperience, setJobExperience] = useState('0-2 वर्ष');
  const [jobDescription, setJobDescription] = useState('');
  const [jobResponsibilities, setJobResponsibilities] = useState('');
  const [jobRequirements, setJobRequirements] = useState('');
  const [jobBenefits, setJobBenefits] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter applications by status
  const [appStatusFilter, setAppStatusFilter] = useState<'all' | ApplicationStatus>('all');
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);

  const filteredApps = appStatusFilter === 'all'
    ? (jobApplications || [])
    : (jobApplications || []).filter((a) => a.status === appStatusFilter);

  const handleOpenCreateJob = () => {
    setEditingJob(null);
    setJobTitle('');
    setJobDepartment('Operations & Network');
    setJobLocation('Bhopal / Indore, MP');
    setJobType('full_time');
    setJobSalary('₹18,000 - ₹25,000 / माह');
    setJobOpenings(2);
    setJobExperience('0-2 वर्ष');
    setJobDescription('');
    setJobResponsibilities('');
    setJobRequirements('');
    setJobBenefits('');
    setIsNewJobModalOpen(true);
  };

  const handleOpenEditJob = (job: JobPosting) => {
    setEditingJob(job);
    setJobTitle(job.title);
    setJobDepartment(job.department);
    setJobLocation(job.location);
    setJobType(job.job_type);
    setJobSalary(job.salary_range);
    setJobOpenings(job.openings);
    setJobExperience(job.experience_required);
    setJobDescription(job.description);
    setJobResponsibilities(job.responsibilities.join('\n'));
    setJobRequirements(job.requirements.join('\n'));
    setJobBenefits(job.benefits.join('\n'));
    setIsNewJobModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobDescription.trim()) {
      error('अनिवार्य विवरण', 'कृपया जॉब का शीर्षक एवं विवरण अवश्य भरें।');
      return;
    }

    setIsSubmitting(true);
    try {
      const respList = jobResponsibilities
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const reqList = jobRequirements
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const benList = jobBenefits
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      if (editingJob) {
        await updateJobPosting(editingJob.id, {
          title: jobTitle.trim(),
          department: jobDepartment.trim(),
          location: jobLocation.trim(),
          job_type: jobType,
          salary_range: jobSalary.trim(),
          openings: Number(jobOpenings) || 1,
          experience_required: jobExperience.trim(),
          description: jobDescription.trim(),
          responsibilities: respList.length > 0 ? respList : editingJob.responsibilities,
          requirements: reqList.length > 0 ? reqList : editingJob.requirements,
          benefits: benList.length > 0 ? benList : editingJob.benefits,
        });
      } else {
        await addJobPosting({
          title: jobTitle.trim(),
          department: jobDepartment.trim(),
          location: jobLocation.trim(),
          job_type: jobType,
          salary_range: jobSalary.trim(),
          openings: Number(jobOpenings) || 1,
          experience_required: jobExperience.trim(),
          description: jobDescription.trim(),
          responsibilities: respList.length > 0 ? respList : ['दैनिक कार्यों का निर्वहन व समय पर रिपोर्टिंग'],
          requirements: reqList.length > 0 ? reqList : ['12वीं या स्नातक पास'],
          benefits: benList.length > 0 ? benList : ['समय पर वेतन भुगतान'],
          status: 'open',
          posted_by: 'Super Admin',
        });
      }
      setIsNewJobModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 text-white border border-blue-900/50 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
              careers.safargo.in Control Desk
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
              {jobPostings.length} लाइव जॉब्स • {jobApplications.length} कुल आवेदन
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            💼 SafarGo जॉब पोस्टिंग एवं उम्मीदवार भर्ती डेस्क
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            यहां से आप SafarGo करियर पोर्टल (careers.safargo.in) पर नई नौकरियां पोस्ट कर सकते हैं और प्राप्त आवेदनों की समीक्षा कर शॉर्टलिस्ट कर सकते हैं।
          </p>
        </div>

        <button
          onClick={handleOpenCreateJob}
          className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ नई जॉब पोस्ट करें</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'jobs'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>सक्रिय नौकरियां ({jobPostings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'applications'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>प्राप्त आवेदन ({jobApplications.length})</span>
          {jobApplications.filter((a) => a.status === 'pending').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Tab 1: Active Jobs Desk */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobPostings.map((job) => (
              <div
                key={job.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {job.department}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        job.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {job.status === 'open' ? '🟢 ओपन' : '⚪ बंद'}
                      </span>
                    </div>
                    <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white mt-1">
                      {job.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditJob(job)}
                      className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="एडिट करें"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`क्या आप "${job.title}" पोस्टिंग हटाना चाहते हैं?`)) {
                          deleteJobPosting(job.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="डिलीट करें"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {job.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 font-medium">
                  <div>
                    <span className="text-slate-400 block text-[10px]">वेतनमान:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{job.salary_range}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">स्थान व रिक्तियां:</span>
                    <span className="text-slate-800 dark:text-slate-200">{job.location} ({job.openings} पद)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    कुल प्राप्त आवेदन: <strong>{jobApplications.filter((a) => a.job_id === job.id).length}</strong>
                  </span>
                  <button
                    onClick={() => {
                      updateJobPosting(job.id, {
                        status: job.status === 'open' ? 'closed' : 'open',
                      });
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      job.status === 'open'
                        ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                        : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                    }`}
                  >
                    {job.status === 'open' ? 'वैकेंसी बंद करें' : 'वैकेंसी पुनः खोलें'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Received Applications */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {(['all', 'pending', 'reviewing', 'shortlisted', 'hired', 'rejected'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setAppStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-bold transition capitalize ${
                  appStatusFilter === st
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {st === 'all' ? 'सभी आवेदन' : st === 'pending' ? 'लंबित' : st === 'reviewing' ? 'समीक्षा जारी' : st === 'shortlisted' ? 'शॉर्टलिस्ट' : st === 'hired' ? 'नियुक्त' : 'अस्वीकृत'}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            {filteredApps.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400">
                कोई आवेदन नहीं मिला।
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredApps.map((app) => (
                  <div key={app.id} className="p-5 space-y-3 hover:bg-slate-50 dark:hover:bg-slate-850 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">
                            {app.applicant_name}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            app.status === 'shortlisted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'reviewing'
                              ? 'bg-blue-100 text-blue-800'
                              : app.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          पद: <strong>{app.job_title}</strong> • शहर: {app.city} • अनुभव: {app.experience}
                        </p>
                      </div>

                      {/* Direct WhatsApp Contact Button */}
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/91${app.mobile}?text=${encodeURIComponent(`नमस्ते ${app.applicant_name}, SafarGo की ओर से आपके "${app.job_title}" पद हेतु आवेदन के संबंध में संपर्क किया जा रहा है। क्या आप इंटरव्यू के लिए उपलब्ध हैं?`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>WhatsApp संपर्क</span>
                        </a>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateJobApplicationStatus(app.id, 'shortlisted')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition"
                          >
                            शॉर्टलिस्ट
                          </button>
                          <button
                            onClick={() => updateJobApplicationStatus(app.id, 'rejected')}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-100 transition"
                          >
                            अस्वीकार
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bio & Details Box */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      <div className="flex items-center gap-4 text-[11px] text-slate-500">
                        <span>📱 +91 {app.mobile}</span>
                        <span>✉️ {app.email}</span>
                        <span>🎓 {app.highest_qualification}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        <strong>प्रोफाइल / अनुभव:</strong> {app.resume_url_or_bio}
                      </p>
                      {app.cover_note && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          <strong>कवर नोट:</strong> {app.cover_note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post New / Edit Job Modal */}
      {isNewJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                  {editingJob ? 'जॉब पोस्टिंग संपादित करें' : 'नई नौकरी प्रकाशित करें'}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {editingJob ? editingJob.title : 'नया पद पोस्ट करें (Post Job)'}
                </h3>
              </div>
              <button
                onClick={() => setIsNewJobModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    जॉब शीर्षक (Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="उदा. CSC रिलेशनशिप मैनेजर"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    विभाग (Department) *
                  </label>
                  <input
                    type="text"
                    required
                    value={jobDepartment}
                    onChange={(e) => setJobDepartment(e.target.value)}
                    placeholder="Operations / Sales / Support"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    स्थान (Location) *
                  </label>
                  <input
                    type="text"
                    required
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    placeholder="Bhopal, MP / Remote"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    वेतनमान (Salary) *
                  </label>
                  <input
                    type="text"
                    required
                    value={jobSalary}
                    onChange={(e) => setJobSalary(e.target.value)}
                    placeholder="₹18,000 - ₹25,000 / माह"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    रिक्त पद (Openings) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={jobOpenings}
                    onChange={(e) => setJobOpenings(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  कार्य विवरण (Job Description) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="पद की मुख्य जिम्मेदारियों व कंपनी के उद्देश्य का विवरण..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  मुख्य जिम्मेदारियां (प्रति पंक्ति 1 बिंदु)
                </label>
                <textarea
                  rows={2}
                  value={jobResponsibilities}
                  onChange={(e) => setJobResponsibilities(e.target.value)}
                  placeholder="एजेंट ऑनबोर्डिंग में मदद करना&#10;दैनिक रिपोर्टिंग करना"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  आवश्यक योग्यता (प्रति पंक्ति 1 बिंदु)
                </label>
                <textarea
                  rows={2}
                  value={jobRequirements}
                  onChange={(e) => setJobRequirements(e.target.value)}
                  placeholder="12वीं या स्नातक पास&#10;हिंदी भाषा में उत्कृष्ट संवाद"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{editingJob ? 'अपडेट सुरक्षित करें' : 'नौकरी प्रकाशित करें (Publish Job)'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
