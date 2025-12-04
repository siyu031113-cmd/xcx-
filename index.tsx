
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  User, Briefcase, FileText, ShieldAlert, LogOut, 
  Search, Plus, ChevronRight, X, Check, Star, 
  Loader2, BarChart3, Users, BookOpen, Send, ChevronLeft, MapPin, Home,
  Phone, Mail, Globe, AlertCircle, Trash2, MoreHorizontal, LayoutGrid,
  ArrowRight, Heart, Sparkles, Cloud, Image as ImageIcon, Upload, Camera,
  Clock, XCircle, CheckCircle2, Ban, Hash, Edit3, Lock, PenTool, Filter,
  Settings, Eye, Inbox
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
type Role = 'student' | 'admin';
type AppStatus = 'pending' | 'approved' | 'rejected';

interface UserData {
  id: string;
  seqNo: number; // Manual sequence number
  name: string;
  role: Role;
  school?: string;
  phone?: string;
  programYear?: string;
  score: number;
  emergencyContacts?: { name: string; phone: string; type: string; email?: string }[];
}

interface Job {
  id: string;
  seqNo: number; // Manual sequence number
  title: string;
  location: string;
  companyName: string; 
  description: string;
  programYear: string;
  housing: string;
  housingCost: string; 
  salary: string;      
  startDateRange: string;
  endDate: string;
  capacity: number;
  minScore: number;
  imgUrls: string[]; 
  tags?: string[];
}

interface Application {
  id: string;
  userId: string;
  jobId: string;
  status: AppStatus;
  date: string;
}

interface Guide {
  id: string;
  title: string;
  content: string;
  category?: string;
  imgUrl?: string;
}

// --- Mock Data ---
const INITIAL_USERS: UserData[] = [
  { 
    id: 'u1', seqNo: 1, name: 'Alice Student', role: 'student', score: 8.5, programYear: '2025', school: 'Tech Univ', phone: '138-0000-0000',
    emergencyContacts: [
      { name: 'Dad (李父)', phone: '13900000000', type: 'Family ❤️' },
      { name: 'John Doe', phone: '+1 555-0199', email: 'john@example.com', type: 'Boss 💼' }
    ]
  },
  { id: 'u2', seqNo: 0, name: 'Bob Admin', role: 'admin', score: 0 },
  // Added Mock Students for Testing
  { id: 'u3', seqNo: 2, name: 'Charlie Chen', role: 'student', score: 7.0, programYear: '2025', school: 'Beijing Normal', phone: '138-1234-5678' },
  { id: 'u4', seqNo: 3, name: 'Daisy Wang', role: 'student', score: 9.0, programYear: '2025', school: 'Shanghai Jiaotong', phone: '139-8765-4321' },
  { id: 'u5', seqNo: 4, name: 'Evan Li', role: 'student', score: 6.5, programYear: '2025', school: 'Sichuan Univ', phone: '137-0000-1111' },
  { id: 'u6', seqNo: 5, name: 'Fiona Zhang', role: 'student', score: 8.0, programYear: '2026', school: 'Fudan Univ', phone: '136-2222-3333' },
  { id: 'u7', seqNo: 6, name: 'George Wu', role: 'student', score: 6.0, programYear: '2025', school: 'Zhejiang Univ', phone: '135-4444-5555' },
  { id: 'u8', seqNo: 7, name: 'Helen Liu', role: 'student', score: 7.5, programYear: '2025', school: 'Wuhan Univ', phone: '134-5555-6666' },
  { id: 'u9', seqNo: 8, name: 'Ian Zhao', role: 'student', score: 5.5, programYear: '2025', school: 'Nanjing Univ', phone: '133-6666-7777' },
  // Dummy users to fill the job
  { id: 'u10', seqNo: 9, name: 'Dummy One', role: 'student', score: 8.0, programYear: '2025', school: 'Test U', phone: '000' },
  { id: 'u11', seqNo: 10, name: 'Dummy Two', role: 'student', score: 8.0, programYear: '2025', school: 'Test U', phone: '000' },
];

const INITIAL_JOBS: Job[] = [
  {
    id: 'j1',
    seqNo: 1,
    title: 'Resort Lifeguard',
    location: 'Wisconsin Dells, WI',
    companyName: 'Wisconsin Dells Resort',
    description: 'Provide safety and hospitality to guests at our water park. Certification training provided. Housing available nearby.',
    programYear: '2025',
    housing: 'Provided',
    housingCost: '$150/wk',
    salary: '$16.00/hr',
    startDateRange: 'Jun 15 - Jun 30',
    endDate: 'Sept 15, 2025',
    capacity: 10,
    minScore: 6.0,
    tags: ['Lifeguard', 'Fun'],
    imgUrls: ['https://images.unsplash.com/photo-1576014131795-d440191a8e8b?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'j2',
    seqNo: 2,
    title: 'Line Cook',
    location: 'Myrtle Beach, SC',
    companyName: 'Ocean View Restaurant',
    description: 'Assist in food preparation and station maintenance. Previous kitchen experience preferred but not required.',
    programYear: '2025',
    housing: 'Assistance',
    housingCost: '$120/wk',
    salary: '$18.50/hr',
    startDateRange: 'May 20 - Jun 10',
    endDate: 'Sept 15, 2025',
    capacity: 5,
    minScore: 7.0,
    tags: ['Culinary', 'Busy'],
    imgUrls: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'j3',
    seqNo: 3,
    title: 'Amusement Park Attendant',
    location: 'Sandusky, OH',
    companyName: 'Cedar Point',
    description: 'Operate rides and assist guests. Great for students who love theme parks!',
    programYear: '2025',
    housing: 'Provided',
    housingCost: '$100/wk',
    salary: '$15.00/hr',
    startDateRange: 'Jun 1 - Jun 20',
    endDate: 'Sept 15, 2025',
    capacity: 20,
    minScore: 6.5,
    tags: ['Theme Park', 'Outdoors'],
    imgUrls: ['https://images.unsplash.com/photo-1513883049090-d0b7439799bf?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'j4',
    seqNo: 4,
    title: 'Housekeeper',
    location: 'Gatlinburg, TN',
    companyName: 'Smoky Mountain Lodge',
    description: 'Ensure guest rooms are clean and welcoming. Tips available!',
    programYear: '2025',
    housing: 'Provided',
    housingCost: '$130/wk',
    salary: '$14.00/hr',
    startDateRange: 'Jun 10 - Jun 25',
    endDate: 'Sept 15, 2025',
    capacity: 8,
    minScore: 6.0,
    tags: ['Hospitality', 'Tips'],
    imgUrls: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'j5',
    seqNo: 5,
    title: 'Test Filled Job (Coffee Shop)',
    location: 'Seattle, WA',
    companyName: 'Starbucks Local',
    description: 'This is a test job that is already full.',
    programYear: '2025',
    housing: 'None',
    housingCost: 'N/A',
    salary: '$20.00/hr',
    startDateRange: 'Jun 1 - Jun 1',
    endDate: 'Sept 15, 2025',
    capacity: 2, // Low capacity to fill easily
    minScore: 6.0,
    tags: ['Test', 'Full'],
    imgUrls: ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80']
  },
  // Extra jobs for scrolling
  { id: 'j6', seqNo: 6, title: 'Server Assistant', location: 'Miami, FL', companyName: 'Beachside Grill', description: 'Assist servers.', programYear: '2025', housing: 'Assistance', housingCost: '$200/wk', salary: '$12/hr + tips', startDateRange: 'Jun 1-15', endDate: 'Sept 15, 2025', capacity: 5, minScore: 7.0, imgUrls: ['https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80'], tags: ['Dining'] },
  { id: 'j7', seqNo: 7, title: 'Retail Associate', location: 'Ocean City, MD', companyName: 'Boardwalk Shop', description: 'Sell souvenirs.', programYear: '2025', housing: 'Provided', housingCost: '$120/wk', salary: '$14/hr', startDateRange: 'Jun 15-20', endDate: 'Sept 15, 2025', capacity: 6, minScore: 6.0, imgUrls: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80'], tags: ['Retail'] },
  { id: 'j8', seqNo: 8, title: 'Grounds Crew', location: 'Yellowstone, WY', companyName: 'National Park Service', description: 'Maintain park grounds.', programYear: '2025', housing: 'Provided', housingCost: '$50/wk', salary: '$15/hr', startDateRange: 'May 15', endDate: 'Sept 15, 2025', capacity: 10, minScore: 6.0, imgUrls: ['https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&w=800&q=80'], tags: ['Outdoors'] },
];

const INITIAL_APPS: Application[] = [
  // FIll the test job
  { id: 'a1', userId: 'u10', jobId: 'j5', status: 'approved', date: '2024-01-01' },
  { id: 'a2', userId: 'u11', jobId: 'j5', status: 'approved', date: '2024-01-01' },
];

const INITIAL_GUIDES: Guide[] = [
  { id: 'g1', title: 'Visa Interview Tips', content: '## Be Confident!\n\n1. Dress professionally.\n2. Bring all documents.\n3. Speak clearly.', category: 'Pre-Departure', imgUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80' },
  { id: 'g2', title: 'Packing List', content: '## Essentials\n\n- Passport\n- DS-2019\n- Warm clothes', category: 'Pre-Departure' },
  { id: 'g3', title: 'Insurance Overview', content: '## Coverage\n\nYour insurance covers emergency medical expenses.', category: 'Safety' },
];

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }: any) => {
  const baseStyle = "px-6 py-3 rounded-full font-bold transition-all active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-[#38BDF8] text-white shadow-lg shadow-sky-200 disabled:opacity-50 disabled:shadow-none",
    secondary: "bg-[#FEF08A] text-slate-800 shadow-lg shadow-yellow-100",
    outline: "border-2 border-slate-200 text-slate-600 hover:bg-slate-50",
    ghost: "text-slate-500 hover:bg-slate-50",
    danger: "bg-rose-50 text-rose-500 hover:bg-rose-100",
    black: "bg-slate-900 text-white shadow-xl shadow-slate-300"
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}>
      {children}
    </button>
  );
};

// --- Views ---

const LoginView = ({ onLogin, onRegister }: any) => {
  return (
    <div className="flex flex-col h-full bg-[#F0F9FF] relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-sky-200 rounded-full blur-3xl opacity-40 animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#FEF08A] rounded-full blur-3xl opacity-40" />
      <div className="relative z-10 flex flex-col justify-center h-full px-8">
        <div className="mb-12">
          <div className="w-20 h-20 bg-white rounded-[30px] flex items-center justify-center shadow-xl shadow-sky-100 mb-6">
            <Globe className="w-10 h-10 text-[#38BDF8]" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight mb-2">Blueprint <br/> <span className="text-[#38BDF8]">Global</span></h1>
          <p className="text-slate-500 text-lg">蓝途启航 · 赴美带薪实习</p>
        </div>
        <div className="space-y-4">
          <Button onClick={() => onLogin('student')} variant="black" className="w-full text-lg h-16">Student Login</Button>
          <Button onClick={() => onLogin('admin')} variant="outline" className="w-full text-lg h-16 border-sky-200 text-sky-500 bg-white">Admin Console</Button>
        </div>
        <div className="mt-8 text-center">
           <p className="text-slate-400 mb-2">New here?</p>
           <button onClick={onRegister} className="text-[#38BDF8] font-bold text-lg">Create Account</button>
        </div>
      </div>
    </div>
  );
};

const RegisterView = ({ onRegister, onCancel }: any) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', school: '', phone: '', code: '', year: '2025', score: '6.0'
    });
    const handleSubmit = () => {
        if (!formData.name || !formData.school || !formData.phone) {
            alert("Please fill in all required fields (Name, School, Phone).");
            return;
        }
        onRegister(formData);
    };
    return (
        <div className="flex-1 overflow-y-auto bg-[#F0F9FF]">
            <div className="p-6 pt-12 pb-24">
                 <button onClick={onCancel} className="mb-6 flex items-center text-slate-400 font-bold"><ChevronLeft className="w-5 h-5 mr-1" /> Back</button>
                <h1 className="text-3xl font-black text-slate-900 mb-2">Blueprint Global Exchange</h1>
                <p className="text-slate-500 mb-8">蓝途启航 · 赴美带薪实习</p>
                <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-sky-100 border border-white">
                    <h2 className="text-xl font-bold text-center mb-6 text-slate-800">Student Registration</h2>
                    <div className="space-y-5">
                        <div className="bg-[#FEF9C3] p-4 rounded-2xl border border-yellow-100">
                             <label className="block text-xs font-bold text-yellow-700 uppercase tracking-wider mb-2">Intended Program Year</label>
                             <div className="flex gap-2">
                                 {['2025', '2026'].map(y => (
                                     <button key={y} onClick={() => setFormData({...formData, year: y})} className={`flex-1 py-2 rounded-xl font-bold transition-all ${formData.year === y ? 'bg-yellow-400 text-yellow-900 shadow-sm' : 'bg-white/50 text-yellow-700'}`}>{y}</button>
                                 ))}
                             </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">真实姓名 (FULL NAME)</label>
                                <input className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200" placeholder="e.g. Alice Chen" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">就读学校 (UNIVERSITY)</label>
                                <input className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200" placeholder="e.g. Peking University" value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})}/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">手机号码 (PHONE)</label>
                                <div className="flex gap-2">
                                     <input className="flex-1 bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200" placeholder="Mobile Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/>
                                    <button className="bg-sky-100 text-sky-600 px-4 rounded-2xl font-bold text-sm">验证码</button>
                                </div>
                            </div>
                             <div>
                                <label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">验证码 (CODE)</label>
                                <input className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200" placeholder="1234" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})}/>
                            </div>
                        </div>
                        <div className="pt-4"><Button onClick={handleSubmit} className="w-full text-lg h-14">立即注册 (Register Now)</Button></div>
                         <div className="text-center pb-8 pt-4"><p className="text-sm text-slate-400">Blueprint Global Exchange | 蓝途启航</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const StudentJobsView = ({ jobs, user, onApply, myApps }: any) => {
    const [search, setSearch] = useState('');
    const sortedJobs = [...jobs].sort((a, b) => (a.seqNo || 0) - (b.seqNo || 0));
    const activeJobs = sortedJobs.filter(j => 
        j.programYear === user.programYear && 
        (j.title.toLowerCase().includes(search.toLowerCase()) || j.location.toLowerCase().includes(search.toLowerCase()) || String(j.seqNo).includes(search)) &&
        (myApps.filter((a:any) => a.jobId === j.id && a.status === 'approved').length < j.capacity)
    );
    const fullJobs = sortedJobs.filter(j => 
         j.programYear === user.programYear && 
         (j.title.toLowerCase().includes(search.toLowerCase()) || j.location.toLowerCase().includes(search.toLowerCase()) || String(j.seqNo).includes(search)) &&
         (myApps.filter((a:any) => a.jobId === j.id && a.status === 'approved').length >= j.capacity)
    );

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 bg-[#F0F9FF]">
            <div className="flex justify-between items-end">
                <div><h1 className="text-3xl font-black text-slate-900">Job Board</h1><p className="text-slate-400 font-medium">Find your perfect summer</p></div>
                <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold border border-sky-200">{user.score.toFixed(1)}</div>
            </div>
            <div className="sticky top-0 z-20 bg-[#F0F9FF]/95 backdrop-blur-sm py-2 -mx-4 px-4">
                 <div className="relative">
                    <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                    <input className="w-full bg-white pl-12 pr-4 py-3 rounded-full shadow-sm border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-200 text-slate-600 font-medium placeholder:text-slate-300" placeholder="Search jobs, #ID, states..." value={search} onChange={e => setSearch(e.target.value)}/>
                </div>
            </div>
            <div className="space-y-4">
                {activeJobs.map((job: any) => (
                    <div key={job.id} onClick={() => onApply(job)} className="bg-white rounded-[32px] p-4 shadow-lg shadow-sky-50 border border-white active:scale-[0.98] transition-all relative overflow-hidden group">
                         <div className="absolute top-4 right-4 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-lg z-10 opacity-80">#{String(job.seqNo || 0).padStart(2, '0')}</div>
                        <div className="flex gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-100">
                                {job.imgUrls && job.imgUrls.length > 0 ? (<img src={job.imgUrls[0]} alt={job.title} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-8 h-8" /></div>)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap gap-2 mb-2">
                                    <span className="bg-[#FEF08A] text-yellow-800 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wide">{job.salary}</span>
                                    <span className="bg-sky-50 text-sky-600 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wide">{job.location.split(',')[1] || 'USA'}</span>
                                </div>
                                <h3 className="text-lg font-black text-slate-800 leading-tight mb-1 truncate">{job.title}</h3>
                                <p className="text-slate-400 text-sm truncate">{job.companyName}</p>
                            </div>
                            <div className="flex items-center text-slate-300"><ChevronRight /></div>
                        </div>
                    </div>
                ))}
            </div>
             {fullJobs.length > 0 && (
                <div className="pt-8">
                     <div className="flex items-center gap-2 mb-4"><div className="w-2 h-2 rounded-full bg-slate-300"></div><h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Filled / Closed</h2></div>
                    <div className="space-y-4 opacity-60 grayscale">
                        {fullJobs.map((job: any) => (
                             <div key={job.id} className="bg-white rounded-[32px] p-4 border border-slate-100 relative">
                                <div className="absolute top-4 right-4 bg-slate-200 text-slate-500 text-xs font-bold px-2 py-1 rounded-lg z-10">FULL</div>
                                <div className="flex gap-4">
                                     <div className="w-20 h-20 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden">
                                        {job.imgUrls && job.imgUrls.length > 0 ? (<img src={job.imgUrls[0]} alt={job.title} className="w-full h-full object-cover opacity-50" />) : (<div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-8 h-8" /></div>)}
                                    </div>
                                    <div className="flex-1 min-w-0 py-1"><h3 className="text-lg font-black text-slate-600 leading-tight mb-1">{job.title}</h3><p className="text-slate-400 text-sm">{job.companyName}</p></div>
                                </div>
                             </div>
                        ))}
                    </div>
                </div>
             )}
            <div className="h-12 text-center text-slate-300 text-sm pt-4">End of list</div>
        </div>
    );
};

const StudentJobDetail = ({ job, user, onBack, onApplyConfirm, hasActiveApp, isFull }: any) => {
    return (
        <div className="flex flex-col h-full bg-white">
            <div className="relative h-64 bg-slate-100">
                <div className="flex overflow-x-auto snap-x snap-mandatory h-full w-full scrollbar-hide">
                    {job.imgUrls && job.imgUrls.length > 0 ? (job.imgUrls.map((url: string, idx: number) => (<img key={idx} src={url} className="w-full h-full object-cover snap-center flex-shrink-0" alt="Job Cover" />))) : (<div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-12 h-12" /></div>)}
                </div>
                <button onClick={onBack} className="absolute top-4 left-4 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-lg text-slate-800 z-10"><ChevronLeft /></button>
                 {job.imgUrls && job.imgUrls.length > 1 && (<div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur">Swipe for more photos</div>)}
            </div>
            <div className="flex-1 overflow-y-auto p-6 relative -mt-6 bg-white rounded-t-[32px] z-10">
                <div className="absolute top-20 right-[-20px] rotate-[-15deg] text-8xl font-black text-slate-50 select-none pointer-events-none z-0 whitespace-nowrap opacity-50">Blueprint Global</div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2 mb-4">{job.tags?.map((t: string) => (<span key={t} className="px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-xs font-bold uppercase">{t}</span>))}</div>
                         <div className="bg-sky-400 text-white p-2 rounded-full shadow-lg shadow-sky-200"><Star className="w-5 h-5 fill-current" /></div>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 leading-tight mb-1">{job.title}</h1>
                    <p className="text-slate-500 font-medium text-lg mb-6">{job.companyName} <span className="text-slate-300">•</span> {job.location}</p>
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100"><p className="text-xs font-bold text-slate-400 uppercase mb-1">届数 (Year)</p><p className="text-slate-800 font-bold">{job.programYear}</p></div>
                         <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100"><p className="text-xs font-bold text-slate-400 uppercase mb-1">住宿费 (Housing)</p><p className="text-slate-800 font-bold">{job.housingCost}</p></div>
                         <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100"><p className="text-xs font-bold text-slate-400 uppercase mb-1">开始日期 (Start)</p><p className="text-slate-800 font-bold">{job.startDateRange}</p></div>
                         <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100"><p className="text-xs font-bold text-slate-400 uppercase mb-1">结束日期 (End)</p><p className="text-slate-800 font-bold">{job.endDate}</p></div>
                    </div>
                    <div className="prose prose-slate prose-p:text-slate-600 prose-headings:text-slate-800 mb-24"><h3 className="font-bold text-lg mb-2">职位描述 (Description)</h3><p>{job.description}</p></div>
                </div>
            </div>
            <div className="p-4 bg-white border-t border-slate-100 sticky bottom-0 z-20 pb-8">
                {isFull ? (<Button disabled className="w-full text-lg bg-slate-100 text-slate-400 shadow-none cursor-not-allowed">Position Filled</Button>) : hasActiveApp ? (<Button disabled className="w-full text-lg bg-rose-50 text-rose-400 shadow-none border-2 border-rose-100">Limit Reached (1 Active App)</Button>) : user.score < job.minScore ? (<Button disabled className="w-full text-lg bg-slate-100 text-slate-400 shadow-none">Score Too Low (Min {job.minScore})</Button>) : (<Button onClick={() => onApplyConfirm(job.id)} className="w-full text-lg">Apply Now</Button>)}
            </div>
        </div>
    );
};

const StudentInternshipView = ({ user, apps, jobs, onWithdraw }: any) => {
    const myApps = apps.filter((a: any) => a.userId === user.id).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return (
        <div className="flex-1 overflow-y-auto p-6 pt-12 pb-32 min-h-0 bg-[#F0F9FF]">
            <h1 className="text-3xl font-black text-slate-900 mb-2">My Applications</h1>
            <p className="text-slate-500 mb-8">Track your status</p>
            {myApps.length === 0 ? (
                <div className="text-center py-20 opacity-50"><Briefcase className="w-16 h-16 mx-auto mb-4 text-slate-300" /><p className="text-slate-500 font-medium">No applications yet.</p></div>
            ) : (
                <div className="space-y-6">
                    {myApps.map((app: any) => {
                        const job = jobs.find((j: any) => j.id === app.jobId);
                        if (!job) return null;
                        return (
                            <div key={app.id} className="bg-white rounded-[32px] p-6 shadow-xl shadow-sky-50 border border-white">
                                <div className="flex justify-between items-start mb-4">
                                    <div><h2 className="text-xl font-black text-slate-800 mb-1">{job.title}</h2><p className="text-slate-400">{job.companyName}</p></div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${app.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : app.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>{app.status}</div>
                                </div>
                                {app.status === 'pending' && (
                                    <div className="bg-[#FEF9C3] p-4 rounded-2xl border border-yellow-100 mb-4">
                                        <div className="flex items-start gap-3"><AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" /><p className="text-sm text-yellow-800 leading-relaxed font-medium">Your application will be reviewed by the team. After it is reviewed, there will be a long wait. Please do not constantly check in. Once our backend team approves it, you can proceed.</p></div>
                                    </div>
                                )}
                                {app.status === 'approved' && (
                                     <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mb-4">
                                        <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" /><p className="text-sm text-emerald-800 font-medium">Congratulations! You have been approved for this position.</p></div>
                                    </div>
                                )}
                                {app.status === 'pending' && (<button onClick={() => onWithdraw(app.id)} className="w-full py-3 rounded-xl border border-rose-100 text-rose-500 font-bold hover:bg-rose-50 transition-colors text-sm">Withdraw Application</button>)}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const StudentServicesView = ({ user, onEmergency, guides, onSelectGuide }: any) => {
    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 min-h-0 bg-[#F0F9FF]">
            <div><h1 className="text-3xl font-black text-slate-900">Services</h1><p className="text-slate-400 font-medium">Essential tools for your trip.</p></div>
            <div onClick={onEmergency} className="bg-[#38BDF8] rounded-[40px] p-6 shadow-xl shadow-sky-200 relative overflow-hidden h-48 flex flex-col justify-between active:scale-[0.98] transition-transform cursor-pointer group">
                <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/20 rounded-full blur-xl" /><div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 bg-sky-600/20 rounded-full blur-xl" />
                <div className="relative z-10 flex justify-between items-start"><span className="bg-white/20 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">Tap in Emergency</span><div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><ShieldAlert className="text-white w-6 h-6" /></div></div>
                <div className="relative z-10"><h2 className="text-3xl font-black text-white mb-2">Emergency Card</h2><div className="flex items-center gap-2 text-white/90"><span className="bg-white text-sky-500 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">Open Now <Heart className="w-3 h-3 fill-current" /></span></div></div>
            </div>
            <div>
                <div className="flex items-center gap-2 mb-4 px-2"><div className="w-1.5 h-1.5 rounded-full bg-sky-400"></div><h2 className="text-sm font-bold text-sky-400 uppercase tracking-widest">Little Guides</h2></div>
                <div className="space-y-3">{guides.map((guide: any) => (<div key={guide.id} onClick={() => onSelectGuide(guide)} className="bg-white p-2 pr-4 rounded-[28px] border border-sky-50 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-transform"><div className="w-16 h-16 bg-[#EFF6FF] rounded-[20px] flex items-center justify-center text-sky-500 overflow-hidden flex-shrink-0">{guide.imgUrl ? (<img src={guide.imgUrl} className="w-full h-full object-cover" alt="icon" />) : (<BookOpen className="w-6 h-6" />)}</div><div className="flex-1"><h3 className="text-slate-700 font-bold leading-tight">{guide.title}</h3><p className="text-slate-400 text-xs mt-0.5">{guide.category}</p></div><ChevronRight className="text-slate-300 w-5 h-5" /></div>))}</div>
            </div>
        </div>
    );
};

const StudentEmergencyView = ({ user, onBack, onUpdateUser }: any) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', phone: '', type: 'Friend' });
    const handleAdd = () => {
        if (!newContact.name || !newContact.phone) return;
        const updatedUser = { ...user, emergencyContacts: [...(user.emergencyContacts || []), { ...newContact }] };
        onUpdateUser(updatedUser);
        setIsAdding(false);
        setNewContact({ name: '', phone: '', type: 'Friend' });
    };
    return (
        <div className="flex-1 overflow-y-auto flex flex-col h-full bg-[#F0F9FF]">
            <div className="bg-[#38BDF8] px-6 pt-12 pb-8 rounded-b-[40px] shadow-xl shadow-sky-200 z-10 flex-shrink-0">
                <div className="flex items-center justify-between text-white mb-6"><button onClick={onBack} className="flex items-center font-bold opacity-80 hover:opacity-100"><ChevronLeft className="w-5 h-5 mr-1" /> Back</button></div>
                <h1 className="text-3xl font-black text-white mb-2">Emergency Card</h1><p className="text-sky-100 font-medium opacity-90">Access these contacts offline.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-white p-5 rounded-[32px] border border-slate-50 shadow-lg shadow-sky-50">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Local Emergency</h3>
                    <div className="space-y-3">
                        <div className="bg-rose-50 p-4 rounded-2xl flex justify-between items-center border border-rose-100"><div><p className="font-bold text-slate-800">Police / Ambulance</p><p className="text-rose-500 font-black text-xl">911</p></div><div className="w-10 h-10 bg-rose-500 rounded-full shadow-lg shadow-rose-200"></div></div>
                         <div className="bg-rose-50 p-4 rounded-2xl flex justify-between items-center border border-rose-100"><div><p className="font-bold text-slate-800">Chinese Consulate</p><p className="text-rose-500 font-black text-lg">+1-202-495-2266</p></div><div className="w-10 h-10 bg-rose-500 rounded-full shadow-lg shadow-rose-200"></div></div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-[32px] border border-slate-50 shadow-lg shadow-sky-50">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">My Contacts</h3>
                    <div className="space-y-4 mb-6">{user.emergencyContacts?.map((c: any, i: number) => (<div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100"><div className="flex justify-between items-center mb-1"><p className="text-xs font-bold text-sky-500 uppercase">{c.type}</p></div><p className="font-bold text-slate-800 text-lg">{c.name}</p><p className="text-slate-500 font-mono text-lg">{c.phone}</p></div>))}</div>
                    {!isAdding ? (
                        <button onClick={() => setIsAdding(true)} className="w-full py-4 rounded-2xl border-2 border-dashed border-sky-200 text-sky-400 font-bold flex items-center justify-center gap-2 hover:bg-sky-50 active:scale-95 transition-all"><Plus className="w-5 h-5" />Add Friend / Family</button>
                    ) : (
                        <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100 animate-in fade-in zoom-in duration-200">
                            <h4 className="font-bold text-sky-800 mb-3 text-center">New Contact</h4>
                            <div className="space-y-3">
                                <input className="w-full bg-white p-3 rounded-xl text-slate-700 font-bold focus:outline-none border border-sky-100" placeholder="Name (e.g. Mom)" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})}/>
                                <input className="w-full bg-white p-3 rounded-xl text-slate-700 font-bold focus:outline-none border border-sky-100" placeholder="Phone Number" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})}/>
                                <div className="flex gap-2">{['Friend', 'Family', 'Work'].map(type => (<button key={type} onClick={() => setNewContact({...newContact, type})} className={`flex-1 py-2 rounded-lg text-xs font-bold ${newContact.type === type ? 'bg-sky-400 text-white shadow-md' : 'bg-white text-slate-400'}`}>{type}</button>))}</div>
                                <div className="flex gap-2 pt-2"><button onClick={() => setIsAdding(false)} className="flex-1 py-3 rounded-xl bg-slate-200 text-slate-500 font-bold">Cancel</button><button onClick={handleAdd} className="flex-1 py-3 rounded-xl bg-sky-400 text-white font-bold shadow-lg shadow-sky-200">Save</button></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StudentProfileView = ({ user, onLogout, onEdit, isEditing, onSaveProfile }: any) => {
    const [editData, setEditData] = useState({ name: user.name, phone: user.phone || '' });
    const handleSave = () => { onSaveProfile(editData); };
    if (isEditing) {
        return (
            <div className="flex-1 overflow-y-auto p-6 pt-12 pb-24 min-h-0 bg-[#F0F9FF]">
                 <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-black text-slate-900">Edit Profile</h1><button onClick={onEdit} className="text-slate-400 font-bold">Cancel</button></div>
                <div className="bg-white p-6 rounded-[32px] shadow-lg space-y-4">
                    <div><label className="text-xs font-bold text-slate-400 mb-1 block">姓名 (FULL NAME)</label><input className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-800" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})}/></div>
                     <div><label className="text-xs font-bold text-slate-400 mb-1 block">电话 (PHONE)</label><input className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-800" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})}/></div>
                     <div><label className="text-xs font-bold text-slate-400 mb-1 block">学校 (SCHOOL - LOCKED)</label><input disabled className="w-full bg-slate-100 p-3 rounded-xl font-bold text-slate-400 cursor-not-allowed" value={user.school}/></div>
                    <Button onClick={handleSave} className="w-full mt-4">Save Changes</Button>
                </div>
            </div>
        );
    }
    return (
        <div className="flex-1 overflow-y-auto flex flex-col pb-32 min-h-0 bg-[#F0F9FF]">
            <div className="bg-gradient-to-b from-sky-200 to-[#F0F9FF] pt-12 pb-20 px-6 rounded-b-[50px] text-center relative z-0 flex-shrink-0">
                <div className="w-28 h-28 mx-auto bg-sky-200 rounded-full p-1 shadow-xl shadow-sky-100 mb-4 border-4 border-white relative">
                     <div className="w-full h-full bg-[#BAE6FD] rounded-full flex items-center justify-center text-3xl font-black text-sky-600">{user.name.charAt(0)}</div>
                     <button onClick={onEdit} className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-slate-600"><Edit3 className="w-4 h-4" /></button>
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-1">{user.name}</h1>
                <div className="inline-block bg-white px-3 py-1 rounded-full shadow-sm text-sky-500 font-bold text-xs uppercase tracking-wider">{user.school || 'University'}</div>
            </div>
            <div className="px-6 -mt-12 z-10 relative mb-8 flex-shrink-0">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-[32px] shadow-lg shadow-sky-50 border border-white flex flex-col items-center justify-center gap-2"><div className="w-10 h-10 bg-[#FEF9C3] rounded-full flex items-center justify-center text-yellow-600"><Star className="w-5 h-5 fill-current" /></div><span className="text-3xl font-black text-slate-800">{user.score.toFixed(1)}</span><span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">评分 (Score)</span></div>
                     <div className="bg-white p-5 rounded-[32px] shadow-lg shadow-sky-50 border border-white flex flex-col items-center justify-center gap-2"><div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-500"><Briefcase className="w-5 h-5" /></div><span className="text-3xl font-black text-slate-800">{user.programYear}</span><span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">届数 (Cohort)</span></div>
                </div>
            </div>
            <div className="px-6 space-y-3 flex-shrink-0">
                 <button className="w-full bg-white p-4 rounded-full shadow-sm border border-slate-50 flex items-center justify-between active:scale-[0.98]"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-[#F0FDFA] flex items-center justify-center text-teal-500"><FileText className="w-5 h-5" /></div><span className="font-bold text-slate-700">实习协议 (Agreement)</span></div><ChevronRight className="text-slate-300" /></button>
                <button onClick={onLogout} className="w-full bg-white p-4 rounded-full shadow-sm border border-slate-50 flex items-center justify-between active:scale-[0.98] group"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 group-hover:text-rose-500"><LogOut className="w-5 h-5 ml-0.5" /></div><span className="font-bold text-slate-700 group-hover:text-rose-500 transition-colors">退出登录 (Sign Out)</span></div></button>
            </div>
             <div className="text-center mt-8 text-slate-300 text-xs flex-shrink-0 pb-4">v1.3.0 · Blueprint Global</div>
        </div>
    );
};

// --- Admin Views ---

const AdminDashView = ({ jobs, students, onSelectJob, apps, onGoToGuides }: any) => {
    const [search, setSearch] = useState('');
    const filteredJobs = jobs.filter((j: any) => j.title.toLowerCase().includes(search.toLowerCase()) || String(j.seqNo).includes(search) || j.location.toLowerCase().includes(search.toLowerCase())).sort((a:any, b:any) => a.seqNo - b.seqNo);
    const activeJobs = filteredJobs.filter((j: any) => { const approvedCount = apps.filter((a: any) => a.jobId === j.id && a.status === 'approved').length; return approvedCount < j.capacity; });
    const fullJobs = filteredJobs.filter((j: any) => { const approvedCount = apps.filter((a: any) => a.jobId === j.id && a.status === 'approved').length; return approvedCount >= j.capacity; });
    
    return (
        <div className="flex-1 overflow-y-auto p-6 pb-32 bg-[#F0F9FF]">
             <div className="flex items-center justify-between mb-6"><div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ADMIN CONSOLE</p><h1 className="text-3xl font-black text-slate-800">Dashboard</h1></div></div>
             
            <div className="mb-8 relative"><Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" /><input className="w-full bg-white pl-12 pr-4 py-3 rounded-2xl shadow-sm border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-200 font-bold text-slate-700" placeholder="Search jobs by Title or #ID..." value={search} onChange={e => setSearch(e.target.value)}/></div>
            
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                 <div className="min-w-[140px] bg-white p-4 rounded-[24px] border border-slate-50 shadow-lg shadow-slate-100"><div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 mb-2"><Users className="w-5 h-5" /></div><p className="text-2xl font-black text-slate-800">{students.length}</p><p className="text-xs text-slate-400 font-bold uppercase">Students</p></div>
                 <div className="min-w-[140px] bg-white p-4 rounded-[24px] border border-slate-50 shadow-lg shadow-slate-100"><div className="w-10 h-10 bg-[#FEF9C3] rounded-full flex items-center justify-center text-yellow-600 mb-2"><Briefcase className="w-5 h-5" /></div><p className="text-2xl font-black text-slate-800">{jobs.length}</p><p className="text-xs text-slate-400 font-bold uppercase">Jobs</p></div>
                 <div onClick={onGoToGuides} className="min-w-[140px] bg-white p-4 rounded-[24px] border border-slate-50 shadow-lg shadow-slate-100 active:scale-95 cursor-pointer"><div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2"><BookOpen className="w-5 h-5" /></div><p className="text-2xl font-black text-slate-800">Guides</p><p className="text-xs text-slate-400 font-bold uppercase">Manage</p></div>
            </div>
            
            <div className="mb-8">
                 <div className="flex items-center gap-2 mb-4"><div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div><h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Recruiting</h2></div>
                <div className="space-y-4">{activeJobs.map((job: any) => (<div key={job.id} onClick={() => onSelectJob(job)} className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100 active:scale-[0.98] transition-all relative overflow-hidden group"><div className="absolute top-4 right-4 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">#{String(job.seqNo).padStart(2,'0')}</div><div className="flex gap-4"><div className="w-16 h-16 rounded-2xl bg-slate-50 flex-shrink-0 overflow-hidden">{job.imgUrls && job.imgUrls.length > 0 ? (<img src={job.imgUrls[0]} className="w-full h-full object-cover" />) : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon /></div>}</div><div className="flex-1"><h3 className="text-lg font-black text-slate-800 leading-tight mb-1">{job.title}</h3><p className="text-slate-400 text-xs">{job.companyName}</p></div></div><div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center text-sky-500 text-xs font-bold"><span>View Applicants</span><ChevronRight className="w-4 h-4" /></div></div>))}</div>
            </div>
             <div>
                 <div className="flex items-center gap-2 mb-4"><div className="w-2 h-2 rounded-full bg-slate-300"></div><h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Filled / Closed</h2></div>
                <div className="space-y-4 opacity-70 grayscale">{fullJobs.map((job: any) => (<div key={job.id} onClick={() => onSelectJob(job)} className="bg-white p-5 rounded-[28px] border border-slate-100 active:scale-[0.98] relative"><div className="absolute top-4 right-4 bg-slate-200 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded">FULL</div><div className="flex gap-4"><div className="w-16 h-16 rounded-2xl bg-slate-50 flex-shrink-0 overflow-hidden">{job.imgUrls && job.imgUrls.length > 0 ? (<img src={job.imgUrls[0]} className="w-full h-full object-cover" />) : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon /></div>}</div><div className="flex-1"><h3 className="text-lg font-black text-slate-600 leading-tight mb-1">{job.title}</h3><p className="text-slate-400 text-xs">{job.companyName}</p></div></div></div>))}</div>
             </div>
        </div>
    );
};

const AdminApplicationsView = ({ apps, jobs, students, onBack, onUpdateAppStatus, onSelectStudent }: any) => {
    const [filter, setFilter] = useState('pending'); // 'pending', 'history'
    
    // Enrich application data
    const enrichedApps = apps.map((app: any) => ({
        ...app,
        job: jobs.find((j: any) => j.id === app.jobId),
        student: students.find((s: any) => s.id === app.userId)
    })).filter((a: any) => a.job && a.student);

    const filteredList = enrichedApps.filter((a: any) => {
        if (filter === 'pending') return a.status === 'pending';
        return a.status !== 'pending';
    }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="flex-1 overflow-y-auto p-6 pt-12 pb-24 min-h-0 bg-[#F0F9FF]">
            <div className="flex justify-between items-center mb-6">
                 {/* No Back button needed if in bottom nav, but keeping header clean */}
                 <div></div>
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Application Center</h1>
            <p className="text-slate-400 mb-6 font-medium">Manage student submissions</p>

            <div className="flex p-1 bg-white rounded-xl mb-6 shadow-sm border border-slate-100">
                <button onClick={() => setFilter('pending')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'pending' ? 'bg-sky-400 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>Pending ({enrichedApps.filter((a:any) => a.status === 'pending').length})</button>
                <button onClick={() => setFilter('history')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'history' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>History</button>
            </div>

            <div className="space-y-4">
                {filteredList.length === 0 ? (
                    <div className="text-center py-20 opacity-50"><Inbox className="w-16 h-16 mx-auto mb-4 text-slate-300" /><p className="text-slate-500 font-medium">No {filter} applications.</p></div>
                ) : filteredList.map((item: any) => (
                    <div key={item.id} className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-sky-50 text-sky-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide truncate max-w-[150px]">{item.job.title}</span>
                            <span className="text-slate-300 text-xs font-mono">{new Date(item.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-4 mb-6 cursor-pointer" onClick={() => onSelectStudent(item.student)}>
                            <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center font-black text-sky-500 text-lg">{item.student.name.charAt(0)}</div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg leading-tight flex items-center gap-2">{item.student.name} <ChevronRight className="w-4 h-4 text-slate-300" /></h3>
                                <p className="text-xs text-slate-400 font-bold uppercase">{item.student.school}</p>
                            </div>
                        </div>
                        {item.status === 'pending' ? (
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => onUpdateAppStatus(item.id, 'rejected')} className="py-3 rounded-xl bg-slate-50 text-slate-500 font-bold text-xs hover:bg-rose-50 hover:text-rose-500 transition-colors">Reject</button>
                                <button onClick={() => onUpdateAppStatus(item.id, 'approved')} className="py-3 rounded-xl bg-[#38BDF8] text-white font-bold text-xs shadow-lg shadow-sky-200 hover:bg-sky-400">Approve</button>
                            </div>
                        ) : (
                            <div className={`w-full py-3 rounded-xl text-center font-bold text-xs border ${item.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                {item.status.toUpperCase()}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdminJobDetailView = ({ job, applicants, onBack, onEditJob, onUpdateAppStatus }: any) => {
    return (
        <div className="flex-1 overflow-y-auto p-6 pt-12 pb-24 min-h-0 bg-[#F0F9FF]">
            <div className="flex justify-between items-center mb-6"><button onClick={onBack} className="flex items-center text-slate-400 font-bold"><ChevronLeft className="w-5 h-5 mr-1" /> Back</button><button onClick={() => onEditJob(job)} className="bg-white px-4 py-2 rounded-full text-sky-500 font-bold text-xs shadow-sm border border-slate-100 flex items-center gap-2"><Edit3 className="w-4 h-4" /> Edit Job</button></div>
            <div className="bg-white p-6 rounded-[32px] shadow-lg mb-8">
                 <div className="flex gap-4 mb-4">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden">{job.imgUrls && job.imgUrls.length > 0 ? (<img src={job.imgUrls[0]} className="w-full h-full object-cover" />) : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon /></div>}</div>
                    <div><h1 className="text-xl font-black text-slate-800 leading-tight mb-1">{job.title}</h1><p className="text-slate-500 font-medium text-sm">{job.companyName}</p><div className="flex gap-2 mt-2"><span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded">#{job.seqNo}</span><span className="bg-[#FEF9C3] text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded">{job.programYear}</span></div></div>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl"><span className="text-xs font-bold text-slate-400">CAPACITY</span><span className="font-black text-slate-800 text-lg">{applicants.filter((a: any) => a.application.status === 'approved').length} / {job.capacity}</span></div>
            </div>
            <h2 className="text-lg font-black text-slate-800 mb-4 px-2">Applicants ({applicants.length})</h2>
            <div className="space-y-4">
                {applicants.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-sm font-medium">No applications yet.</div>
                ) : applicants.map((item: any) => (
                    <div key={item.application.id} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center font-black text-sky-500">{item.student.name.charAt(0)}</div><div><h3 className="font-bold text-slate-800">{item.student.name}</h3><p className="text-xs text-slate-400 font-bold">{item.student.school}</p></div><div className="ml-auto flex flex-col items-end"><span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${item.application.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : item.application.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-yellow-100 text-yellow-600'}`}>{item.application.status}</span><span className="text-xs text-slate-300 font-mono mt-1">Score: {item.student.score}</span></div></div>
                        {item.application.status === 'pending' && (<div className="flex gap-2"><button onClick={() => onUpdateAppStatus(item.application.id, 'rejected')} className="flex-1 py-3 rounded-xl bg-slate-50 text-slate-500 font-bold text-xs hover:bg-rose-50 hover:text-rose-500 transition-colors">Reject</button><button onClick={() => onUpdateAppStatus(item.application.id, 'approved')} className="flex-1 py-3 rounded-xl bg-[#38BDF8] text-white font-bold text-xs shadow-lg shadow-sky-200">Approve</button></div>)}
                         {item.application.status === 'approved' && (<button onClick={() => onUpdateAppStatus(item.application.id, 'pending')} className="w-full py-2 rounded-xl text-slate-400 text-xs font-bold hover:bg-slate-50">Revoke Approval</button>)}
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdminPostJobView = ({ onSave, onCancel, editingJob }: any) => {
    const [job, setJob] = useState<Partial<Job>>({ seqNo: 0, title: '', companyName: '', location: '', description: '', programYear: '2025', housing: 'Provided', housingCost: '$150/wk', salary: '$16.00/hr', startDateRange: 'Jun 15 - Jun 30', endDate: 'Sept 15, 2025', capacity: 10, minScore: 6.0, tags: [], imgUrls: [] });
    useEffect(() => { if (editingJob) setJob(editingJob); }, [editingJob]);
    const handleImageUpload = (e: any) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { const currentUrls = job.imgUrls || []; if (currentUrls.length < 9) { setJob({ ...job, imgUrls: [...currentUrls, reader.result as string] }); } else { alert("Max 9 images allowed"); } }; reader.readAsDataURL(file); } };
    return (
        <div className="flex-1 overflow-y-auto p-6 pb-24 min-h-0 bg-[#F0F9FF]">
            <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-black text-slate-900">{editingJob ? 'Edit Position' : 'New Position'}</h1><button onClick={onCancel} className="text-slate-400 font-bold">Cancel</button></div>
            <div className="space-y-6">
                <div className="bg-white p-5 rounded-[32px] border border-slate-100">
                    <div className="flex justify-between mb-4"><label className="text-xs font-bold text-slate-400 uppercase">Gallery ({job.imgUrls?.length || 0}/9)</label></div>
                    <div className="grid grid-cols-3 gap-2">{job.imgUrls?.map((url, idx) => (<div key={idx} className="aspect-square rounded-xl overflow-hidden relative group"><img src={url} className="w-full h-full object-cover" /><button onClick={() => setJob({...job, imgUrls: job.imgUrls?.filter((_, i) => i !== idx)})} className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white"><Trash2 className="w-5 h-5" /></button></div>))}{(job.imgUrls?.length || 0) < 9 && (<label className="aspect-square rounded-xl bg-sky-50 border-2 border-dashed border-sky-200 flex flex-col items-center justify-center text-sky-400 cursor-pointer hover:bg-sky-100 transition-colors"><Camera className="w-6 h-6 mb-1" /><span className="text-[10px] font-bold">Add</span><input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /></label>)}</div>
                </div>
                <div className="bg-white p-5 rounded-[32px] space-y-4">
                     <div><label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">序号 (SEQUENCE NO.)</label><input className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 focus:outline-none" type="number" value={job.seqNo} onChange={e => setJob({...job, seqNo: parseInt(e.target.value)})}/></div>
                    <div><label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">职位名称 (JOB TITLE)</label><input className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 focus:outline-none" value={job.title} onChange={e => setJob({...job, title: e.target.value})} placeholder="e.g. Lifeguard"/></div>
                     <div><label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">公司名称 (COMPANY NAME)</label><input className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 focus:outline-none" value={job.companyName} onChange={e => setJob({...job, companyName: e.target.value})} placeholder="e.g. Resort World"/></div>
                     <div><label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">地点 (LOCATION)</label><input className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 focus:outline-none" value={job.location} onChange={e => setJob({...job, location: e.target.value})} placeholder="e.g. City, State"/></div>
                    <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">薪资 (SALARY)</label><input className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 focus:outline-none" value={job.salary} onChange={e => setJob({...job, salary: e.target.value})}/></div><div><label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">招聘人数 (CAPACITY)</label><input className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 focus:outline-none" type="number" value={job.capacity} onChange={e => setJob({...job, capacity: parseInt(e.target.value)})}/></div></div>
                    <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">住宿 (HOUSING)</label><select className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 focus:outline-none appearance-none" value={job.housing} onChange={e => setJob({...job, housing: e.target.value})}><option value="Provided">Provided</option><option value="Assistance">Assistance</option><option value="None">None</option></select></div><div><label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">费用 (COST)</label><input className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 focus:outline-none" value={job.housingCost} onChange={e => setJob({...job, housingCost: e.target.value})}/></div></div>
                    <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">开始日期 (START)</label><input className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 focus:outline-none" value={job.startDateRange} onChange={e => setJob({...job, startDateRange: e.target.value})} placeholder="Jun 15 - 30"/></div><div><label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">结束日期 (END)</label><input className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 focus:outline-none" value={job.endDate} onChange={e => setJob({...job, endDate: e.target.value})} placeholder="Sept 15"/></div></div>
                    <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">届数 (YEAR)</label><input className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 focus:outline-none" value={job.programYear} onChange={e => setJob({...job, programYear: e.target.value})}/></div><div><label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">最低分数 (MIN SCORE)</label><input className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 focus:outline-none" type="number" step="0.5" min="6" max="10" value={job.minScore} onChange={e => setJob({...job, minScore: parseFloat(e.target.value)})}/></div></div>
                     <div><label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">职位描述 (DESCRIPTION)</label><textarea className="w-full bg-slate-50 p-4 rounded-2xl font-medium text-slate-600 focus:outline-none min-h-[200px]" value={job.description} onChange={e => setJob({...job, description: e.target.value})} placeholder="Describe the role..."/></div>
                </div>
                <Button onClick={() => onSave(job)} className="w-full shadow-xl shadow-sky-200">{editingJob ? 'Save Changes' : 'Publish Position'}</Button>
            </div>
        </div>
    );
};

const AdminStudentsView = ({ students, onSelectStudent, apps, jobs }: any) => {
    const [search, setSearch] = useState('');
    const [yearFilter, setYearFilter] = useState('All');
    const [matchFilter, setMatchFilter] = useState('All'); // 'All' | 'Matched' | 'Unmatched'

    const filteredStudents = students.filter((s: any) => {
        // Year Logic
        const yearMatch = yearFilter === 'All' || s.programYear === yearFilter;
        // Search Logic
        const searchMatch = s.name.toLowerCase().includes(search.toLowerCase()) || String(s.seqNo).includes(search);
        
        // Match Status Logic
        const approvedApp = apps.find((a: any) => a.userId === s.id && a.status === 'approved');
        const isMatched = !!approvedApp;

        let statusMatch = true;
        if (matchFilter === 'Matched') statusMatch = isMatched;
        if (matchFilter === 'Unmatched') statusMatch = !isMatched;

        return yearMatch && searchMatch && statusMatch;
    }).sort((a: any, b: any) => (a.seqNo || 0) - (b.seqNo || 0));

    return (
        <div className="flex-1 overflow-y-auto p-6 pb-32 bg-[#F0F9FF]">
            <h1 className="text-3xl font-black text-slate-800 mb-6">Student Registry</h1>
            
            <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                    <input className="w-full bg-white pl-12 pr-4 py-3 rounded-2xl shadow-sm border border-slate-100 focus:outline-none font-bold text-slate-700" placeholder="Search Name or #ID..." value={search} onChange={e => setSearch(e.target.value)}/>
                </div>
            </div>
            <div className="flex gap-2 mb-6">
                <select className="bg-white px-4 py-2 rounded-xl font-bold text-slate-600 border border-slate-100 focus:outline-none flex-1" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
                    <option value="All">All Years</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                </select>
                <select className="bg-white px-4 py-2 rounded-xl font-bold text-slate-600 border border-slate-100 focus:outline-none flex-1" value={matchFilter} onChange={e => setMatchFilter(e.target.value)}>
                    <option value="All">All Status</option>
                    <option value="Matched">Matched</option>
                    <option value="Unmatched">Unmatched</option>
                </select>
            </div>

            <div className="space-y-3">
                {filteredStudents.map((s: any) => {
                    const approvedApp = apps.find((a: any) => a.userId === s.id && a.status === 'approved');
                    const matchedJob = approvedApp ? jobs.find((j: any) => j.id === approvedApp.jobId) : null;

                    return (
                        <div key={s.id} onClick={() => onSelectStudent(s)} className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex flex-col gap-2 active:scale-[0.98]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 text-sm">#{s.seqNo}</div>
                                     <div><h3 className="font-bold text-slate-800">{s.name}</h3><p className="text-xs text-slate-400 font-bold uppercase">{s.school}</p></div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                     <span className="bg-sky-50 text-sky-600 text-[10px] font-bold px-2 py-0.5 rounded">{s.programYear}</span>
                                     <span className="text-slate-300 font-bold">{s.score}</span>
                                </div>
                            </div>
                            {/* Match Status Badge */}
                            {matchedJob ? (
                                <div className="bg-emerald-50 text-emerald-600 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Matched: {matchedJob.title}
                                </div>
                            ) : (
                                <div className="bg-slate-50 text-slate-400 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Unmatched
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const AdminStudentDetailView = ({ student, onBack, onUpdateScore }: any) => {
    const [score, setScore] = useState(student.score);
    const [seqNo, setSeqNo] = useState(student.seqNo || 0);
    return (
        <div className="flex-1 overflow-y-auto p-6 pt-12 pb-24 min-h-0 bg-[#F0F9FF]">
            <button onClick={onBack} className="mb-6 flex items-center text-slate-400 font-bold"><ChevronLeft className="w-5 h-5 mr-1" /> Back</button>
            <div className="bg-white p-6 rounded-[32px] shadow-lg mb-6 text-center">
                 <div className="w-24 h-24 bg-sky-100 rounded-full mx-auto flex items-center justify-center text-3xl font-black text-sky-500 mb-4">{student.name.charAt(0)}</div>
                 <h1 className="text-2xl font-black text-slate-900">{student.name}</h1>
                 <p className="text-slate-400 font-bold">{student.school}</p>
                 <div className="flex justify-center gap-2 mt-4"><span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">{student.programYear}</span><span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">{student.phone}</span></div>
            </div>
            <div className="bg-white p-6 rounded-[32px] shadow-lg space-y-4">
                <h3 className="font-bold text-slate-800">管理员操作 (Admin Actions)</h3>
                <div><label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">评分 (SCORE 6.0-10.0)</label><input type="number" step="0.5" className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700" value={score} onChange={e => setScore(e.target.value)}/></div>
                 <div><label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">序号 (SEQUENCE ID)</label><input type="number" className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700" value={seqNo} onChange={e => setSeqNo(e.target.value)}/></div>
                <Button onClick={() => onUpdateScore(student.id, parseFloat(score), parseInt(seqNo))} className="w-full">Update Student</Button>
            </div>
            <div className="mt-8 px-4"><h3 className="font-bold text-slate-400 text-sm uppercase mb-4">紧急联系人 (Emergency Contacts)</h3>{student.emergencyContacts?.map((c: any, i: number) => (<div key={i} className="bg-white p-4 rounded-2xl mb-2 border border-slate-50"><p className="font-bold text-slate-800">{c.name} <span className="text-sky-500 text-xs ml-2">{c.type}</span></p><p className="text-slate-400 text-sm">{c.phone}</p></div>))}</div>
        </div>
    );
};

const AdminGuidesView = ({ guides, onDelete, onEdit, onAdd, onBack }: any) => {
    return (
        <div className="flex-1 overflow-y-auto p-6 pb-24 min-h-0 bg-[#F0F9FF]">
             <div className="flex justify-between items-center mb-6"><div className="flex items-center gap-2"><button onClick={onBack} className="flex items-center text-slate-400 font-bold mr-2"><ChevronLeft className="w-5 h-5" /></button><h1 className="text-3xl font-black text-slate-800">Guides</h1></div><button onClick={onAdd} className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-sky-200"><Plus className="w-6 h-6" /></button></div>
            <div className="space-y-4">{guides.map((g: any) => (<div key={g.id} className="bg-white p-4 rounded-[28px] border border-slate-100 flex gap-4 items-center"><div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">{g.imgUrl ? <img src={g.imgUrl} className="w-full h-full object-cover"/> : <BookOpen className="w-6 h-6 m-auto mt-5 text-slate-300"/>}</div><div className="flex-1"><h3 className="font-bold text-slate-800 leading-tight">{g.title}</h3><p className="text-xs text-slate-400">{g.category}</p></div><div className="flex flex-col gap-2"><button onClick={() => onEdit(g)} className="p-2 bg-slate-50 rounded-full text-slate-500"><Edit3 className="w-4 h-4" /></button><button onClick={() => onDelete(g.id)} className="p-2 bg-rose-50 rounded-full text-rose-500"><Trash2 className="w-4 h-4" /></button></div></div>))}</div>
        </div>
    );
};

const AdminPostGuideView = ({ onSave, onCancel, editingGuide }: any) => {
    const [guide, setGuide] = useState<Partial<Guide>>({ title: '', content: '', category: 'General', imgUrl: '' });
    useEffect(() => { if (editingGuide) setGuide(editingGuide); }, [editingGuide]);
    const handleImageUpload = (e: any) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { setGuide({ ...guide, imgUrl: reader.result as string }); }; reader.readAsDataURL(file); } };
    return (
        <div className="flex-1 overflow-y-auto p-6 pb-24 min-h-0 bg-[#F0F9FF]">
             <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-black text-slate-900">{editingGuide ? 'Edit Guide' : 'New Guide'}</h1><button onClick={onCancel} className="text-slate-400 font-bold">Cancel</button></div>
            <div className="space-y-4 bg-white p-6 rounded-[32px] shadow-lg">
                 <div className="w-full h-40 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden relative group">{guide.imgUrl ? (<img src={guide.imgUrl} className="w-full h-full object-cover" />) : (<div className="flex flex-col items-center justify-center h-full text-slate-300"><ImageIcon className="w-8 h-8 mb-2" /><span className="text-xs font-bold">Upload Cover</span></div>)}<input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} /></div>
                 <input className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 focus:outline-none" placeholder="Title" value={guide.title} onChange={e => setGuide({...guide, title: e.target.value})}/>
                 <input className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 focus:outline-none" placeholder="Category" value={guide.category} onChange={e => setGuide({...guide, category: e.target.value})}/>
                 <textarea className="w-full bg-slate-50 p-4 rounded-2xl font-medium text-slate-600 focus:outline-none min-h-[400px]" placeholder="Markdown Content..." value={guide.content} onChange={e => setGuide({...guide, content: e.target.value})}/>
                 <Button onClick={() => onSave(guide)} className="w-full">Save Guide</Button>
            </div>
        </div>
    );
};

const App = () => {
    const [user, setUser] = useState<UserData | null>(null);
    const [view, setView] = useState('login'); // login, register, student-jobs, student-internship, student-services, student-profile, admin-dash, admin-post, admin-students, admin-student-detail, admin-guides, admin-post-guide, admin-apps
    const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
    const [apps, setApps] = useState<Application[]>(INITIAL_APPS);
    const [students, setStudents] = useState<UserData[]>(INITIAL_USERS);
    const [guides, setGuides] = useState<Guide[]>(INITIAL_GUIDES);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<UserData | null>(null);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
    const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    const handleLogin = (role: Role) => {
        if (role === 'student') setUser(INITIAL_USERS[0]);
        else setUser(INITIAL_USERS[1]);
        setView(role === 'student' ? 'student-jobs' : 'admin-dash');
    };

    const handleRegister = (data: any) => {
        const newUser: UserData = {
            id: `u${Date.now()}`,
            seqNo: students.length + 1,
            name: data.name,
            role: 'student',
            school: data.school,
            phone: data.phone,
            score: 6.0,
            programYear: data.year,
            emergencyContacts: []
        };
        setStudents([...students, newUser]);
        setUser(newUser);
        setView('student-jobs');
    };

    const handleApply = (job: Job) => {
        if (user?.role === 'student') {
            setSelectedJob(job);
            setView('student-job-detail');
        }
    };

    const handleApplyConfirm = (jobId: string) => {
        if (!user) return;
        const newApp: Application = {
            id: `a${Date.now()}`,
            userId: user.id,
            jobId,
            status: 'pending',
            date: new Date().toISOString()
        };
        setApps([...apps, newApp]);
        setView('student-internship');
    };

    const handleWithdrawApp = (appId: string) => {
        if (confirm("Are you sure you want to withdraw this application?")) {
            setApps(apps.filter(a => a.id !== appId));
        }
    };

    const handleUpdateUser = (updatedUser: UserData) => {
        setStudents(students.map(s => s.id === updatedUser.id ? updatedUser : s));
        setUser(updatedUser);
    };

    const handleSaveJob = (jobData: Job) => {
        if (editingJob) {
            setJobs(jobs.map(j => j.id === jobData.id ? jobData : j));
        } else {
            setJobs([...jobs, { ...jobData, id: `j${Date.now()}` }]);
        }
        setView('admin-dash');
        setEditingJob(null);
    };

    const handleUpdateAppStatus = (appId: string, status: AppStatus) => {
        setApps(apps.map(a => a.id === appId ? { ...a, status } : a));
    };

    const handleUpdateScore = (userId: string, score: number, seqNo: number) => {
        setStudents(students.map(s => s.id === userId ? { ...s, score, seqNo } : s));
        setView('admin-students');
    };

    // Admin Guide Handlers
    const handleSaveGuide = (guideData: Guide) => {
        if (editingGuide) {
            setGuides(guides.map(g => g.id === guideData.id ? guideData : g));
        } else {
            setGuides([...guides, { ...guideData, id: `g${Date.now()}` }]);
        }
        setView('admin-guides');
        setEditingGuide(null);
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-slate-50 overflow-hidden">
            {view === 'login' && <LoginView onLogin={handleLogin} onRegister={() => setView('register')} />}
            {view === 'register' && <RegisterView onRegister={handleRegister} onCancel={() => setView('login')} />}

            {/* Student Views */}
            {view === 'student-jobs' && user && (
                <StudentJobsView 
                    jobs={jobs} user={user} onApply={handleApply} 
                    myApps={apps.filter(a => a.userId === user.id)}
                />
            )}
            {view === 'student-job-detail' && selectedJob && user && (
                <StudentJobDetail 
                    job={selectedJob} user={user} 
                    onBack={() => setView('student-jobs')} 
                    onApplyConfirm={handleApplyConfirm}
                    hasActiveApp={apps.some(a => a.userId === user.id && (a.status === 'pending' || a.status === 'approved'))}
                    isFull={apps.filter(a => a.jobId === selectedJob.id && a.status === 'approved').length >= selectedJob.capacity}
                />
            )}
            {view === 'student-internship' && user && (
                <StudentInternshipView 
                    user={user} apps={apps} jobs={jobs} 
                    onWithdraw={handleWithdrawApp}
                />
            )}
            {view === 'student-services' && user && (
                <StudentServicesView 
                    user={user} guides={guides}
                    onEmergency={() => setView('student-emergency')}
                    onSelectGuide={(g: any) => { /* Mock open guide */ alert(g.content); }}
                />
            )}
            {view === 'student-emergency' && user && (
                <StudentEmergencyView 
                    user={user} onBack={() => setView('student-services')}
                    onUpdateUser={handleUpdateUser}
                />
            )}
            {view === 'student-profile' && user && (
                <StudentProfileView 
                    user={user} 
                    onLogout={() => setView('login')}
                    isEditing={isEditingProfile}
                    onEdit={() => setIsEditingProfile(!isEditingProfile)}
                    onSaveProfile={(data: any) => {
                        handleUpdateUser({ ...user, ...data });
                        setIsEditingProfile(false);
                    }}
                />
            )}

            {/* Admin Views */}
            {view === 'admin-dash' && (
                <AdminDashView 
                    jobs={jobs} students={students} apps={apps}
                    onSelectJob={(j: any) => { setSelectedJob(j); setView('admin-job-detail'); }}
                    onGoToGuides={() => setView('admin-guides')}
                />
            )}
            {view === 'admin-apps' && (
                <AdminApplicationsView 
                    apps={apps} jobs={jobs} students={students}
                    onBack={() => setView('admin-dash')}
                    onUpdateAppStatus={handleUpdateAppStatus}
                    onSelectStudent={(s: any) => { setSelectedStudent(s); setView('admin-student-detail'); }}
                />
            )}
            {view === 'admin-job-detail' && selectedJob && (
                <AdminJobDetailView 
                    job={selectedJob} 
                    applicants={apps.filter(a => a.jobId === selectedJob.id).map(a => ({
                        application: a,
                        student: students.find(s => s.id === a.userId)
                    }))}
                    onBack={() => setView('admin-dash')}
                    onEditJob={(j: any) => { setEditingJob(j); setView('admin-post'); }}
                    onUpdateAppStatus={handleUpdateAppStatus}
                />
            )}
            {view === 'admin-post' && (
                <AdminPostJobView 
                    onSave={handleSaveJob} 
                    onCancel={() => setView('admin-dash')}
                    editingJob={editingJob}
                />
            )}
            {view === 'admin-students' && (
                <AdminStudentsView 
                    students={students} 
                    apps={apps}
                    jobs={jobs}
                    onSelectStudent={(s: any) => { setSelectedStudent(s); setView('admin-student-detail'); }} 
                />
            )}
            {view === 'admin-student-detail' && selectedStudent && (
                <AdminStudentDetailView 
                    student={selectedStudent}
                    onBack={() => setView('admin-students')}
                    onUpdateScore={handleUpdateScore}
                />
            )}
            {view === 'admin-guides' && (
                <AdminGuidesView 
                    guides={guides}
                    onAdd={() => { setEditingGuide(null); setView('admin-post-guide'); }}
                    onEdit={(g: any) => { setEditingGuide(g); setView('admin-post-guide'); }}
                    onDelete={(id: string) => setGuides(guides.filter(g => g.id !== id))}
                    onBack={() => setView('admin-dash')}
                />
            )}
            {view === 'admin-post-guide' && (
                <AdminPostGuideView 
                    onSave={handleSaveGuide} 
                    onCancel={() => setView('admin-guides')}
                    editingGuide={editingGuide}
                />
            )}

            {/* Bottom Nav */}
            {user && !['login', 'register', 'student-job-detail', 'student-emergency', 'admin-post', 'admin-post-guide', 'admin-job-detail', 'admin-student-detail'].includes(view) && (
                <div className="absolute bottom-0 w-full bg-white border-t border-slate-100 flex justify-around items-center py-4 pb-8 z-50 rounded-t-[32px] shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
                    {user.role === 'student' ? (
                        <>
                            <button onClick={() => setView('student-jobs')} className={`flex flex-col items-center ${view === 'student-jobs' ? 'text-sky-500' : 'text-slate-300'}`}><Home className={`w-6 h-6 mb-1 ${view === 'student-jobs' ? 'fill-current' : ''}`} /><span className="text-[10px] font-bold">Jobs</span></button>
                            <button onClick={() => setView('student-internship')} className={`flex flex-col items-center ${view === 'student-internship' ? 'text-sky-500' : 'text-slate-300'}`}><Briefcase className={`w-6 h-6 mb-1 ${view === 'student-internship' ? 'fill-current' : ''}`} /><span className="text-[10px] font-bold">My App</span></button>
                            <button onClick={() => setView('student-services')} className={`flex flex-col items-center ${view === 'student-services' ? 'text-sky-500' : 'text-slate-300'}`}><ShieldAlert className={`w-6 h-6 mb-1 ${view === 'student-services' ? 'fill-current' : ''}`} /><span className="text-[10px] font-bold">Services</span></button>
                            <button onClick={() => setView('student-profile')} className={`flex flex-col items-center ${view === 'student-profile' ? 'text-sky-500' : 'text-slate-300'}`}><User className={`w-6 h-6 mb-1 ${view === 'student-profile' ? 'fill-current' : ''}`} /><span className="text-[10px] font-bold">Me</span></button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setView('admin-dash')} className={`flex flex-col items-center ${['admin-dash', 'admin-job-detail'].includes(view) ? 'text-sky-500' : 'text-slate-300'}`}><LayoutGrid className={`w-6 h-6 mb-1 ${view.includes('admin-dash') ? 'fill-current' : ''}`} /><span className="text-[10px] font-bold">Dash</span></button>
                            
                            {/* Review Tab (Apps) */}
                            <button onClick={() => setView('admin-apps')} className={`flex flex-col items-center relative ${view === 'admin-apps' ? 'text-sky-500' : 'text-slate-300'}`}>
                                <Inbox className={`w-6 h-6 mb-1 ${view === 'admin-apps' ? 'fill-current' : ''}`} />
                                {apps.filter(a => a.status === 'pending').length > 0 && <span className="absolute top-0 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>}
                                <span className="text-[10px] font-bold">Review</span>
                            </button>

                            {/* Post Button (Middle) */}
                            <button onClick={() => { setEditingJob(null); setView('admin-post'); }} className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-sky-200 -mt-8 border-4 border-slate-50"><Plus className="w-6 h-6" /></button>
                            
                            {/* Students Tab */}
                            <button onClick={() => setView('admin-students')} className={`flex flex-col items-center ${['admin-students', 'admin-student-detail'].includes(view) ? 'text-sky-500' : 'text-slate-300'}`}><Users className={`w-6 h-6 mb-1 ${view.includes('admin-students') ? 'fill-current' : ''}`} /><span className="text-[10px] font-bold">Students</span></button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
