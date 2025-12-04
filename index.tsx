
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
          <Button onClick={() => onLogin('student')} variant="black" className="w-full text-lg h-16">学生登录 (Student)</Button>
          <Button onClick={() => onLogin('admin')} variant="outline" className="w-full text-lg h-16 border-sky-200 text-sky-500 bg-white">管理员后台 (Admin)</Button>
        </div>
        <div className="mt-8 text-center">
           <p className="text-slate-400 mb-2">首次使用?</p>
           <button onClick={onRegister} className="text-[#38BDF8] font-bold text-lg">创建账号 (Create Account)</button>
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
            alert("请填写所有必填项 (姓名、学校、电话)。");
            return;
        }
        onRegister(formData);
    };
    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F0F9FF]">
            <div className="p-6 pt-12 pb-24">
                 <button onClick={onCancel} className="mb-6 flex items-center text-slate-400 font-bold"><ChevronLeft className="w-5 h-5 mr-1" /> 返回 (Back)</button>
                <h1 className="text-3xl font-black text-slate-900 mb-2">Blueprint Global Exchange</h1>
                <p className="text-slate-500 mb-8">蓝途启航 · 赴美带薪实习</p>
                <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-sky-100 border border-white">
                    <h2 className="text-xl font-bold text-center mb-6 text-slate-800">学生注册 (Registration)</h2>
                    <div className="space-y-5">
                        <div className="bg-[#FEF9C3] p-4 rounded-2xl border border-yellow-100">
                             <label className="block text-xs font-bold text-yellow-700 uppercase tracking-wider mb-2">意向年份 (Intended Year)</label>
                             <div className="flex gap-2">
                                 {['2025', '2026'].map(y => (
                                     <button key={y} onClick={() => setFormData({...formData, year: y})} className={`flex-1 py-2 rounded-xl font-bold transition-all ${formData.year === y ? 'bg-yellow-400 text-yellow-900 shadow-sm' : 'bg-white/50 text-yellow-700'}`}>{y}</button>
                                 ))}
                             </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">真实姓名 (FULL NAME)</label>
                                <input className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200" placeholder="例：张三" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">就读学校 (UNIVERSITY)</label>
                                <input className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200" placeholder="例：北京大学" value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})}/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">手机号码 (PHONE)</label>
                                <div className="flex gap-2">
                                     <input className="flex-1 bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200" placeholder="11位手机号" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/>
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6 pb-32 bg-[#F0F9FF]">
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
                     <div className="flex items-center gap-2 mb-4"><div className="w-2 h-2 rounded-full bg-slate-300"></div><h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">已满员 / 关闭 (Closed)</h2></div>
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
        <div className="flex flex-col h-full bg-white overflow-hidden">
            <div className="relative h-64 bg-slate-100">
                <div className="flex overflow-x-auto snap-x snap-mandatory h-full w-full scrollbar-hide">
                    {job.imgUrls && job.imgUrls.length > 0 ? (job.imgUrls.map((url: string, idx: number) => (<img key={idx} src={url} className="w-full h-full object-cover snap-center flex-shrink-0" alt="Job Cover" />))) : (<div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-12 h-12" /></div>)}
                </div>
                <button onClick={onBack} className="absolute top-4 left-4 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-lg text-slate-800 z-10"><ChevronLeft /></button>
                 {job.imgUrls && job.imgUrls.length > 1 && (<div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur">左右滑动查看更多</div>)}
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative -mt-6 bg-white rounded-t-[32px] z-10">
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
                {isFull ? (<Button disabled className="w-full text-lg bg-slate-100 text-slate-400 shadow-none cursor-not-allowed">职位已满 (Position Filled)</Button>) : hasActiveApp ? (<Button disabled className="w-full text-lg bg-rose-50 text-rose-400 shadow-none border-2 border-rose-100">申请名额已满 (限报一个)</Button>) : user.score < job.minScore ? (<Button disabled className="w-full text-lg bg-slate-100 text-slate-400 shadow-none">分数不足 (最低需 {job.minScore})</Button>) : (<Button onClick={() => onApplyConfirm(job.id)} className="w-full text-lg">立即申请 (Apply Now)</Button>)}
            </div>
        </div>
    );
};

const StudentInternshipView = ({ user, apps, jobs, onWithdraw }: any) => {
    const myApps = apps.filter((a: any) => a.userId === user.id).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-12 pb-32 min-h-0 bg-[#F0F9FF]">
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
                                        <div className="flex items-start gap-3"><AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" /><p className="text-sm text-yellow-800 leading-relaxed font-medium">您的申请已提交。审核需要一定时间，请耐心等待，切勿频繁催促。通过后系统将自动更新状态。</p></div>
                                    </div>
                                )}
                                {app.status === 'approved' && (
                                     <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mb-4">
                                        <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" /><p className="text-sm text-emerald-800 font-medium">恭喜！您的申请已通过。</p></div>
                                    </div>
                                )}
                                {app.status === 'pending' && (<button onClick={() => onWithdraw(app.id)} className="w-full py-3 rounded-xl border border-rose-100 text-rose-500 font-bold hover:bg-rose-50 transition-colors text-sm">撤回申请 (Withdraw)</button>)}
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6 pb-32 min-h-0 bg-[#F0F9FF]">
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col h-full bg-[#F0F9FF]">
            <div className="bg-[#38BDF8] px-6 pt-12 pb-8 rounded-b-[40px] shadow-xl shadow-sky-200 z-10 flex-shrink-0">
                <div className="flex items-center justify-between text-white mb-6"><button onClick={onBack} className="flex items-center font-bold opacity-80 hover:opacity-100"><ChevronLeft className="w-5 h-5 mr-1" /> 返回 (Back)</button></div>
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
                        <button onClick={() => setIsAdding(true)} className="w-full py-4 rounded-2xl border-2 border-dashed border-sky-200 text-sky-400 font-bold flex items-center justify-center gap-2 hover:bg-sky-50 active:scale-95 transition-all"><Plus className="w-5 h-5" />添加联系人 (Add Friend)</button>
                    ) : (
                        <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100 animate-in fade-in zoom-in duration-200">
                            <h4 className="font-bold text-sky-800 mb-3 text-center">New Contact</h4>
                            <div className="space-y-3">
                                <input className="w-full bg-white p-3 rounded-xl text-slate-700 font-bold focus:outline-none border border-sky-100" placeholder="Name (e.g. Mom)" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})}/>
                                <input className="w-full bg-white p-3 rounded-xl text-slate-700 font-bold focus:outline-none border border-sky-100" placeholder="Phone Number" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})}/>
                                <div className="flex gap-2">{['Friend', 'Family', 'Work'].map(type => (<button key={type} onClick={() => setNewContact({...newContact, type})} className={`flex-1 py-2 rounded-lg text-xs font-bold ${newContact.type === type ? 'bg-sky-400 text-white shadow-md' : 'bg-white text-slate-400'}`}>{type}</button>))}</div>
                                <div className="flex gap-2 pt-2"><button onClick={() => setIsAdding(false)} className="flex-1 py-3 rounded-xl bg-slate-200 text-slate-500 font-bold">取消</button><button onClick={handleAdd} className="flex-1 py-3 rounded-xl bg-sky-400 text-white font-bold shadow-lg shadow-sky-200">保存</button></div>
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
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-12 pb-24 min-h-0 bg-[#F0F9FF]">
                 <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-black text-slate-900">编辑个人资料</h1><button onClick={onEdit} className="text-slate-400 font-bold">取消</button></div>
                <div className="bg-white p-6 rounded-[32px] shadow-lg space-y-4">
                    <div><label className="text-xs font-bold text-slate-400 mb-1 block">姓名 (FULL NAME)</label><input className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-800" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})}/></div>
                     <div><label className="text-xs font-bold text-slate-400 mb-1 block">电话 (PHONE)</label><input className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-800" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})}/></div>
                     <div><label className="text-xs font-bold text-slate-400 mb-1 block">学校 (SCHOOL - LOCKED)</label><input disabled className="w-full bg-slate-100 p-3 rounded-xl font-bold text-slate-400 cursor-not-allowed" value={user.school}/></div>
                    <Button onClick={handleSave} className="w-full mt-4">保存修改 (Save Changes)</Button>
                </div>
            </div>
        );
    }
    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col pb-32 min-h-0 bg-[#F0F9FF]">
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-32 bg-[#F0F9FF]">
             <div className="flex items-center justify-between mb-6"><div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ADMIN CONSOLE</p><h1 className="text-3xl font-black text-slate-800">Dashboard</h1></div></div>
             
            <div className="mb-8 relative"><Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" /><input className="w-full bg-white pl-12 pr-4 py-3 rounded-2xl shadow-sm border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-200 font-bold text-slate-700" placeholder="Search Title or #ID..." value={search} onChange={e => setSearch(e.target.value)}/></div>
            
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                 <div className="min-w-[140px] bg-white p-4 rounded-[24px] border border-slate-50 shadow-lg shadow-slate-100"><div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 mb-2"><Users className="w-5 h-5" /></div><p className="text-2xl font-black text-slate-800">{students.length}</p><p className="text-xs text-slate-400 font-bold uppercase">学生 (Students)</p></div>
                 <div className="min-w-[140px] bg-white p-4 rounded-[24px] border border-slate-50 shadow-lg shadow-slate-100"><div className="w-10 h-10 bg-[#FEF9C3] rounded-full flex items-center justify-center text-yellow-600 mb-2"><Briefcase className="w-5 h-5" /></div><p className="text-2xl font-black text-slate-800">{jobs.length}</p><p className="text-xs text-slate-400 font-bold uppercase">职位 (Jobs)</p></div>
                 <div onClick={onGoToGuides} className="min-w-[140px] bg-white p-4 rounded-[24px] border border-slate-50 shadow-lg shadow-slate-100 active:scale-95 cursor-pointer"><div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2"><BookOpen className="w-5 h-5" /></div><p className="text-2xl font-black text-slate-800">Guides</p><p className="text-xs text-slate-400 font-bold uppercase">指南 (Manage)</p></div>
            </div>
            
            <div className="mb-8">
                 <div className="flex items-center gap-2 mb-4"><div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div><h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">招聘中 (Active)</h2></div>
                <div className="space-y-4">{activeJobs.map((job: any) => (<div key={job.id} onClick={() => onSelectJob(job)} className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100 active:scale-[0.98] transition-all relative overflow-hidden group"><div className="absolute top-4 right-4 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">#{String(job.seqNo).padStart(2,'0')}</div><div className="flex gap-4"><div className="w-16 h-16 rounded-2xl bg-slate-50 flex-shrink-0 overflow-hidden">{job.imgUrls && job.imgUrls.length > 0 ? (<img src={job.imgUrls[0]} className="w-full h-full object-cover" />) : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon /></div>}</div><div className="flex-1"><h3 className="text-lg font-black text-slate-800 leading-tight mb-1">{job.title}</h3><p className="text-slate-400 text-xs">{job.companyName}</p></div></div><div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center text-sky-500 text-xs font-bold"><span>查看申请 (View Applicants)</span><ChevronRight className="w-4 h-4" /></div></div>))}</div>
            </div>
             <div>
                 <div className="flex items-center gap-2 mb-4"><div className="w-2 h-2 rounded-full bg-slate-300"></div><h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">已满员 / 关闭 (Closed)</h2></div>
                <div className="space-y-4 opacity-70 grayscale">{fullJobs.map((job: any) => (<div key={job.id} onClick={() => onSelectJob(job)} className="bg-white p-5 rounded-[28px] border border-slate-100 active:scale-[0.98] relative"><div className="absolute top-4 right-4 bg-slate-200 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded">FULL</div><div className="flex gap-4"><div className="w-16 h-16 rounded-2xl bg-slate-50 flex-shrink-0 overflow-hidden">{job.imgUrls && job.imgUrls.length > 0 ? (<img src={job.imgUrls[0]} className="w-full h-full object-cover opacity-50" />) : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon /></div>}</div><div className="flex-1"><h3 className="text-lg font-black text-slate-600 leading-tight mb-1">{job.title}</h3><p className="text-slate-400 text-xs">{job.companyName}</p></div></div></div>))}</div>
            </div>
        </div>
    );
};

const AdminJobDetailView = ({ job, students, apps, onApprove, onReject, onBack, onEdit }: any) => {
    const jobApps = apps.filter((a: any) => a.jobId === job.id);
    const approvedCount = jobApps.filter((a: any) => a.status === 'approved').length;
    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-32 bg-[#F0F9FF]">
            <div className="flex justify-between items-center mb-6"><button onClick={onBack} className="flex items-center text-slate-400 font-bold"><ChevronLeft className="w-5 h-5 mr-1" /> 返回 (Dashboard)</button><button onClick={() => onEdit(job)} className="text-sky-500 font-bold">编辑 (Edit)</button></div>
            <div className="bg-white p-6 rounded-[32px] shadow-lg mb-8">
                 <div className="flex justify-between items-start mb-4"><div><h1 className="text-2xl font-black text-slate-900 mb-1">{job.title}</h1><p className="text-slate-400">{job.companyName}</p></div><div className="text-right"><span className="text-3xl font-black text-slate-800">{approvedCount}/{job.capacity}</span><p className="text-xs font-bold text-slate-400 uppercase">已招募 (Filled)</p></div></div>
                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4"><div className="h-full bg-sky-400 transition-all duration-500" style={{ width: `${(approvedCount / job.capacity) * 100}%` }}></div></div>
            </div>
            <h2 className="text-lg font-black text-slate-800 mb-4 px-2">申请人列表 (Applicants)</h2>
            <div className="space-y-4">
                {jobApps.length === 0 ? (<div className="text-center py-10 text-slate-400">暂无申请 (No Applicants)</div>) : jobApps.map((app: any) => {
                    const student = students.find((s: any) => s.id === app.userId);
                    if (!student) return null;
                    return (
                        <div key={app.id} className="bg-white p-4 rounded-[24px] border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center font-bold text-sky-600">{student.name.charAt(0)}</div><div><p className="font-bold text-slate-800">{student.name}</p><p className="text-xs text-slate-400">{student.programYear} • Score: {student.score}</p></div></div>
                            {app.status === 'pending' ? (
                                <div className="flex gap-2"><button onClick={() => onReject(app.id)} className="p-2 rounded-full bg-rose-50 text-rose-500"><X className="w-4 h-4" /></button><button onClick={() => onApprove(app.id)} className="p-2 rounded-full bg-emerald-50 text-emerald-500"><Check className="w-4 h-4" /></button></div>
                            ) : (<span className={`text-xs font-bold px-2 py-1 rounded uppercase ${app.status === 'approved' ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>{app.status}</span>)}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const AdminPostJobView = ({ onSave, onCancel, editJob }: any) => {
    const [job, setJob] = useState(editJob || { title: '', companyName: '', location: '', description: '', programYear: '2025', salary: '', housing: 'Provided', housingCost: '', startDateRange: '', endDate: 'Sept 15, 2025', capacity: 5, minScore: 6.0, imgUrls: [], seqNo: 0 });
    const handleImageUpload = (e: any) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev: any) => { setJob({ ...job, imgUrls: [...(job.imgUrls || []), ev.target.result] }); };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    const removeImage = (index: number) => { setJob({...job, imgUrls: job.imgUrls.filter((_, i) => i !== index)}); };
    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-32 bg-[#F0F9FF]">
            <h1 className="text-2xl font-black text-slate-900 mb-6">发布新职位 / 编辑职位</h1>
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-[32px] space-y-4 shadow-sm">
                    <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">编号 (Seq No.)</label><input type="number" className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-800" value={job.seqNo} onChange={e => setJob({...job, seqNo: Number(e.target.value)})}/></div>
                     <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">职位名称 (Title)</label><input className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-800" value={job.title} onChange={e => setJob({...job, title: e.target.value})}/></div>
                     <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">公司名称 (Company)</label><input className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-800" value={job.companyName} onChange={e => setJob({...job, companyName: e.target.value})}/></div>
                </div>
                 <div className="bg-white p-6 rounded-[32px] shadow-sm">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-4 block">职位图片 (Gallery) {job.imgUrls?.length}/9</label>
                    <div className="grid grid-cols-3 gap-2">
                        {job.imgUrls?.map((url: string, i: number) => (<div key={i} className="aspect-square rounded-xl overflow-hidden relative group"><img src={url} className="w-full h-full object-cover" /><button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X className="w-3 h-3" /></button></div>))}
                        {(!job.imgUrls || job.imgUrls.length < 9) && (<label className="aspect-square rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 transition-colors"><Plus className="w-6 h-6 mb-1" /><span className="text-[10px] font-bold">添加 (Add)</span><input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /></label>)}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] space-y-4 shadow-sm">
                     <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">年份 (Year)</label><select className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-800" value={job.programYear} onChange={e => setJob({...job, programYear: e.target.value})}><option>2025</option><option>2026</option></select></div>
                        <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">最低分 (Score)</label><input type="number" step="0.5" className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-800" value={job.minScore} onChange={e => setJob({...job, minScore: Number(e.target.value)})}/></div>
                     </div>
                     <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">地点 (Location)</label><input className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-800" value={job.location} onChange={e => setJob({...job, location: e.target.value})}/></div>
                     <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">薪资 (Salary)</label><input className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-800" value={job.salary} onChange={e => setJob({...job, salary: e.target.value})}/></div>
                     <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">住宿 (Housing)</label><select className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-800" value={job.housing} onChange={e => setJob({...job, housing: e.target.value})}><option value="Provided">提供 (Provided)</option><option value="Assistance">协助 (Assistance)</option><option value="None">无 (None)</option></select></div>
                        <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">费用 (Cost)</label><input className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-800" value={job.housingCost} onChange={e => setJob({...job, housingCost: e.target.value})}/></div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">人数 (Capacity)</label><input type="number" className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-800" value={job.capacity} onChange={e => setJob({...job, capacity: Number(e.target.value)})}/></div>
                         <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">开始 (Start)</label><input className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-800" value={job.startDateRange} onChange={e => setJob({...job, startDateRange: e.target.value})}/></div>
                     </div>
                     <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">职位描述 (Description)</label><textarea className="w-full bg-slate-50 p-4 rounded-xl font-bold text-slate-800 h-40 focus:outline-none focus:ring-2 focus:ring-sky-200" value={job.description} onChange={e => setJob({...job, description: e.target.value})} /></div>
                </div>
                <div className="flex gap-4"><Button onClick={onCancel} variant="ghost" className="flex-1">取消</Button><Button onClick={() => onSave(job)} className="flex-1">立即发布 (Publish)</Button></div>
            </div>
        </div>
    );
};

const AdminStudentsView = ({ students, onSelectStudent, apps, jobs }: any) => {
    const [search, setSearch] = useState('');
    const [yearFilter, setYearFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All'); 

    const filtered = students.filter((s: any) => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || String(s.seqNo).includes(search);
        const matchesYear = yearFilter === 'All' || s.programYear === yearFilter;
        
        const studentApps = apps.filter((a: any) => a.userId === s.id);
        const hasApproved = studentApps.some((a: any) => a.status === 'approved');
        const matchesStatus = statusFilter === 'All' || (statusFilter === 'Matched' ? hasApproved : !hasApproved);

        return matchesSearch && matchesYear && matchesStatus;
    }).sort((a: any, b: any) => (a.seqNo || 0) - (b.seqNo || 0));

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-32 bg-[#F0F9FF]">
            <h1 className="text-3xl font-black text-slate-900 mb-6">Student Registry</h1>
            <div className="space-y-4 mb-6">
                <div className="relative"><Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" /><input className="w-full bg-white pl-12 pr-4 py-3 rounded-2xl shadow-sm border border-slate-100 focus:outline-none font-bold text-slate-700" placeholder="Search Name or ID..." value={search} onChange={e => setSearch(e.target.value)}/></div>
                <div className="flex gap-2">
                    <select className="flex-1 bg-white p-3 rounded-xl font-bold text-slate-600 border border-slate-100 outline-none" value={yearFilter} onChange={e => setYearFilter(e.target.value)}><option value="All">All Years</option><option value="2025">2025</option><option value="2026">2026</option></select>
                    <select className="flex-1 bg-white p-3 rounded-xl font-bold text-slate-600 border border-slate-100 outline-none" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="All">All Status</option><option value="Matched">Matched</option><option value="Unmatched">Unmatched</option></select>
                </div>
            </div>
            <div className="space-y-3">
                {filtered.map((s: any) => {
                     const studentApps = apps.filter((a: any) => a.userId === s.id && a.status === 'approved');
                     const matchedJob = studentApps.length > 0 ? jobs.find((j: any) => j.id === studentApps[0].jobId) : null;
                     return (
                        <div key={s.id} onClick={() => onSelectStudent(s)} className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 active:scale-[0.98] flex items-center gap-4 relative">
                            <div className="absolute top-4 right-4 text-[10px] font-bold text-slate-300">#{String(s.seqNo).padStart(2,'0')}</div>
                            <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center font-bold text-sky-600 text-lg">{s.name.charAt(0)}</div>
                            <div className="flex-1"><h3 className="font-bold text-slate-800">{s.name}</h3><p className="text-xs text-slate-400">{s.school}</p></div>
                            <div className="text-right">
                                <span className="text-lg font-black text-slate-800">{s.score}</span>
                                {matchedJob && <div className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded mt-1 max-w-[100px] truncate">Matched: {matchedJob.title}</div>}
                            </div>
                        </div>
                     );
                })}
            </div>
        </div>
    );
};

const AdminStudentDetailView = ({ student, onUpdate, onBack }: any) => {
    const [score, setScore] = useState(student.score);
    const [seqNo, setSeqNo] = useState(student.seqNo || 0);
    const handleUpdate = () => onUpdate({ ...student, score: Number(score), seqNo: Number(seqNo) });
    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-32 bg-[#F0F9FF]">
            <button onClick={onBack} className="mb-6 flex items-center text-slate-400 font-bold"><ChevronLeft className="w-5 h-5 mr-1" /> Back</button>
            <div className="bg-white p-6 rounded-[32px] shadow-lg mb-6 text-center">
                <div className="w-24 h-24 mx-auto bg-sky-100 rounded-full flex items-center justify-center text-4xl font-black text-sky-600 mb-4">{student.name.charAt(0)}</div>
                <h1 className="text-2xl font-black text-slate-900">{student.name}</h1>
                <p className="text-slate-500 font-bold">{student.school}</p>
                <div className="flex justify-center gap-4 mt-6">
                    <div className="bg-slate-50 px-4 py-2 rounded-xl"><p className="text-xs text-slate-400 uppercase font-bold">电话 (Phone)</p><p className="font-bold text-slate-800">{student.phone}</p></div>
                    <div className="bg-slate-50 px-4 py-2 rounded-xl"><p className="text-xs text-slate-400 uppercase font-bold">年份 (Year)</p><p className="font-bold text-slate-800">{student.programYear}</p></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-[32px] shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">管理员操作 (Admin Actions)</h3>
                <div className="space-y-4">
                     <div><label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">分数 (Score)</label><input type="number" step="0.5" className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-800" value={score} onChange={e => setScore(e.target.value)}/></div>
                     <div><label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">编号 (Seq No)</label><input type="number" className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-800" value={seqNo} onChange={e => setSeqNo(e.target.value)}/></div>
                    <Button onClick={handleUpdate} className="w-full">更新学生信息 (Update Student)</Button>
                </div>
            </div>
        </div>
    );
};

const AdminApplicationsView = ({ apps, students, jobs, onApprove, onReject, onGoToStudent }: any) => {
    const [filter, setFilter] = useState<'pending'|'history'>('pending');
    const filteredApps = apps.filter((a: any) => filter === 'pending' ? a.status === 'pending' : a.status !== 'pending').sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-32 bg-[#F0F9FF]">
            <h1 className="text-3xl font-black text-slate-900 mb-6">Applications</h1>
            <div className="flex bg-white p-1 rounded-full mb-6 shadow-sm border border-slate-50"><button onClick={() => setFilter('pending')} className={`flex-1 py-2 rounded-full font-bold text-sm transition-all ${filter === 'pending' ? 'bg-slate-900 text-white shadow' : 'text-slate-400'}`}>Pending ({apps.filter((a:any)=>a.status==='pending').length})</button><button onClick={() => setFilter('history')} className={`flex-1 py-2 rounded-full font-bold text-sm transition-all ${filter === 'history' ? 'bg-slate-900 text-white shadow' : 'text-slate-400'}`}>History</button></div>
            <div className="space-y-4">
                {filteredApps.map((app: any) => {
                    const student = students.find((s: any) => s.id === app.userId);
                    const job = jobs.find((j: any) => j.id === app.jobId);
                    if (!student || !job) return null;
                    return (
                        <div key={app.id} className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100">
                             <div className="flex justify-between mb-2">
                                <div onClick={() => onGoToStudent(student)} className="flex items-center gap-2 cursor-pointer"><div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center font-bold text-sky-600 text-xs">{student.name.charAt(0)}</div><span className="font-bold text-slate-800">{student.name}</span></div>
                                <span className="text-xs font-bold text-slate-400">{app.date}</span>
                             </div>
                             <div className="pl-10 mb-4"><p className="text-sm text-slate-500 font-medium">Applied for <span className="text-sky-500 font-bold">{job.title}</span></p></div>
                             {app.status === 'pending' ? (
                                 <div className="flex gap-2 pl-10">
                                     <button onClick={() => onReject(app.id)} className="flex-1 bg-rose-50 text-rose-500 py-2 rounded-xl font-bold text-sm hover:bg-rose-100">Reject</button>
                                     <button onClick={() => onApprove(app.id)} className="flex-1 bg-emerald-50 text-emerald-500 py-2 rounded-xl font-bold text-sm hover:bg-emerald-100 shadow-sm">Approve</button>
                                 </div>
                             ) : (<div className="pl-10"><span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${app.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{app.status}</span></div>)}
                        </div>
                    );
                })}
                {filteredApps.length === 0 && <div className="text-center py-10 text-slate-300 font-bold">No applications found.</div>}
            </div>
        </div>
    );
};

const AdminGuidesView = ({ guides, onBack, onDelete, onCreate }: any) => {
    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-32 bg-[#F0F9FF]">
            <div className="flex justify-between items-center mb-6"><button onClick={onBack} className="flex items-center text-slate-400 font-bold"><ChevronLeft className="w-5 h-5 mr-1" /> Back</button><Button onClick={onCreate} className="px-4 py-2 text-sm">New Guide</Button></div>
            <h1 className="text-3xl font-black text-slate-900 mb-6">Manage Guides</h1>
            <div className="space-y-4">
                {guides.map((g: any) => (
                    <div key={g.id} className="bg-white p-4 rounded-[24px] border border-slate-50 shadow-sm flex justify-between items-center">
                        <div className="flex items-center gap-4"><div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 overflow-hidden">{g.imgUrl ? <img src={g.imgUrl} className="w-full h-full object-cover"/> : <BookOpen className="w-6 h-6" />}</div><div><h3 className="font-bold text-slate-800">{g.title}</h3><p className="text-xs text-slate-400">{g.category}</p></div></div>
                        <button onClick={() => onDelete(g.id)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-full"><Trash2 className="w-5 h-5" /></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdminPostGuideView = ({ onSave, onCancel }: any) => {
    const [guide, setGuide] = useState({ title: '', content: '', category: 'General', imgUrl: '' });
    const handleImage = (e: any) => {
         if (e.target.files?.[0]) {
             const reader = new FileReader();
             reader.onload = (ev: any) => setGuide({...guide, imgUrl: ev.target.result});
             reader.readAsDataURL(e.target.files[0]);
         }
    };
    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-32 bg-[#F0F9FF]">
            <h1 className="text-2xl font-black text-slate-900 mb-6">New Guide</h1>
            <div className="bg-white p-6 rounded-[32px] shadow-lg space-y-4">
                <input className="w-full bg-slate-50 p-3 rounded-xl font-bold" placeholder="Title" value={guide.title} onChange={e => setGuide({...guide, title: e.target.value})}/>
                <input className="w-full bg-slate-50 p-3 rounded-xl font-bold" placeholder="Category" value={guide.category} onChange={e => setGuide({...guide, category: e.target.value})}/>
                <div className="h-32 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden">
                    {guide.imgUrl ? <img src={guide.imgUrl} className="w-full h-full object-cover" /> : <div className="text-center text-slate-400"><p className="font-bold text-xs">Cover Image</p></div>}
                    <input type="file" className="absolute inset-0 opacity-0" onChange={handleImage} />
                </div>
                <textarea className="w-full bg-slate-50 p-4 rounded-xl font-mono text-sm h-64 focus:outline-none" placeholder="# Markdown Content..." value={guide.content} onChange={e => setGuide({...guide, content: e.target.value})} />
                <div className="flex gap-4"><Button onClick={onCancel} variant="ghost" className="flex-1">Cancel</Button><Button onClick={() => onSave(guide)} className="flex-1">Save</Button></div>
            </div>
        </div>
    );
};

// --- Main App ---

const App = () => {
  const [view, setView] = useState('login');
  const [user, setUser] = useState<UserData | null>(null);
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [apps, setApps] = useState(INITIAL_APPS);
  const [students, setStudents] = useState(INITIAL_USERS.filter(u => u.role === 'student'));
  const [guides, setGuides] = useState(INITIAL_GUIDES);
  
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedGuide, setSelectedGuide] = useState<any>(null);

  const handleLogin = (role: Role) => {
    const u = INITIAL_USERS.find(u => u.role === role);
    if (u) { setUser(u); setView(role === 'student' ? 'student-jobs' : 'admin-dash'); }
  };

  const handleRegister = (data: any) => {
      const newUser: UserData = { id: `u${Date.now()}`, seqNo: students.length + 1, role: 'student', emergencyContacts: [], ...data, score: Number(data.score) };
      setStudents([...students, newUser]);
      setUser(newUser);
      setView('student-jobs');
  };

  const handleApply = (jobId: string) => {
      if (!user) return;
      const newApp: Application = { id: `a${Date.now()}`, userId: user.id, jobId, status: 'pending', date: new Date().toLocaleDateString() };
      setApps([...apps, newApp]);
      setView('student-internship');
  };

  const handleWithdraw = (appId: string) => {
      setApps(apps.filter(a => a.id !== appId));
  };

  const updateAppStatus = (appId: string, status: AppStatus) => {
      setApps(apps.map(a => a.id === appId ? { ...a, status } : a));
  };

  const handleSaveJob = (jobData: any) => {
      if (jobData.id) {
          setJobs(jobs.map(j => j.id === jobData.id ? jobData : j));
      } else {
          setJobs([...jobs, { ...jobData, id: `j${Date.now()}` }]);
      }
      setView('admin-dash');
      setSelectedJob(null);
  };

  // Nav Bar
  const Nav = ({ role, active }: any) => (
      <div className="absolute bottom-0 w-full bg-white border-t border-slate-100 flex justify-around items-center h-20 px-2 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
          {role === 'student' ? (
              <>
                <button onClick={() => setView('student-jobs')} className={`flex flex-col items-center gap-1 ${active==='student-jobs' ? 'text-sky-500' : 'text-slate-300'}`}><Home className={`w-6 h-6 ${active==='student-jobs' && 'fill-current'}`} /><span className="text-[10px] font-bold">职 位</span></button>
                <button onClick={() => setView('student-internship')} className={`flex flex-col items-center gap-1 ${active==='student-internship' ? 'text-sky-500' : 'text-slate-300'}`}><Briefcase className={`w-6 h-6 ${active==='student-internship' && 'fill-current'}`} /><span className="text-[10px] font-bold">实 习</span></button>
                <button onClick={() => setView('student-services')} className={`flex flex-col items-center gap-1 ${active==='student-services' ? 'text-sky-500' : 'text-slate-300'}`}><LayoutGrid className={`w-6 h-6 ${active==='student-services' && 'fill-current'}`} /><span className="text-[10px] font-bold">服 务</span></button>
                <button onClick={() => setView('student-profile')} className={`flex flex-col items-center gap-1 ${active==='student-profile' ? 'text-sky-500' : 'text-slate-300'}`}><User className={`w-6 h-6 ${active==='student-profile' && 'fill-current'}`} /><span className="text-[10px] font-bold">我 的</span></button>
              </>
          ) : (
              <>
                <button onClick={() => setView('admin-dash')} className={`relative flex flex-col items-center gap-1 ${active==='admin-dash' ? 'text-slate-900' : 'text-slate-300'}`}><LayoutGrid className="w-6 h-6" /><span className="text-[10px] font-bold">Dash</span></button>
                <button onClick={() => setView('admin-apps')} className={`relative flex flex-col items-center gap-1 ${active==='admin-apps' ? 'text-slate-900' : 'text-slate-300'}`}>
                    <div className="relative"><Inbox className="w-6 h-6" />{apps.filter(a=>a.status==='pending').length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white"></span>}</div><span className="text-[10px] font-bold">Review</span>
                </button>
                <button onClick={() => { setSelectedJob(null); setView('admin-post-job'); }} className="mb-8 w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-xl shadow-slate-300 active:scale-95 transition-transform"><Plus className="w-7 h-7" /></button>
                <button onClick={() => setView('admin-students')} className={`flex flex-col items-center gap-1 ${active==='admin-students' ? 'text-slate-900' : 'text-slate-300'}`}><Users className="w-6 h-6" /><span className="text-[10px] font-bold">Students</span></button>
              </>
          )}
      </div>
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-[#F0F9FF] overflow-hidden font-sans text-slate-900">
      {view === 'login' && <LoginView onLogin={handleLogin} onRegister={() => setView('register')} />}
      {view === 'register' && <RegisterView onRegister={handleRegister} onCancel={() => setView('login')} />}
      
      {/* Student Views */}
      {view === 'student-jobs' && user && <><StudentJobsView jobs={jobs} user={user} myApps={apps.filter(a => a.userId === user.id)} onApply={(j:any) => { setSelectedJob(j); setView('student-job-detail'); }} /><Nav role="student" active="student-jobs" /></>}
      {view === 'student-job-detail' && selectedJob && user && <StudentJobDetail job={selectedJob} user={user} hasActiveApp={apps.some(a => a.userId === user.id && (a.status === 'pending' || a.status === 'approved'))} isFull={apps.filter(a => a.jobId === selectedJob.id && a.status === 'approved').length >= selectedJob.capacity} onBack={() => setView('student-jobs')} onApplyConfirm={(jid: string) => handleApply(jid)} />}
      {view === 'student-internship' && user && <><StudentInternshipView user={user} apps={apps} jobs={jobs} onWithdraw={handleWithdraw} /><Nav role="student" active="student-internship" /></>}
      {view === 'student-services' && <><StudentServicesView user={user} onEmergency={() => setView('student-emergency')} guides={guides} onSelectGuide={(g:any) => {setSelectedGuide(g); setView('student-guide-read');}} /><Nav role="student" active="student-services" /></>}
      {view === 'student-emergency' && <StudentEmergencyView user={user} onBack={() => setView('student-services')} onUpdateUser={(u:any) => {setUser(u); setStudents(students.map(s => s.id === u.id ? u : s))}} />}
      {view === 'student-guide-read' && selectedGuide && <div className="flex-1 bg-white flex flex-col"><div className="p-4 border-b flex items-center gap-2"><button onClick={() => setView('student-services')}><ChevronLeft /></button><h2 className="font-bold">{selectedGuide.title}</h2></div><div className="p-6 overflow-y-auto prose"><ReactMarkdown>{selectedGuide.content}</ReactMarkdown></div></div>}
      {view === 'student-profile' && user && <><StudentProfileView user={user} onLogout={() => setView('login')} onEdit={() => setView('student-profile-edit')} /><Nav role="student" active="student-profile" /></>}
      {view === 'student-profile-edit' && user && <StudentProfileView user={user} isEditing={true} onEdit={() => setView('student-profile')} onSaveProfile={(data:any) => { const updated = {...user, ...data}; setUser(updated); setStudents(students.map(s => s.id === updated.id ? updated : s)); setView('student-profile'); }} />}

      {/* Admin Views */}
      {view === 'admin-dash' && <><AdminDashView jobs={jobs} students={students} apps={apps} onSelectJob={(j:any) => { setSelectedJob(j); setView('admin-job-detail'); }} onGoToGuides={() => setView('admin-guides')} /><Nav role="admin" active="admin-dash" /></>}
      {view === 'admin-job-detail' && selectedJob && <AdminJobDetailView job={selectedJob} students={students} apps={apps} onBack={() => setView('admin-dash')} onEdit={(j:any) => { setView('admin-post-job'); }} onApprove={(aid:string) => updateAppStatus(aid, 'approved')} onReject={(aid:string) => updateAppStatus(aid, 'rejected')} />}
      {view === 'admin-post-job' && <AdminPostJobView onSave={handleSaveJob} onCancel={() => setView('admin-dash')} editJob={selectedJob} />}
      {view === 'admin-students' && <><AdminStudentsView students={students} apps={apps} jobs={jobs} onSelectStudent={(s:any) => { setSelectedStudent(s); setView('admin-student-detail'); }} /><Nav role="admin" active="admin-students" /></>}
      {view === 'admin-student-detail' && selectedStudent && <AdminStudentDetailView student={selectedStudent} onBack={() => setView('admin-students')} onUpdate={(u:any) => { setStudents(students.map(s => s.id === u.id ? u : s)); setSelectedStudent(u); }} />}
      {view === 'admin-apps' && <><AdminApplicationsView apps={apps} students={students} jobs={jobs} onApprove={(id:string) => updateAppStatus(id, 'approved')} onReject={(id:string) => updateAppStatus(id, 'rejected')} onGoToStudent={(s:any) => { setSelectedStudent(s); setView('admin-student-detail'); }} /><Nav role="admin" active="admin-apps" /></>}
      {view === 'admin-guides' && <AdminGuidesView guides={guides} onBack={() => setView('admin-dash')} onCreate={() => setView('admin-post-guide')} onDelete={(id:string) => setGuides(guides.filter(g => g.id !== id))} />}
      {view === 'admin-post-guide' && <AdminPostGuideView onCancel={() => setView('admin-guides')} onSave={(g:any) => { setGuides([...guides, { ...g, id: `g${Date.now()}` }]); setView('admin-guides'); }} />}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
