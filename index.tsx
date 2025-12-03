
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  User, Briefcase, FileText, ShieldAlert, LogOut, 
  Search, Plus, ChevronRight, X, Check, Star, 
  Loader2, BarChart3, Users, BookOpen, Send, ChevronLeft, MapPin, Home,
  Phone, Mail, Globe, AlertCircle, Trash2, MoreHorizontal, LayoutGrid,
  ArrowRight, Heart, Sparkles, Cloud, Image as ImageIcon, Upload, Camera,
  Clock, XCircle, CheckCircle2, Ban, Hash, Edit3, Lock
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
    description: 'Operate rides and games, ensuring guest safety and enjoyment in a fast-paced environment.',
    programYear: '2025',
    housing: 'Dorm Style',
    housingCost: '$100/wk',
    salary: '$15.50/hr',
    startDateRange: 'Jun 1 - Jun 20',
    endDate: 'Sept 10, 2025',
    capacity: 20,
    minScore: 6.5,
    tags: ['Theme Park', 'Outdoors'],
    imgUrls: ['https://images.unsplash.com/photo-1513883049090-d0b7439799bf?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'j4',
    seqNo: 4,
    title: 'Housekeeping Staff',
    location: 'Gatlinburg, TN',
    companyName: 'Smoky Mountain Lodge',
    description: 'Maintain cleanliness of guest rooms and public areas. Detail-oriented and reliable staff needed.',
    programYear: '2025',
    housing: 'Provided',
    housingCost: '$130/wk',
    salary: '$17.00/hr',
    startDateRange: 'Jun 10 - Jun 25',
    endDate: 'Sept 30, 2025',
    capacity: 8,
    minScore: 6.0,
    tags: ['Hospitality', 'Indoor'],
    imgUrls: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'j5',
    seqNo: 5,
    title: 'Retail Sales Associate',
    location: 'Ocean City, MD',
    companyName: 'Sun & Surf Shop',
    description: 'Assist customers with merchandise, operate cash register, and keep the store organized.',
    programYear: '2025',
    housing: 'Self-Arranged',
    housingCost: 'N/A',
    salary: '$15.00/hr',
    startDateRange: 'May 25 - Jun 15',
    endDate: 'Sept 5, 2025',
    capacity: 4,
    minScore: 7.5,
    tags: ['Sales', 'Beach'],
    imgUrls: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'j6',
    seqNo: 6,
    title: 'National Park Server',
    location: 'Yellowstone, WY',
    companyName: 'Yellowstone Dining',
    description: 'Serve meals to park visitors in a high-volume dining hall. Great opportunity to see nature.',
    programYear: '2025',
    housing: 'Dormitory',
    housingCost: '$80/wk',
    salary: '$14.00/hr + Tips',
    startDateRange: 'May 15 - Jun 5',
    endDate: 'Oct 1, 2025',
    capacity: 15,
    minScore: 8.0,
    tags: ['Nature', 'Server'],
    imgUrls: ['https://images.unsplash.com/photo-1551632436-cbf8dd354ca8?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'j7',
    seqNo: 7,
    title: 'Ice Cream Scooper',
    location: 'Cape Cod, MA',
    companyName: 'Seaside Scoops',
    description: 'Scoop ice cream and make sundaes for happy vacationers. Must be friendly and energetic!',
    programYear: '2025',
    housing: 'Shared House',
    housingCost: '$160/wk',
    salary: '$16.50/hr',
    startDateRange: 'Jun 20 - Jul 1',
    endDate: 'Sept 1, 2025',
    capacity: 3,
    minScore: 6.5,
    tags: ['Food', 'Fun'],
    imgUrls: ['https://images.unsplash.com/photo-1560008581-09826d1de69e?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'j8',
    seqNo: 8,
    title: 'Camp Counselor',
    location: 'Asheville, NC',
    companyName: 'Mountain Kids Camp',
    description: 'Lead activities and supervise children in an outdoor camp setting. Experience with kids required.',
    programYear: '2025',
    housing: 'Cabin Provided',
    housingCost: 'Free',
    salary: '$3000/season',
    startDateRange: 'Jun 1 - Jun 5',
    endDate: 'Aug 15, 2025',
    capacity: 6,
    minScore: 8.5,
    tags: ['Kids', 'Outdoor'],
    imgUrls: ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80']
  }
];

const INITIAL_APPS: Application[] = [];

const INITIAL_GUIDES: Guide[] = [
  { id: 'g1', title: 'Visa Interview ✨', content: '## Interview Tips\nBe honest and confident. Smile!' },
  { id: 'g2', title: 'Packing List 🧳', content: '## Essentials\n- Passport\n- DS-2019\n- Adaptors' },
  { id: 'g3', title: 'Insurance 🏥', content: '## Coverage\nIncludes emergency medical.' }
];

// --- Components ---

const Button = ({ onClick, children, variant = 'primary', className = '', disabled = false }: any) => {
  const base = "px-6 py-4 rounded-full font-bold text-[16px] transition-all active:scale-[0.95] flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-[#38BDF8] text-white disabled:bg-sky-200 shadow-lg shadow-sky-200 hover:shadow-sky-300", 
    secondary: "bg-white text-slate-600 border border-slate-100 hover:bg-sky-50",
    danger: "bg-red-50 text-red-400 hover:bg-red-100",
    outline: "border-2 border-sky-200 text-sky-400 bg-transparent hover:bg-sky-50"
  };
  return (
    <button onClick={onClick} className={`${base} ${styles[variant as keyof typeof styles]} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

const InputGroup = ({ title, children, className = '' }: any) => (
  <div className={`mb-6 ${className}`}>
    {title && <div className="px-4 mb-2 text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1"><Sparkles className="w-3 h-3" /> {title}</div>}
    <div className="bg-white overflow-hidden rounded-[24px] shadow-sm border border-sky-50/50">{children}</div>
  </div>
);

const InputCell = ({ label, className = '', readOnly = false, ...props }: any) => (
  <div className={`flex items-center px-5 py-4 bg-white border-b border-slate-50 last:border-0 relative ${className}`}>
    <label className="w-32 text-[15px] font-bold text-slate-500">{label}</label>
    <input 
      {...props} 
      readOnly={readOnly}
      className={`flex-1 text-[15px] font-bold outline-none bg-transparent placeholder-sky-200 text-slate-700 text-right ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
    />
    {readOnly && <Lock className="w-4 h-4 text-slate-300 ml-2" />}
  </div>
);

// Navigation Layout
const Layout = ({ children, nav, title, backAction, rightAction, bgClass = "bg-[#F0F9FF]" }: any) => (
  <div className={`flex flex-col h-[100dvh] ${bgClass} relative font-sans text-slate-700 overflow-hidden`}>
    {/* Navigation Bar */}
    <div className={`h-[70px] flex items-center justify-between px-6 sticky top-0 z-50 shrink-0 ${bgClass} transition-colors`}>
       <div className="w-[60px] flex items-center">
         {backAction && (
           <button onClick={backAction} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-sky-400 active:scale-90 transition-transform">
             <ChevronLeft className="w-6 h-6 stroke-[3]" />
           </button>
         )}
       </div>
       <div className="font-black text-xl tracking-tight text-slate-700 truncate">{title || ''}</div>
       <div className="w-[60px] flex justify-end items-center gap-2">
          {rightAction}
       </div>
    </div>

    {/* Content Area */}
    <div className="flex-1 overflow-y-auto scrollbar-hide pb-[120px] relative">
      {children}
    </div>

    {/* Bottom Tab Bar */}
    {nav && (
      <nav className="absolute bottom-6 left-6 right-6 mx-auto bg-white/95 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex justify-between items-center px-6 py-4 z-40 border border-white/50">
        {nav}
      </nav>
    )}
  </div>
);

// --- Sub-Views ---

const StudentRegisterView = ({ setUsers, users, setCurrentUser, setCurrentView }: any) => {
  const [regForm, setRegForm] = useState({ name: '', school: '', phone: '', code: '', programYear: '2025', score: '6.0' });

  const handleRegister = () => {
    if (!regForm.name || !regForm.phone || !regForm.school) {
       alert("Please fill all required fields, especially School Name.");
       return;
    }
    const newUser: UserData = {
      id: `u${Date.now()}`,
      seqNo: users.length + 1, // Default seqNo
      name: regForm.name,
      role: 'student',
      score: parseFloat(regForm.score) || 6.0, 
      school: regForm.school,
      phone: regForm.phone,
      programYear: regForm.programYear
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setCurrentView('student-jobs');
  };

  return (
    <div className="min-h-screen bg-[#F0F9FF] flex flex-col relative overflow-hidden">
       {/* Decorative Shapes */}
       <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#BAE6FD] rounded-full opacity-40 blur-3xl animate-pulse" />
       <div className="absolute bottom-[10%] left-[-5%] w-[200px] h-[200px] bg-[#FEF08A] rounded-full opacity-50 blur-3xl" />

       <div className="flex-1 px-8 pt-12 pb-10 flex flex-col z-10 overflow-y-auto">
          <button onClick={() => setCurrentView('login')} className="self-start w-10 h-10 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm text-sky-400">
             <ChevronLeft className="w-6 h-6 stroke-[3]" />
          </button>
          
          <h1 className="text-4xl font-black text-slate-700 mb-2 tracking-tight">Blueprint<br/><span className="text-sky-400">Global</span></h1>
          <p className="text-slate-400 font-bold mb-8">Create your student account.</p>

          <div className="bg-white/60 backdrop-blur-xl rounded-[40px] p-6 shadow-sm border border-white">
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl px-5 py-4 flex items-center border border-sky-50 shadow-sm focus-within:border-sky-300 transition-colors">
                       <input className="bg-transparent flex-1 outline-none text-slate-700 font-bold placeholder-sky-200" placeholder="Full Name" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} />
                    </div>
                    <div className="bg-white rounded-2xl px-5 py-4 flex items-center border border-sky-50 shadow-sm focus-within:border-sky-300 transition-colors relative">
                       <input className="bg-transparent flex-1 outline-none text-slate-700 font-bold placeholder-sky-200" placeholder="School Name (Required)" value={regForm.school} onChange={e => setRegForm({...regForm, school: e.target.value})} />
                       {!regForm.school && <span className="absolute right-4 text-xs font-black text-rose-400">*</span>}
                    </div>
                    <div className="bg-white rounded-2xl px-5 py-4 flex items-center border border-sky-50 shadow-sm focus-within:border-sky-300 transition-colors">
                          <input className="bg-transparent w-full outline-none text-slate-700 font-bold placeholder-sky-200" placeholder="Phone Number" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} />
                    </div>
                    <div className="bg-white rounded-2xl px-5 py-4 flex items-center border border-sky-50 shadow-sm gap-3">
                       <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center text-xs font-bold shrink-0">i</div>
                       <input className="bg-transparent flex-1 outline-none text-slate-700 font-bold placeholder-sky-200" placeholder="Auth Code (1234)" value={regForm.code} onChange={e => setRegForm({...regForm, code: e.target.value})} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-2xl px-5 py-4 border border-sky-50 shadow-sm">
                         <label className="block text-[10px] font-black uppercase text-sky-300 mb-1">SCORE</label>
                         <input className="bg-transparent w-full outline-none text-slate-700 font-black text-xl placeholder-sky-100" placeholder="6.0" type="number" step="0.5" value={regForm.score} onChange={e => setRegForm({...regForm, score: e.target.value})} />
                      </div>
                      <div className="bg-white rounded-2xl px-5 py-4 border border-sky-50 shadow-sm">
                         <label className="block text-[10px] font-black uppercase text-sky-300 mb-1">YEAR</label>
                         <input className="bg-transparent w-full outline-none text-slate-700 font-black text-xl placeholder-sky-100" placeholder="2025" value={regForm.programYear} onChange={e => setRegForm({...regForm, programYear: e.target.value})} />
                      </div>
                    </div>
                </div>

                <div className="mt-8">
                  <Button className="w-full shadow-sky-300" onClick={handleRegister}>
                    Start Journey <Cloud className="w-5 h-5 ml-1 fill-white" />
                  </Button>
                </div>
          </div>
          
          <div className="mt-12 text-center space-y-1 opacity-60">
             <div className="text-sm font-black text-slate-400">Blueprint Global Exchange</div>
             <div className="text-xs font-bold text-slate-300">蓝途启航 · 赴美带薪实习</div>
          </div>
       </div>
    </div>
  );
};

const StudentJobsView = ({ jobs, currentUser, setCurrentView, nav }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter then Sort by Manual Sequence Number
  const filteredJobs = jobs.filter((j: Job) => 
    j.programYear === currentUser.programYear &&
    (j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     j.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     j.location.toLowerCase().includes(searchQuery.toLowerCase()))
  ).sort((a: Job, b: Job) => (a.seqNo || 9999) - (b.seqNo || 9999));

  return (
    <Layout nav={nav} title="Job Board" rightAction={<div className="bg-[#FEF9C3] px-3 py-1.5 rounded-full text-xs font-black text-yellow-700 shadow-sm">⭐ {currentUser.score.toFixed(1)}</div>}>
      {/* Search Bar */}
      <div className="px-6 py-4 sticky top-0 z-30 bg-[#F0F9FF]/95 backdrop-blur-sm">
         <div className="bg-white rounded-full flex items-center px-6 py-4 shadow-sm border border-sky-50">
            <Search className="w-5 h-5 text-sky-200 mr-3" strokeWidth={3} />
            <input 
              type="text" 
              placeholder="Search jobs, states..." 
              className="flex-1 text-sm font-bold outline-none placeholder-sky-200 text-slate-700" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>
      </div>

      <div className="px-6 space-y-4 pb-4">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-sky-200">
               <Search className="w-10 h-10" />
            </div>
            <div className="text-sky-300 font-bold">No jobs found 🥺</div>
          </div>
        ) : filteredJobs.map((job: Job, index: number) => (
          <div key={job.id} onClick={() => setCurrentView(`job-${job.id}`)} className="bg-white rounded-[32px] p-2 flex items-stretch shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-sky-50 active:scale-[0.98] transition-transform cursor-pointer group hover:shadow-lg hover:shadow-sky-100 min-h-[120px] relative">
            
            {/* Number Badge (Manual SeqNo) */}
            <div className="absolute top-[-8px] left-[-8px] w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-black shadow-sm z-10 border-2 border-[#F0F9FF]">
              #{String(job.seqNo || index + 1).padStart(2, '0')}
            </div>

            {/* Image Logic: Show first image */}
            <div className="w-28 rounded-[24px] overflow-hidden shrink-0 relative bg-slate-100">
               {job.imgUrls && job.imgUrls.length > 0 ? (
                  <img src={job.imgUrls[0]} alt={job.title} className="w-full h-full object-cover" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-sky-200">
                     <ImageIcon className="w-8 h-8" />
                  </div>
               )}
               <div className="absolute top-0 left-0 w-full h-full bg-black/5 group-hover:bg-transparent transition-colors" />
            </div>
            
            {/* Right Content */}
            <div className="flex-1 p-3 pl-4 flex flex-col justify-between min-w-0">
               <div>
                  <h3 className="font-bold text-[17px] text-slate-700 leading-tight line-clamp-2 mb-1">{job.title}</h3>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide truncate">{job.companyName}</div>
               </div>
               
               <div className="flex gap-2 flex-wrap mt-2">
                  <span className="bg-[#E0F2FE] text-sky-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase truncate max-w-[100px]">{job.location.split(',')[0]}</span>
                  <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase">{job.salary}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

const StudentEmergencyView = ({ currentUser, setCurrentView }: any) => {
   const contacts = currentUser.emergencyContacts || [];
   return (
     <Layout title="Help & Safety" backAction={() => setCurrentView('student-services')}>
        <div className="p-4 space-y-6">
           {/* Cute Red Card - Keeping Red for Emergency, but softer */}
           <div className="bg-[#FDA4AF] rounded-[40px] p-8 text-white shadow-xl shadow-red-200 relative overflow-hidden flex flex-col justify-between h-[240px]">
              {/* Blobs */}
              <div className="absolute top-[-30px] right-[-30px] w-40 h-40 bg-white rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute bottom-[-20px] left-[10px] w-24 h-24 bg-[#BE123C] rounded-full opacity-10"></div>
              
              <div className="relative z-10 flex justify-between items-start">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <Heart className="w-7 h-7 text-white fill-white" />
                  </div>
                  <button className="bg-white/20 hover:bg-white/30 px-5 py-2 rounded-full text-xs font-bold border border-white/20">Edit Card</button>
              </div>

              <div className="relative z-10">
                 <h2 className="text-4xl font-black leading-none mb-2 tracking-tight">Don't<br/>Panic!</h2>
                 <p className="text-red-50 font-bold opacity-90">We are here for you.</p>
              </div>
           </div>

           {/* Local Emergency */}
           <section>
              <div className="flex items-center gap-2 mb-4 px-4">
                 <div className="w-2 h-2 rounded-full bg-sky-400"></div>
                 <div className="text-xs font-bold text-sky-400 uppercase tracking-widest">Local Help</div>
              </div>
              
              <div className="space-y-3">
                 <div className="bg-white p-2 pr-5 rounded-[30px] flex items-center justify-between border border-sky-50 shadow-sm">
                    <div className="flex items-center gap-4">
                       <div className="w-16 h-16 rounded-[24px] bg-[#FFF1F2] flex items-center justify-center text-rose-500 font-black text-2xl">
                         911
                       </div>
                       <div>
                          <div className="font-bold text-slate-700 text-lg">Police</div>
                          <div className="text-rose-300 text-xs font-bold uppercase">Medical / Fire</div>
                       </div>
                    </div>
                    <a href="tel:911" className="w-12 h-12 bg-rose-400 rounded-full flex items-center justify-center shadow-md shadow-rose-200 hover:scale-105 transition-transform">
                       <Phone className="w-6 h-6 text-white" />
                    </a>
                 </div>

                 <div className="bg-white p-2 pr-5 rounded-[30px] flex items-center justify-between border border-sky-50 shadow-sm">
                    <div className="flex items-center gap-4">
                       <div className="w-16 h-16 rounded-[24px] bg-[#ECFDF5] flex items-center justify-center text-emerald-500">
                         <Globe className="w-8 h-8" />
                       </div>
                       <div>
                          <div className="font-bold text-slate-700 text-lg">Consulate</div>
                          <div className="text-emerald-300 text-xs font-bold uppercase">Protection</div>
                       </div>
                    </div>
                    <a href="tel:+12024952266" className="w-12 h-12 bg-emerald-400 rounded-full flex items-center justify-center shadow-md shadow-emerald-200 hover:scale-105 transition-transform">
                       <Phone className="w-6 h-6 text-white" />
                    </a>
                 </div>
              </div>
           </section>

           {/* My Contacts */}
           <section>
              <div className="flex items-center gap-2 mb-4 px-4 mt-8">
                 <div className="w-2 h-2 rounded-full bg-sky-400"></div>
                 <div className="text-xs font-bold text-sky-400 uppercase tracking-widest">Saved Contacts</div>
              </div>
              <div className="space-y-3">
                 {contacts.map((c: any, i: number) => (
                    <div key={i} className="bg-white p-5 rounded-[30px] border border-sky-50 shadow-sm">
                       <div className="flex justify-between items-start mb-2">
                          <span className="bg-[#FEF9C3] px-3 py-1 rounded-full text-[10px] font-bold uppercase text-yellow-700">{c.type || 'Contact'}</span>
                       </div>
                       <div className="font-bold text-slate-700 text-xl mb-1">{c.name}</div>
                       <div className="text-slate-400 font-medium tracking-wide">{c.phone}</div>
                    </div>
                 ))}
                 <Button variant="outline" className="w-full border-dashed border-2 rounded-[30px] py-4 border-sky-200 text-sky-300 hover:border-sky-300 hover:text-sky-400">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Friend
                 </Button>
              </div>
           </section>
        </div>
     </Layout>
   )
}

const StudentServicesView = ({ currentUser, setCurrentUser, users, setUsers, guides, nav, setCurrentView }: any) => {
  const [showGuide, setShowGuide] = useState<Guide | null>(null);

  return (
    <Layout nav={nav} title="Services">
      <div className="p-4 space-y-6">
        
        {/* Hero Card - Cute Style Blue */}
        <div className="bg-[#38BDF8] rounded-[40px] p-8 text-white relative overflow-hidden shadow-xl shadow-sky-200">
            <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-white rounded-full opacity-20"></div>
            <div className="absolute left-[-20px] bottom-[-20px] w-24 h-24 bg-sky-800 rounded-full opacity-10"></div>
            <div className="relative z-10">
               <div className="flex justify-between items-center mb-8">
                  <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Tap in Emergency</div>
               </div>
               <h2 className="text-3xl font-black mb-4 tracking-tight">Emergency<br/>Card</h2>
               <button onClick={() => setCurrentView('student-emergency')} className="bg-white text-sky-500 px-6 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2 shadow-sm">
                  Open Now <Heart className="w-4 h-4 fill-sky-500"/>
               </button>
            </div>
        </div>

        <section>
          <div className="flex items-center gap-2 mb-4 px-4">
             <div className="w-2 h-2 rounded-full bg-sky-400"></div>
             <div className="text-xs font-bold text-sky-400 uppercase tracking-widest">Little Guides</div>
          </div>
          <div className="space-y-3">
            {guides.map((g: Guide) => (
              <div 
                key={g.id} 
                onClick={() => setShowGuide(g)} 
                className="group bg-white p-4 rounded-[28px] border border-sky-50 flex justify-between items-center active:scale-[0.98] transition-all hover:shadow-lg hover:shadow-sky-50 cursor-pointer"
              >
                <div className="flex items-center gap-4 pl-2">
                   <div className="w-12 h-12 rounded-full bg-[#EFF6FF] group-hover:bg-[#60A5FA] transition-colors flex items-center justify-center text-sky-400 group-hover:text-white">
                      <BookOpen className="w-5 h-5 stroke-[2.5]" />
                   </div>
                   <span className="text-[15px] font-bold text-slate-700">{g.title}</span>
                </div>
                <div className="pr-2">
                   <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center">
                     <ChevronRight className="w-5 h-5 text-sky-300" />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {showGuide && (
         <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setShowGuide(null)} />
            <div className="bg-[#F0F9FF] w-full max-w-md rounded-t-[40px] sm:rounded-[40px] shadow-2xl relative z-10 max-h-[85vh] flex flex-col p-2">
              <div className="flex justify-between items-center p-6 border-b border-sky-100">
                 <h3 className="font-black text-xl text-slate-700">{showGuide.title}</h3>
                 <button onClick={() => setShowGuide(null)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-sky-100 shadow-sm"><X className="w-5 h-5 text-sky-400"/></button>
              </div>
              <div className="p-8 overflow-y-auto prose prose-sky prose-lg">
                 <ReactMarkdown>{showGuide.content}</ReactMarkdown>
              </div>
            </div>
         </div>
      )}
    </Layout>
  );
};

const StudentProfileView = ({ currentUser, setCurrentUser, users, setUsers, nav, setCurrentView }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: currentUser.name, phone: currentUser.phone || '' });

  const handleSave = () => {
    const updatedUser = { ...currentUser, name: editForm.name, phone: editForm.phone };
    setCurrentUser(updatedUser);
    setUsers(users.map((u: UserData) => u.id === currentUser.id ? updatedUser : u));
    setIsEditing(false);
  };

  return (
    <Layout nav={nav} title="" bgClass="bg-[#F0F9FF]">
      {/* Soft Header Section */}
      <div className="bg-gradient-to-b from-sky-200 to-[#F0F9FF] pt-8 pb-4 rounded-b-[50px] px-6 relative overflow-visible">
          
          <div className="flex flex-col items-center gap-3 mb-4">
             <div className="w-28 h-28 rounded-full bg-white p-1 shadow-xl shadow-sky-200 relative">
                <div className="w-full h-full rounded-full bg-[#BAE6FD] flex items-center justify-center text-sky-600 text-4xl font-black">
                  {currentUser.name[0]}
                </div>
                {/* Edit Button Trigger */}
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-sky-500 hover:scale-110 transition-transform">
                      <Edit3 className="w-4 h-4" />
                  </button>
                )}
             </div>
             
             {isEditing ? (
               <div className="bg-white/80 p-4 rounded-[24px] shadow-sm w-full backdrop-blur-sm space-y-3 mt-2">
                   <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
                      <User className="w-4 h-4 text-sky-300" />
                      <input className="bg-transparent font-bold text-slate-700 outline-none w-full" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Full Name" />
                   </div>
                   <div className="flex items-center gap-2 pb-2">
                      <Phone className="w-4 h-4 text-sky-300" />
                      <input className="bg-transparent font-bold text-slate-700 outline-none w-full" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} placeholder="Phone" />
                   </div>
                   <div className="flex gap-2 pt-1">
                      <button onClick={handleSave} className="flex-1 bg-sky-400 text-white rounded-full py-2 text-xs font-bold shadow-sm">Save</button>
                      <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-100 text-slate-500 rounded-full py-2 text-xs font-bold">Cancel</button>
                   </div>
                   <div className="text-[10px] text-center text-rose-400 font-bold flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3" /> School info cannot be changed.
                   </div>
               </div>
             ) : (
               <div className="text-center">
                 <h2 className="text-2xl font-black text-slate-700 mb-1">{currentUser.name}</h2>
                 <div className="inline-block bg-white px-4 py-1.5 rounded-full text-sky-400 text-xs font-bold shadow-sm uppercase tracking-wider">
                    {currentUser.school}
                 </div>
               </div>
             )}
          </div>
      </div>

      <div className="px-6 relative z-20 -mt-2">
          <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-6 rounded-[32px] shadow-md shadow-sky-100 flex flex-col items-center justify-center h-40 gap-2">
                 <div className="w-10 h-10 bg-[#FEF9C3] rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                 </div>
                 <div className="text-3xl font-black text-slate-700">{currentUser.score.toFixed(1)}</div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-full">Score</div>
              </div>
              <div className="bg-white p-6 rounded-[32px] shadow-md shadow-sky-100 flex flex-col items-center justify-center h-40 gap-2">
                 <div className="w-10 h-10 bg-[#E0F2FE] rounded-full flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-sky-500" />
                 </div>
                 <div className="text-3xl font-black text-slate-700">{currentUser.programYear}</div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-full">Cohort</div>
              </div>
          </div>

          <div className="space-y-3">
             <button onClick={() => setCurrentView('student-internship')} className="w-full p-2 pl-4 pr-2 bg-white rounded-full flex items-center justify-between shadow-sm border border-sky-50 hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-[#F0FDFA] flex items-center justify-center"><FileText className="w-5 h-5 text-teal-500" /></div>
                   <span className="font-bold text-slate-600">My Applications</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                   <ChevronRight className="w-5 h-5 text-slate-300" />
                </div>
             </button>
             <button onClick={() => setCurrentView('login')} className="w-full p-2 pl-4 pr-2 bg-white rounded-full flex items-center justify-between shadow-sm border border-sky-50 hover:scale-[1.02] transition-transform group">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center"><LogOut className="w-5 h-5 text-rose-400" /></div>
                   <span className="font-bold text-slate-600 group-hover:text-rose-500">Sign Out</span>
                </div>
             </button>
          </div>
      </div>
    </Layout>
  );
};

const StudentInternshipView = ({ currentUser, apps, jobs, nav, setCurrentView, setApps }: any) => {
  // Fix: Show ALL applications, not just approved ones
  const myApps = apps.filter((a: Application) => a.userId === currentUser.id);

  const withdrawApp = (appId: string) => {
    if (confirm("Are you sure you want to withdraw this application? You will lose your spot.")) {
      setApps(apps.filter((a: Application) => a.id !== appId));
    }
  };

  return (
    <Layout nav={nav} title="Applications">
        <div className="p-6 pt-6 space-y-6">
          {myApps.length > 0 ? (
            myApps.map((app: Application) => {
              const job = jobs.find((j: Job) => j.id === app.jobId);
              if (!job) return null;

              const isApproved = app.status === 'approved';
              const isRejected = app.status === 'rejected';

              return (
                <div key={app.id} className={`bg-white rounded-[40px] overflow-hidden shadow-xl border ${isApproved ? 'border-blue-50 shadow-blue-100' : isRejected ? 'border-rose-50 shadow-rose-100' : 'border-slate-50 shadow-slate-100'}`}>
                  {/* Card Header */}
                  <div className={`${isApproved ? 'bg-[#60A5FA]' : isRejected ? 'bg-rose-400' : 'bg-slate-400'} p-8 text-white relative overflow-hidden`}>
                     <div className="absolute -right-4 -top-4 w-32 h-32 bg-white rounded-full opacity-20 animate-pulse"></div>
                     <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-black rounded-full opacity-10"></div>
                     
                     <div className="relative z-10">
                         <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                           {isApproved ? 'You did it! 🎉' : isRejected ? 'Application Update' : 'In Review ⏳'}
                         </div>
                         <h2 className="text-2xl font-black leading-tight mb-2">{job.title}</h2>
                         <p className="font-bold opacity-90">{job.location}</p>
                     </div>
                  </div>
                  
                  {/* Card Actions */}
                  {isApproved && (
                    <div className="p-3 space-y-1">
                        <button className="w-full p-4 hover:bg-slate-50 rounded-[24px] flex items-center justify-between transition-colors group">
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 font-bold text-lg">1</div>
                              <span className="font-bold text-slate-700">Weekly Check-in</span>
                          </div>
                          <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                        </button>
                    </div>
                  )}
                  
                  {isRejected && (
                     <div className="p-6 text-center">
                       <p className="text-slate-500 font-bold text-sm">We're sorry, this position has been filled. Please apply for other openings.</p>
                       <Button variant="outline" className="mt-4 w-full" onClick={() => setCurrentView('student-jobs')}>Find More Jobs</Button>
                     </div>
                  )}

                  {!isApproved && !isRejected && (
                     <div className="p-6 flex flex-col items-center gap-4 text-center">
                        <Loader2 className="w-8 h-8 text-sky-300 animate-spin" />
                        <div className="text-slate-500 font-bold text-sm leading-relaxed">
                            Your application will be reviewed by the team. After it is reviewed, there will be a long wait. Please do not constantly check in. Once our backend team approves it, you can proceed. Do not repeatedly check in. Constantly checking in is unproductive.
                        </div>
                        <Button variant="secondary" className="w-full text-rose-400 hover:text-rose-500 hover:bg-rose-50" onClick={() => withdrawApp(app.id)}>
                            Withdraw Application
                        </Button>
                     </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
              <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm relative text-sky-200">
                <Briefcase className="w-16 h-16 relative z-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-700 mb-2">No active apps</h2>
              <p className="text-slate-400 font-bold mb-8 leading-relaxed">You haven't applied to any jobs yet.</p>
              <Button onClick={() => setCurrentView('student-jobs')} className="px-8 bg-slate-700 text-white shadow-slate-300">
                Find Jobs
              </Button>
            </div>
          )}
        </div>
    </Layout>
  );
};

const AdminDashView = ({ users, jobs, setCurrentView, nav, navigateTo }: any) => {
  const [jobSearch, setJobSearch] = useState('');
  
  // Sort by manual seqNo
  const filteredJobs = jobs.filter((j: Job) => 
    j.title.toLowerCase().includes(jobSearch.toLowerCase()) || 
    j.companyName.toLowerCase().includes(jobSearch.toLowerCase())
  ).sort((a: Job, b: Job) => (a.seqNo || 9999) - (b.seqNo || 9999));

  return (
    <Layout nav={nav} title="Dashboard" bgClass="bg-slate-50">
       <div className="px-5 pt-6">
         {/* Stats Grid */}
         <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-slate-800 p-6 rounded-[32px] text-white flex flex-col justify-between h-36">
               <Users className="w-6 h-6 opacity-50" />
               <div>
                  <div className="text-4xl font-black">{users.filter((u: UserData) => u.role==='student').length}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Students</div>
               </div>
            </div>
            <div className="bg-white p-6 rounded-[32px] text-slate-800 flex flex-col justify-between h-36 shadow-sm border border-slate-100">
               <Briefcase className="w-6 h-6 text-slate-300" />
               <div>
                  <div className="text-4xl font-black">{jobs.length}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active Jobs</div>
               </div>
            </div>
         </div>

         <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xl font-black text-slate-700">Jobs</h2>
            <button onClick={() => navigateTo('admin-post-job')} className="text-xs font-bold bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200 text-slate-700 flex items-center gap-1">
               <Plus className="w-3 h-3"/> New
            </button>
         </div>

         {/* Job Search */}
         <div className="mb-4 bg-white rounded-full flex items-center px-4 py-3 shadow-sm border border-slate-100">
            <Search className="w-4 h-4 text-slate-300 mr-2" />
            <input 
               placeholder="Search jobs..." 
               className="flex-1 text-sm font-bold outline-none text-slate-600 placeholder-slate-300"
               value={jobSearch}
               onChange={e => setJobSearch(e.target.value)}
            />
         </div>

         <div className="space-y-3">
           {filteredJobs.map((job: Job, index: number) => (
             <div 
               key={job.id} 
               onClick={() => navigateTo('admin-post-job', { job })} 
               className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer relative"
             >
                <div className="absolute top-2 left-2 w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[9px] font-black text-slate-400 z-10">
                   {/* Manual Sequence Number */}
                   {String(job.seqNo || index + 1).padStart(2, '0')}
                </div>
                <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                   {job.imgUrls && job.imgUrls.length > 0 ? (
                       <img src={job.imgUrls[0]} className="w-full h-full object-cover" />
                   ) : (
                       <ImageIcon className="w-6 h-6 text-slate-300 m-auto" />
                   )}
                </div>
                <div className="flex-1">
                   <h3 className="font-bold text-slate-700 leading-tight">{job.title}</h3>
                   <div className="text-xs font-medium text-slate-400 mt-1">{job.companyName}</div>
                </div>
                <button className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center">
                   <MoreHorizontal className="w-5 h-5 text-slate-400" />
                </button>
             </div>
           ))}
         </div>
       </div>
    </Layout>
  );
};

const AdminStudentsView = ({ users, apps, navigateTo, nav }: any) => {
  const [studentSearch, setStudentSearch] = useState('');
  
  // Sort by manual seqNo
  const studentList = users.filter((u: UserData) => 
    u.role === 'student' && 
    u.name.toLowerCase().includes(studentSearch.toLowerCase())
  ).sort((a: UserData, b: UserData) => (a.seqNo || 9999) - (b.seqNo || 9999));

  return (
    <Layout nav={nav} title="Students">
      <div className="p-4 space-y-4">
          <div className="bg-white rounded-full flex items-center px-4 py-3 shadow-sm border border-slate-100 mb-2">
             <Search className="w-4 h-4 text-slate-300 mr-2" />
             <input 
                placeholder="Search students..." 
                className="flex-1 text-sm font-bold outline-none text-slate-600 placeholder-slate-300"
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
             />
          </div>

          <div className="space-y-3">
            {studentList.map((s: UserData, i: number) => {
              const sApp = apps.find((a: Application) => a.userId === s.id);
              return (
                <div 
                  key={s.id} 
                  onClick={() => navigateTo('admin-student-detail', { studentId: s.id })} 
                  className="bg-white p-4 rounded-[28px] shadow-sm border border-slate-100 flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer relative"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-black mr-[-8px] z-10 border-2 border-white">
                       {/* Manual Sequence Number */}
                       {String(s.seqNo || i + 1).padStart(2, '0')}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
                      {s.name[0]}
                    </div>
                    <div>
                      <div className="font-black text-slate-700">{s.name}</div>
                      <div className="text-xs font-bold text-slate-400 mt-0.5">{s.programYear} • Score: {s.score.toFixed(1)}</div>
                    </div>
                  </div>
                  {sApp && (
                    <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase ${
                      sApp.status === 'approved' ? 'bg-green-100 text-green-700' : 
                      sApp.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {sApp.status}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
      </div>
    </Layout>
  );
};

const AdminPostJobView = ({ jobs, setJobs, setCurrentView, nav, editJob = null }: any) => {
  const [form, setForm] = useState<Partial<Job>>({
    title: '', location: '', companyName: '', housing: 'Provided', housingCost: '$150/wk', salary: '$15.00/hr', programYear: '2025', capacity: 10, minScore: 6.0,
    startDateRange: 'Jun 15 - Jun 30', endDate: 'Sept 15, 2025', description: '', imgUrls: [], seqNo: jobs.length + 1
  });

  useEffect(() => {
    if (editJob) {
      setForm(editJob);
    }
  }, [editJob]);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if ((form.imgUrls?.length || 0) >= 9) {
          alert("Maximum 9 images allowed.");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, imgUrls: [...(form.imgUrls || []), reader.result as string] });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    const newUrls = form.imgUrls?.filter((_, i) => i !== index);
    setForm({ ...form, imgUrls: newUrls });
  };

  const handleSubmit = () => {
    if (editJob) {
      // Update existing
      const updatedJobs = jobs.map((j: Job) => j.id === editJob.id ? { ...form, id: editJob.id } : j);
      setJobs(updatedJobs);
    } else {
      // Create new
      const newJob = { ...form, id: `j${Date.now()}` } as Job;
      setJobs([...jobs, newJob]);
    }
    setCurrentView('admin-dash');
  };

  const handleDelete = () => {
    if (confirm("Delete this job?")) {
      setJobs(jobs.filter((j: Job) => j.id !== editJob.id));
      setCurrentView('admin-dash');
    }
  };

  return (
    <Layout nav={nav} title={editJob ? "Edit Job" : "Post Job"} backAction={() => setCurrentView('admin-dash')}>
      <div className="p-4 pb-20">
         <div className="text-3xl font-black text-slate-700 mb-6 px-4">{editJob ? "Edit" : "New"}<br/><span className="text-sky-400">{editJob ? "Details" : "Position"}</span></div>
         
         <div className="mb-6 px-4">
           <div className="flex justify-between items-center mb-2 px-1">
             <div className="text-[10px] font-black text-sky-300 uppercase tracking-widest">Job Images</div>
             <div className="text-[10px] font-bold text-slate-400">{form.imgUrls?.length || 0} / 9</div>
           </div>
           
           <div className="grid grid-cols-3 gap-2">
              {form.imgUrls?.map((url, idx) => (
                <div key={idx} className="aspect-square rounded-[20px] overflow-hidden relative shadow-sm border border-sky-100">
                    <img src={url} className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center text-rose-500 shadow-sm backdrop-blur-sm">
                        <X size={14} strokeWidth={3} />
                    </button>
                </div>
              ))}
              
              {(form.imgUrls?.length || 0) < 9 && (
                <div 
                    onClick={() => fileRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-sky-200 bg-sky-50 rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:bg-sky-100 transition-colors active:scale-[0.98] text-sky-300"
                >
                    <Plus size={24} strokeWidth={3} />
                    <span className="text-[10px] font-bold mt-1 uppercase">Add</span>
                </div>
              )}
           </div>
           <input type="file" ref={fileRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
         </div>

         <InputGroup title="Basic Info">
            <div className="p-6 border-b border-slate-50">
               <div className="text-[10px] font-black text-sky-300 uppercase tracking-widest mb-2">JOB TITLE</div>
               <input className="w-full text-2xl font-black text-slate-700 outline-none placeholder-sky-200" placeholder="e.g. Resort Lifeguard" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
            </div>
            {/* Sequence Number Input */}
            <InputCell label="Sequence No." type="number" value={form.seqNo} onChange={(e:any) => setForm({...form, seqNo: parseInt(e.target.value)})} placeholder="e.g. 1" />
         </InputGroup>

         <InputGroup title="Program Details">
            <InputCell label="Program Year" value={form.programYear} onChange={(e:any) => setForm({...form, programYear: e.target.value})} />
            <InputCell label="Min Score" type="number" step="0.5" value={form.minScore} onChange={(e:any) => setForm({...form, minScore: parseFloat(e.target.value)})} />
            <InputCell label="Location" value={form.location} onChange={(e:any) => setForm({...form, location: e.target.value})} placeholder="City, State" />
            <InputCell label="Company" value={form.companyName} onChange={(e:any) => setForm({...form, companyName: e.target.value})} placeholder="Company Name" />
         </InputGroup>

         <InputGroup title="Compensation">
            <InputCell label="Salary" value={form.salary} onChange={(e:any) => setForm({...form, salary: e.target.value})} placeholder="$16.00/hr" />
            <InputCell label="Housing Cost" value={form.housingCost} onChange={(e:any) => setForm({...form, housingCost: e.target.value})} placeholder="$150/wk" />
            <InputCell label="Capacity" type="number" value={form.capacity} onChange={(e:any) => setForm({...form, capacity: parseInt(e.target.value)})} />
         </InputGroup>
         
         <InputGroup title="Dates">
            <InputCell label="Start Range" value={form.startDateRange} onChange={(e:any) => setForm({...form, startDateRange: e.target.value})} />
            <InputCell label="End Date" value={form.endDate} onChange={(e:any) => setForm({...form, endDate: e.target.value})} />
         </InputGroup>

         <InputGroup title={`Description`}>
             <div className="p-6">
                 <textarea 
                    className="w-full h-40 bg-transparent text-sm font-bold outline-none resize-none text-slate-600 leading-relaxed placeholder-sky-200" 
                    value={form.description} 
                    onChange={e => setForm({...form, description: e.target.value})}
                    placeholder="Enter full job details here..."
                  />
             </div>
         </InputGroup>

         <div className="mt-8 space-y-4">
            <Button className="w-full" onClick={handleSubmit}>{editJob ? "Save Changes" : "Publish Position"}</Button>
            {editJob && <Button className="w-full" variant="danger" onClick={handleDelete}>Delete Job</Button>}
         </div>
      </div>
    </Layout>
  );
};

const AdminStudentDetailView = ({ studentId, users, setUsers, apps, setApps, jobs, setCurrentView }: any) => {
   const student = users.find((u: UserData) => u.id === studentId);
   const studentApps = apps.filter((a: Application) => a.userId === studentId);

   if (!student) return <div>User not found</div>;

   const handleStatusChange = (appId: string, newStatus: AppStatus) => {
      setApps(apps.map((a: Application) => a.id === appId ? { ...a, status: newStatus } : a));
   };

   const updateStudent = (field: string, value: any) => {
      setUsers(users.map((u: UserData) => u.id === studentId ? { ...u, [field]: value } : u));
   };

   return (
      <Layout title="Student Profile" backAction={() => setCurrentView('admin-students')}>
         <div className="p-6">
            {/* Header */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col items-center mb-6">
               <div className="w-20 h-20 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center font-black text-2xl mb-4">
                  {student.name[0]}
               </div>
               <h2 className="text-2xl font-black text-slate-700">{student.name}</h2>
               <p className="text-slate-400 font-bold">{student.school}</p>
               <div className="mt-4 flex gap-2">
                  <a href={`tel:${student.phone}`} className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center hover:bg-emerald-100"><Phone size={18} /></a>
                  <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center"><Mail size={18} /></div>
               </div>
            </div>

            {/* Score Edit & Sequence No */}
            <InputGroup title="Academic">
               <InputCell label="Score" type="number" step="0.5" value={student.score} onChange={(e: any) => updateStudent('score', parseFloat(e.target.value))} />
               <InputCell label="Sequence No." type="number" value={student.seqNo} onChange={(e: any) => updateStudent('seqNo', parseInt(e.target.value))} />
               <InputCell label="Cohort" value={student.programYear} readOnly />
            </InputGroup>

            {/* Applications */}
            <div className="mb-6">
               <div className="px-4 mb-2 text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1"><Sparkles className="w-3 h-3" /> Applications</div>
               <div className="space-y-3">
                  {studentApps.length === 0 ? (
                     <div className="bg-white p-6 rounded-[24px] text-center text-slate-400 font-bold text-sm">No applications yet.</div>
                  ) : studentApps.map((app: Application) => {
                     const job = jobs.find((j: Job) => j.id === app.jobId);
                     return (
                        <div key={app.id} className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-50">
                           <div className="font-bold text-slate-700 mb-1">{job?.title}</div>
                           <div className="text-xs font-bold text-slate-400 uppercase mb-4">{job?.companyName}</div>
                           
                           <div className="flex gap-2">
                              {app.status === 'pending' && (
                                 <>
                                    <button onClick={() => handleStatusChange(app.id, 'approved')} className="flex-1 bg-emerald-50 text-emerald-600 py-2 rounded-xl font-bold text-xs hover:bg-emerald-100 flex items-center justify-center gap-1">
                                       <CheckCircle2 size={14} /> Approve
                                    </button>
                                    <button onClick={() => handleStatusChange(app.id, 'rejected')} className="flex-1 bg-rose-50 text-rose-500 py-2 rounded-xl font-bold text-xs hover:bg-rose-100 flex items-center justify-center gap-1">
                                       <XCircle size={14} /> Reject
                                    </button>
                                 </>
                              )}
                              {app.status === 'approved' && (
                                 <div className="flex-1 bg-emerald-100 text-emerald-700 py-2 rounded-xl font-bold text-xs text-center">Approved</div>
                              )}
                              {app.status === 'rejected' && (
                                 <div className="flex-1 bg-rose-100 text-rose-700 py-2 rounded-xl font-bold text-xs text-center">Rejected</div>
                              )}
                           </div>
                        </div>
                     )
                  })}
               </div>
            </div>
            
            {/* Emergency Contacts */}
             <div className="mb-6">
               <div className="px-4 mb-2 text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Emergency Contacts</div>
               <div className="bg-white rounded-[24px] overflow-hidden">
                  {student.emergencyContacts?.map((c: any, i: number) => (
                     <div key={i} className="p-4 border-b border-slate-50 last:border-0 flex justify-between items-center">
                        <div>
                           <div className="font-bold text-slate-700">{c.name}</div>
                           <div className="text-xs text-slate-400 font-bold">{c.type}</div>
                        </div>
                        <div className="font-bold text-slate-500 text-sm">{c.phone}</div>
                     </div>
                  ))}
                  {(!student.emergencyContacts || student.emergencyContacts.length === 0) && (
                     <div className="p-4 text-center text-slate-400 text-sm font-bold">No contacts added.</div>
                  )}
               </div>
            </div>

         </div>
      </Layout>
   )
};


// --- Main App ---

const App = () => {
  // State
  const [users, setUsers] = useState<UserData[]>(INITIAL_USERS);
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [apps, setApps] = useState<Application[]>(INITIAL_APPS);
  const [guides, setGuides] = useState<Guide[]>(INITIAL_GUIDES);
  
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [currentView, setCurrentView] = useState('login'); 
  const [selectedJob, setSelectedJob] = useState<Job | null>(null); // For admin editing
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null); // For admin student detail

  // Helper to change view and pass data
  const navigateTo = (view: string, data?: any) => {
     if (view === 'admin-post-job' && data?.job) {
        setSelectedJob(data.job);
     } else if (view === 'admin-post-job') {
        setSelectedJob(null); // Clear for new job
     }

     if (view === 'admin-student-detail' && data?.studentId) {
        setSelectedStudentId(data.studentId);
     }

     setCurrentView(view);
  }
  
  // --- Views: Auth ---
  
  if (currentView === 'login') {
    return (
      <Layout bgClass="bg-[#F0F9FF]">
        <div className="min-h-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
          {/* Cute Blobs Blue */}
          <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-[#BAE6FD] rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-[10%] right-[-20%] w-80 h-80 bg-[#FEF08A] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse delay-75"></div>
          <div className="absolute top-[20%] right-[10%] w-32 h-32 bg-[#A5F3FC] rounded-full mix-blend-multiply filter blur-xl opacity-60"></div>

          <div className="relative z-10 w-full max-w-xs text-center">
            {/* Logo Mark */}
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg shadow-sky-200 mb-10 mx-auto border-4 border-white">
               <div className="w-16 h-16 bg-[#38BDF8] rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white fill-white" />
               </div>
            </div>

            <h1 className="text-4xl font-black text-slate-700 mb-2 tracking-tight">
              Blueprint<span className="text-sky-400">Global</span>
            </h1>
            <p className="text-slate-400 font-bold text-lg mb-16 tracking-wide">蓝途启航 · 赴美带薪实习</p>
            
            <div className="space-y-4">
              <Button className="w-full shadow-sky-200 hover:shadow-sky-300" onClick={() => { setCurrentUser(users[0]); setCurrentView('student-jobs'); }}>
                Start as Student
              </Button>
              <Button className="w-full text-sky-400" variant="secondary" onClick={() => { setCurrentUser(users[1]); setCurrentView('admin-dash'); }}>
                Admin Access
              </Button>
              
              <div className="pt-8 flex justify-center">
                 <button onClick={() => setCurrentView('register')} className="text-sky-400 text-sm font-black underline decoration-2 underline-offset-4 decoration-sky-200">
                   Create Account
                 </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (currentView === 'register') {
     return <StudentRegisterView setUsers={setUsers} users={users} setCurrentUser={setCurrentUser} setCurrentView={setCurrentView} />;
  }

  // --- Student Logic ---

  if (currentUser?.role === 'student') {
    const activeApp = apps.find(a => a.userId === currentUser.id && (a.status === 'pending' || a.status === 'approved'));

    const NavItem = ({ view, icon: Icon, label }: any) => {
        const isActive = currentView === view || (view === 'student-jobs' && currentView.startsWith('job-')) || (view === 'student-services' && currentView === 'student-emergency');
        return (
          <button 
            onClick={() => setCurrentView(view)} 
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${isActive ? 'bg-[#38BDF8] text-white shadow-lg shadow-sky-200 scale-110' : 'text-slate-300 hover:bg-sky-50'}`}
          >
            <Icon size={22} strokeWidth={isActive ? 3 : 2.5} />
          </button>
        );
    };

    const StudentNav = (
      <>
        <NavItem view="student-jobs" icon={Briefcase} label="Jobs" />
        <NavItem view="student-internship" icon={Check} label="Intern" />
        <NavItem view="student-services" icon={ShieldAlert} label="Services" />
        <NavItem view="student-profile" icon={User} label="Me" />
      </>
    );

    // -- Student: Jobs --
    if (currentView === 'student-jobs') {
      return <StudentJobsView jobs={jobs} currentUser={currentUser} setCurrentView={setCurrentView} nav={StudentNav} />
    }

    // -- Student: Job Detail --
    if (currentView.startsWith('job-')) {
      const jobId = currentView.split('-')[1];
      const job = jobs.find(j => j.id === jobId);
      
      const handleApply = () => {
        if (activeApp) {
          alert("You can only apply to one job at a time. Please withdraw your current application first.");
          return;
        }
        if (currentUser.score < (job?.minScore || 0)) {
          alert(`Score too low 🥺. Need: ${job?.minScore}`);
          return;
        }
        setApps([...apps, { id: `app${Date.now()}`, userId: currentUser.id, jobId: job!.id, status: 'pending', date: new Date().toISOString() }]);
        alert("Applied! Good luck! ✨");
        setCurrentView('student-jobs');
      };

      if (!job) return <div>Job not found</div>;

      const myApp = apps.find(a => a.userId === currentUser.id && a.jobId === job.id);
      
      // If user has an active app for ANOTHER job
      const isBlocked = !!activeApp && activeApp.jobId !== job.id;

      return (
        <Layout backAction={() => setCurrentView('student-jobs')} bgClass="bg-[#F0F9FF]">
          <div className="relative pb-8">
             
             {/* Image Gallery */}
             {job.imgUrls && job.imgUrls.length > 0 ? (
               <div className="w-full h-72 relative overflow-x-auto scrollbar-hide flex snap-x snap-mandatory">
                  {job.imgUrls.map((url, index) => (
                    <div key={index} className="w-full shrink-0 h-full snap-center relative">
                        <img src={url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>
                  ))}
                  {/* Dots Indicator */}
                  {job.imgUrls.length > 1 && (
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                          {job.imgUrls.map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-full bg-white/50 backdrop-blur-sm" />
                          ))}
                      </div>
                  )}
               </div>
             ) : (
                <div className="w-full h-40 bg-sky-50 flex items-center justify-center text-sky-200">
                    <ImageIcon className="w-12 h-12" />
                </div>
             )}

             <div className="px-6 pt-6 relative z-10 -mt-6 bg-[#F0F9FF] rounded-t-[40px]">
                <div className="inline-block bg-[#FEF08A] px-4 py-1.5 rounded-full text-xs font-black uppercase text-yellow-800 mb-6 shadow-sm mt-4">
                   {job.tags?.[0] || 'Internship'}
                </div>

                <h1 className="text-3xl font-black text-slate-700 leading-[1.1] mb-2">{job.title}</h1>
                <div className="text-lg font-bold text-slate-400 mb-8">{job.companyName}</div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                   <div className="bg-white p-5 rounded-[28px] shadow-sm border border-sky-50">
                      <div className="w-8 h-8 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-3">
                         <MapPin className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="text-[10px] font-black text-slate-300 uppercase mb-1">LOCATION</div>
                      <div className="text-slate-700 font-bold leading-tight">{job.location}</div>
                   </div>
                   <div className="bg-white p-5 rounded-[28px] shadow-sm border border-sky-50">
                      <div className="w-8 h-8 bg-[#E0F2FE] rounded-full flex items-center justify-center mb-3">
                         <Home className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="text-[10px] font-black text-slate-300 uppercase mb-1">HOUSING</div>
                      <div className="text-slate-700 font-bold leading-tight">{job.housingCost}</div>
                   </div>
                   <div className="col-span-2 bg-white p-5 rounded-[28px] shadow-sm border border-sky-50 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-black text-slate-300 uppercase mb-1">DURATION</div>
                        <div className="text-slate-700 font-bold">{job.startDateRange} — {job.endDate}</div>
                      </div>
                      <div className="text-right">
                         <div className="text-[10px] font-black text-slate-300 uppercase mb-1">CAPACITY</div>
                         <div className="text-slate-700 font-bold">0 / {job.capacity}</div>
                      </div>
                   </div>
                </div>

                <div className="mb-32">
                   <h3 className="font-black text-slate-700 mb-4 text-xl">About the Job</h3>
                   <div className="prose prose-sky prose-p:font-bold prose-p:text-slate-500 prose-li:font-bold prose-li:text-slate-500 bg-white p-6 rounded-[32px] shadow-sm border border-sky-50">
                     <ReactMarkdown>{job.description}</ReactMarkdown>
                   </div>
                </div>
             </div>

             {/* Bottom Fixed Action Bar */}
             <div className="fixed bottom-6 left-6 right-6 max-w-md mx-auto z-50">
                <div className="bg-white p-2 pr-2 rounded-full shadow-xl shadow-sky-200/50 flex items-center gap-2 pl-8 border border-sky-50">
                   <div className="flex-1">
                      <div className="text-[10px] font-bold text-sky-300 uppercase">Min Score</div>
                      <div className="text-xl font-black text-slate-700">{job.minScore.toFixed(1)}</div>
                   </div>
                   {myApp ? (
                      <button disabled className="bg-slate-100 text-slate-400 font-bold rounded-full px-8 py-4 h-full">
                         {myApp.status.toUpperCase()}
                      </button>
                   ) : isBlocked ? (
                      <button disabled className="bg-slate-100 text-slate-400 font-bold rounded-full px-4 py-4 h-full text-xs flex flex-col items-center justify-center leading-none">
                         <span>Limit Reached</span>
                         <span className="text-[9px] opacity-70 mt-1">Check Applications</span>
                      </button>
                   ) : (
                      <button onClick={handleApply} className="bg-[#38BDF8] text-white font-black rounded-full px-8 py-4 h-full hover:bg-sky-500 transition-colors shadow-lg shadow-sky-200">
                         APPLY
                      </button>
                   )}
                </div>
             </div>
          </div>
        </Layout>
      );
    }

    // -- Student: Internship (Applications) --
    if (currentView === 'student-internship') {
       return <StudentInternshipView currentUser={currentUser} apps={apps} jobs={jobs} nav={StudentNav} setCurrentView={setCurrentView} setApps={setApps} />;
    }

    if (currentView === 'student-services') {
       return <StudentServicesView currentUser={currentUser} setCurrentUser={setCurrentUser} users={users} setUsers={setUsers} guides={guides} nav={StudentNav} setCurrentView={setCurrentView} />;
    }
    
    if (currentView === 'student-emergency') {
        return <StudentEmergencyView currentUser={currentUser} setCurrentView={setCurrentView} />;
    }

    if (currentView === 'student-profile') {
      return <StudentProfileView currentUser={currentUser} setCurrentUser={setCurrentUser} users={users} setUsers={setUsers} nav={StudentNav} setCurrentView={setCurrentView} />;
    }
  }

  // --- Admin Logic ---

  if (currentUser?.role === 'admin') {
    const NavItem = ({ view, icon: Icon, label }: any) => {
        const isActive = currentView === view;
        return (
          <button 
            onClick={() => setCurrentView(view)} 
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${isActive ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <Icon size={20} strokeWidth={2.5} />
          </button>
        );
    };

    const AdminNav = (
      <>
        <NavItem view="admin-dash" icon={LayoutGrid} label="Home" />
        <NavItem view="admin-students" icon={Users} label="Users" />
        <NavItem view="admin-post-job" icon={Plus} label="Post" />
        <NavItem view="admin-jobs" icon={Check} label="Review" />
      </>
    );

    if (currentView === 'admin-dash') {
      return <AdminDashView users={users} jobs={jobs} setCurrentView={setCurrentView} nav={AdminNav} navigateTo={navigateTo} />
    }

    if (currentView === 'admin-jobs') {
      return (
        <Layout nav={AdminNav} title="Review">
           <div className="p-4 flex flex-col items-center justify-center h-[60vh] text-slate-400">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                 <Check className="w-8 h-8 text-slate-300" />
               </div>
               <p className="font-bold">All caught up!</p>
           </div>
        </Layout>
      );
    }

    if (currentView === 'admin-post-job') {
      return <AdminPostJobView jobs={jobs} setJobs={setJobs} setCurrentView={setCurrentView} nav={AdminNav} editJob={selectedJob} />;
    }

    if (currentView === 'admin-student-detail') {
       return <AdminStudentDetailView studentId={selectedStudentId} users={users} setUsers={setUsers} apps={apps} setApps={setApps} jobs={jobs} setCurrentView={setCurrentView} />
    }

    if (currentView === 'admin-students') {
      return <AdminStudentsView users={users} apps={apps} navigateTo={navigateTo} nav={AdminNav} />
    }
  }

  return <div className="flex items-center justify-center min-h-screen bg-[#F0F9FF]"><Loader2 className="animate-spin text-sky-300" /></div>;
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
