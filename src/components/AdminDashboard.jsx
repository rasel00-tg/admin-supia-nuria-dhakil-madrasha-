import React, { useState, useEffect } from 'react';
import { 
  Home, 
  UserPlus, 
  Users, 
  Mail, 
  LogOut, 
  Plus, 
  CheckCircle, 
  ShieldAlert, 
  Loader2,
  Trash2,
  Calendar,
  Lock
} from 'lucide-react';
import { 
  supabase, 
  getStudents, 
  addStudent, 
  getTeachers, 
  addTeacher, 
  getContactMessages 
} from '../supabaseClient';

export default function AdminDashboard({ adminUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  // Stats Counters
  const [stats, setStats] = useState({
    teachers: 0,
    students: 0,
    messages: 0
  });

  // DB Lists
  const [studentsList, setStudentsList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [messagesList, setMessagesList] = useState([]);

  // Forms States
  const [studentForm, setStudentForm] = useState({
    name: '',
    roll_no: '',
    class: 'দাখিল ১০ম শ্রেণী',
    section_or_department: 'সাধারণ বিভাগ',
    guardian_name: '',
    phone: ''
  });

  const [teacherForm, setTeacherForm] = useState({
    name: '',
    designation: '',
    department: 'সাধারণ বিভাগ',
    phone: '',
    email: '',
    joinDate: '',
    avatarBg: 'bg-emerald-700'
  });

  const triggerToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMsg('');
    }, 4000);
  };

  // Fetch all live database records
  const loadDatabaseData = async () => {
    setLoading(true);
    let sCount = 0;
    let tCount = 0;
    let mCount = 0;

    // Load Students
    try {
      const studs = await getStudents();
      if (studs) {
        setStudentsList(studs);
        sCount = studs.length;
      }
    } catch (err) {
      console.error("Error loading students:", err);
    }

    // Load Teachers
    try {
      const teac = await getTeachers();
      if (teac) {
        setTeachersList(teac);
        tCount = teac.length;
      }
    } catch (err) {
      console.error("Error loading teachers:", err);
    }

    // Load Messages
    try {
      const msgs = await getContactMessages();
      if (msgs) {
        setMessagesList(msgs);
        mCount = msgs.length;
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    }

    setStats({
      students: sCount,
      teachers: tCount,
      messages: mCount
    });

    setLoading(false);
  };

  useEffect(() => {
    loadDatabaseData();
  }, []);

  // Handle Student Admission
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!studentForm.name.trim() || !studentForm.roll_no || !studentForm.guardian_name.trim() || !studentForm.phone.trim()) {
      triggerToast('সকল প্রয়োজনীয় ঘর পূরণ করুন।', 'error');
      return;
    }

    try {
      await addStudent({
        name: studentForm.name.trim(),
        roll_no: parseInt(studentForm.roll_no, 10),
        class: studentForm.class,
        section_or_department: studentForm.section_or_department,
        guardian_name: studentForm.guardian_name.trim(),
        phone: studentForm.phone.trim()
      });

      triggerToast('নতুন শিক্ষার্থী সফলভাবে ভর্তি সম্পন্ন হয়েছে!');
      setStudentForm({
        name: '',
        roll_no: '',
        class: 'দাখিল ১০ম শ্রেণী',
        section_or_department: 'সাধারণ বিভাগ',
        guardian_name: '',
        phone: ''
      });
      loadDatabaseData();
    } catch (err) {
      console.error("Error adding student:", err);
      triggerToast('ভর্তি ডেটাবেসে যোগ করতে সমস্যা হয়েছে: ' + err.message, 'error');
    }
  };

  // Handle Teacher Admission
  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    if (!teacherForm.name.trim() || !teacherForm.designation.trim() || !teacherForm.phone.trim()) {
      triggerToast('সকল প্রয়োজনীয় ঘর পূরণ করুন।', 'error');
      return;
    }

    try {
      const bndate = new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
      await addTeacher({
        name: teacherForm.name.trim(),
        designation: teacherForm.designation.trim(),
        department: teacherForm.department,
        phone: teacherForm.phone.trim(),
        email: teacherForm.email.trim() || null,
        joinDate: teacherForm.joinDate || bndate,
        avatarBg: teacherForm.avatarBg
      });

      triggerToast('নতুন শিক্ষক পরিচিতি সফলভাবে নিবন্ধিত হয়েছে!');
      setTeacherForm({
        name: '',
        designation: '',
        department: 'সাধারণ বিভাগ',
        phone: '',
        email: '',
        joinDate: '',
        avatarBg: 'bg-emerald-700'
      });
      loadDatabaseData();
    } catch (err) {
      console.error("Error adding teacher:", err);
      triggerToast('শিক্ষক পরিচিতি যোগ করতে সমস্যা হয়েছে: ' + err.message, 'error');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#02100a] text-emerald-100 font-sans">
      
      {/* Toast Notification Alert */}
      {toastMsg && (
        <div className={`fixed top-6 right-4 z-50 px-5 py-3 rounded-lg shadow-2xl flex items-center space-x-2 border animate-bounce ${
          toastType === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-rose-600 border-rose-500 text-white'
        }`}>
          {toastType === 'success' ? (
            <CheckCircle className="h-5 w-5 text-amber-300" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-white" />
          )}
          <span className="text-xs sm:text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Left Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#032317] border-b md:border-b-0 md:border-r border-emerald-900/40 shrink-0 flex flex-col justify-between p-5">
        <div className="space-y-8">
          
          {/* Header/Logo Brand */}
          <div className="border-b border-emerald-900/50 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/5 rounded-full p-1 border border-emerald-500/20">
                <img src="/photo/logo.png" alt="মাদ্রাসা লোগো" className="w-full h-full object-contain" />
              </div>
              <span className="font-black text-sm text-amber-400 font-serif tracking-wide uppercase">Admin Control</span>
            </div>
            <p className="text-[10px] text-emerald-400 font-bold mt-1.5 leading-relaxed">সুফিয়া নূরিয়া দাখিল মাদ্রাসা</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'home'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/10'
                  : 'hover:bg-emerald-900/60 text-emerald-100 hover:text-amber-300'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>ড্যাশবোর্ড হোম</span>
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'students'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/10'
                  : 'hover:bg-emerald-900/60 text-emerald-100 hover:text-amber-300'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>শিক্ষার্থী ভর্তি ও ডাটাবেস</span>
            </button>

            <button
              onClick={() => setActiveTab('teachers')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'teachers'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/10'
                  : 'hover:bg-emerald-900/60 text-emerald-100 hover:text-amber-300'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>শিক্ষক পরিচিতি মডারেটর</span>
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'messages'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/10'
                  : 'hover:bg-emerald-900/60 text-emerald-100 hover:text-amber-300'
              }`}
            >
              <Mail className="h-4 w-4" />
              <span>মেসেজ ইনবক্স</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer User Info & Logout */}
        <div className="pt-6 border-t border-emerald-900/50 space-y-4">
          <div className="flex items-center gap-2.5 px-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/35">
              <Lock className="h-4 w-4 text-amber-300" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] text-emerald-400 font-semibold uppercase truncate">Administrator</p>
              <p className="text-xs text-amber-100 font-bold truncate">{adminUser?.name || 'প্রধান শিক্ষক'}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-rose-900/50 hover:bg-rose-950/20 hover:border-rose-500 text-rose-350 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>লগআউট করুন</span>
          </button>
        </div>

      </aside>

      {/* Main Dynamic View Workspace */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Navbar Title */}
        <header className="bg-[#032317]/90 backdrop-blur-md border-b border-emerald-900/40 py-5 px-6 md:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-30">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-amber-300 tracking-wide font-serif" style={{ fontFamily: 'Georgia, serif' }}>
              Supia Nuria Dhakil madrasa - Isolated Admin Control
            </h1>
            <p className="text-xs text-emerald-400 font-semibold mt-1">সুরক্ষিত বাহ্যিক প্রশাসনিক নিয়ন্ত্রণ প্যানেল</p>
          </div>

          <button
            onClick={loadDatabaseData}
            className="self-start sm:self-auto py-1.5 px-4 bg-emerald-900/50 hover:bg-emerald-800 border border-emerald-800 text-amber-300 text-xs font-bold rounded-lg transition-all"
          >
            ডাটা রিফ্রেশ
          </button>
        </header>

        {/* Content Container */}
        <div className="p-6 md:p-8 flex-1">
          {loading ? (
            <div className="h-[50vh] flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
              <p className="text-xs text-emerald-400 mt-3 font-semibold">লাইভ ডাটাবেস সিঙ্ক হচ্ছে...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Tab 1: Dashboard Home */}
              {activeTab === 'home' && (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* Status Card */}
                  <div className="bg-[#032317] border border-emerald-800/40 p-5 rounded-2xl">
                    <h3 className="text-sm font-bold text-amber-400 mb-2">সিস্টেম সিকিউরিটি ও স্ট্যাটাস ইনফো</h3>
                    <p className="text-xs text-emerald-150 leading-relaxed text-justify">
                      এই নিয়ন্ত্রণ প্যানেলটি মূল ওয়েবসাইট থেকে সম্পূর্ণ আলাদা ফোল্ডারে পরিচালিত হচ্ছে। এখানে ডাটা ইনপুট বা রিমুভ করা হলে তা সরাসরি মূল শেয়ার্ড Supabase ডাটাবেসে রিফ্লেক্ট হবে। ডাটা রিফ্রেশ করতে ওপরে রিফ্রেশ বাটন ব্যবহার করুন।
                    </p>
                  </div>

                  {/* Summary Counts Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Students count */}
                    <div className="bg-[#031d12] border border-emerald-900/50 rounded-2xl p-6 relative overflow-hidden shadow-xl">
                      <div className="absolute top-0 inset-x-0 h-1 bg-amber-500"></div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-emerald-400 block text-xs font-semibold uppercase tracking-wider mb-1">মোট শিক্ষার্থী ভর্তি</span>
                          <span className="text-3xl font-black text-white font-sans">{stats.students}</span>
                        </div>
                        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
                          <UserPlus className="h-6 w-6" />
                        </div>
                      </div>
                      <p className="text-[10px] text-emerald-600 mt-4 font-bold">● Supabase live sync</p>
                    </div>

                    {/* Teachers count */}
                    <div className="bg-[#031d12] border border-emerald-900/50 rounded-2xl p-6 relative overflow-hidden shadow-xl">
                      <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500"></div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-emerald-400 block text-xs font-semibold uppercase tracking-wider mb-1">নিবন্ধিত শিক্ষক</span>
                          <span className="text-3xl font-black text-white font-sans">{stats.teachers}</span>
                        </div>
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                          <Users className="h-6 w-6" />
                        </div>
                      </div>
                      <p className="text-[10px] text-emerald-600 mt-4 font-bold">● Supabase live sync</p>
                    </div>

                    {/* Messages count */}
                    <div className="bg-[#031d12] border border-emerald-900/50 rounded-2xl p-6 relative overflow-hidden shadow-xl">
                      <div className="absolute top-0 inset-x-0 h-1 bg-amber-500/70"></div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-emerald-400 block text-xs font-semibold uppercase tracking-wider mb-1">যোগাযোগ বার্তা</span>
                          <span className="text-3xl font-black text-white font-sans">{stats.messages}</span>
                        </div>
                        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
                          <Mail className="h-6 w-6" />
                        </div>
                      </div>
                      <p className="text-[10px] text-emerald-600 mt-4 font-bold">● Supabase live sync</p>
                    </div>
                  </div>

                  {/* General Stats notice */}
                  <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl">
                    <span className="text-xs font-bold text-amber-400 block mb-1">নিরাপত্তা সতর্কবার্তা:</span>
                    <p className="text-[11px] text-emerald-300 leading-relaxed text-justify">
                      ডাটাবেস এক্সেস করার জন্য ব্যবহৃত এনভায়রনমেন্ট ক্রেডেনশিয়ালস অত্যন্ত গোপনীয়। ড্যাশবোর্ড থেকে লগআউট করার পর ব্রাউজারের সেশন ক্যাশ সম্পূর্ণ ডিলিট করা হবে।
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Students Admission & Table */}
              {activeTab === 'students' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
                  
                  {/* Student Add Form */}
                  <div className="bg-[#031d12] border border-emerald-900/50 rounded-2xl p-6 shadow-xl lg:col-span-1">
                    <h3 className="text-base font-bold text-amber-400 border-b border-emerald-900/50 pb-3 mb-4 flex items-center gap-2">
                      <UserPlus className="h-4 w-4 shrink-0" />
                      <span>শিক্ষার্থী ভর্তি ফরম</span>
                    </h3>

                    <form onSubmit={handleStudentSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-400 mb-1">শিক্ষার্থীর নাম *</label>
                        <input
                          type="text"
                          required
                          value={studentForm.name}
                          onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                          className="w-full bg-[#02100a] border border-emerald-800/60 rounded-lg py-2 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                          placeholder="পূর্ণ নাম লিখুন"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-400 mb-1">রোল নম্বর *</label>
                        <input
                          type="number"
                          required
                          value={studentForm.roll_no}
                          onChange={(e) => setStudentForm({ ...studentForm, roll_no: e.target.value })}
                          className="w-full bg-[#02100a] border border-emerald-800/60 rounded-lg py-2 px-3 text-xs sm:text-sm text-white font-sans focus:outline-none focus:border-amber-400"
                          placeholder="রোল নম্বর লিখুন"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-400 mb-1">শ্রেণী *</label>
                        <select
                          value={studentForm.class}
                          onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                          className="w-full bg-[#02100a] border border-emerald-800/60 rounded-lg py-2 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="দাখিল ১০ম শ্রেণী">দাখিল ১০ম শ্রেণী</option>
                          <option value="দাখিল ৯ম শ্রেণী">দাখিল ৯ম শ্রেণী</option>
                          <option value="দাখিল ৮ম শ্রেণী">দাখিল ৮ম শ্রেণী</option>
                          <option value="হিফজ বিভাগ">হিফজ বিভাগ</option>
                          <option value="নূরানী বিভাগ">নূরানী বিভাগ</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-400 mb-1">বিভাগ/শাখা *</label>
                        <input
                          type="text"
                          required
                          value={studentForm.section_or_department}
                          onChange={(e) => setStudentForm({ ...studentForm, section_or_department: e.target.value })}
                          className="w-full bg-[#02100a] border border-emerald-800/60 rounded-lg py-2 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                          placeholder="উদা: সাধারণ বিভাগ"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-400 mb-1">অভিভাবকের নাম *</label>
                        <input
                          type="text"
                          required
                          value={studentForm.guardian_name}
                          onChange={(e) => setStudentForm({ ...studentForm, guardian_name: e.target.value })}
                          className="w-full bg-[#02100a] border border-emerald-800/60 rounded-lg py-2 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                          placeholder="পিতা/মাতা/অভিভাবকের নাম"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-400 mb-1">যোগাযোগ মোবাইল নম্বর *</label>
                        <input
                          type="text"
                          required
                          value={studentForm.phone}
                          onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                          className="w-full bg-[#02100a] border border-emerald-800/60 rounded-lg py-2 px-3 text-xs sm:text-sm text-white font-sans focus:outline-none focus:border-amber-400"
                          placeholder="১১ ডিজিটের মোবাইল নম্বর"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-lg active:scale-95 transition-all shadow-lg mt-4 flex items-center justify-center gap-1.5"
                      >
                        <Plus className="h-4 w-4" />
                        <span>ভর্তি নিশ্চিত করুন</span>
                      </button>
                    </form>
                  </div>

                  {/* Student Database Table */}
                  <div className="bg-[#031d12] border border-emerald-900/50 rounded-2xl p-6 shadow-xl lg:col-span-2 overflow-hidden flex flex-col justify-start">
                    <h3 className="text-base font-bold text-amber-400 border-b border-emerald-900/50 pb-3 mb-4">
                      <span>শিক্ষার্থী তালিকা (রোল সর্ট)</span>
                    </h3>

                    <div className="overflow-x-auto scrollbar-none">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm text-emerald-100">
                        <thead>
                          <tr className="bg-[#02100a] border-b border-emerald-900 text-amber-400 font-bold">
                            <th className="py-3 px-3">রোল</th>
                            <th className="py-3 px-3">নাম</th>
                            <th className="py-3 px-3">শ্রেণী</th>
                            <th className="py-3 px-3">বিভাগ</th>
                            <th className="py-3 px-3">অভিভাবক</th>
                            <th className="py-3 px-3">মোবাইল</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-900/40">
                          {studentsList.length > 0 ? (
                            studentsList.map((stu, idx) => (
                              <tr key={idx} className="hover:bg-emerald-950/40 font-semibold font-sans">
                                <td className="py-3 px-3 font-bold text-amber-300">{stu.roll_no}</td>
                                <td className="py-3 px-3 font-bold text-white">{stu.name}</td>
                                <td className="py-3 px-3">{stu.class}</td>
                                <td className="py-3 px-3 text-emerald-300">{stu.section_or_department || 'সাধারণ বিভাগ'}</td>
                                <td className="py-3 px-3">{stu.guardian_name}</td>
                                <td className="py-3 px-3 text-emerald-400">{stu.phone}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="py-8 text-center text-emerald-700 font-semibold">ডাটাবেসে কোনো শিক্ষার্থী তথ্য পাওয়া যায়নি।</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* Tab 3: Teachers Control */}
              {activeTab === 'teachers' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
                  
                  {/* Teacher Add Form */}
                  <div className="bg-[#031d12] border border-emerald-900/50 rounded-2xl p-6 shadow-xl lg:col-span-1">
                    <h3 className="text-base font-bold text-amber-400 border-b border-emerald-900/50 pb-3 mb-4 flex items-center gap-2">
                      <Plus className="h-4 w-4 shrink-0" />
                      <span>শিক্ষক পরিচিতি যুক্ত করুন</span>
                    </h3>

                    <form onSubmit={handleTeacherSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-400 mb-1">শিক্ষকের নাম *</label>
                        <input
                          type="text"
                          required
                          value={teacherForm.name}
                          onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                          className="w-full bg-[#02100a] border border-emerald-800/60 rounded-lg py-2 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                          placeholder="উদা: মাওলানা আব্দুর রহমান"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-400 mb-1">পদবী *</label>
                        <input
                          type="text"
                          required
                          value={teacherForm.designation}
                          onChange={(e) => setTeacherForm({ ...teacherForm, designation: e.target.value })}
                          className="w-full bg-[#02100a] border border-emerald-800/60 rounded-lg py-2 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                          placeholder="উদা: মুহাদ্দিস / সহকারী শিক্ষক"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-400 mb-1">বিভাগ</label>
                        <input
                          type="text"
                          value={teacherForm.department}
                          onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })}
                          className="w-full bg-[#02100a] border border-emerald-800/60 rounded-lg py-2 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                          placeholder="উদা: আরবি সাহিত্য বিভাগ"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-400 mb-1">মোবাইল নম্বর *</label>
                        <input
                          type="text"
                          required
                          value={teacherForm.phone}
                          onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                          className="w-full bg-[#02100a] border border-emerald-800/60 rounded-lg py-2 px-3 text-xs sm:text-sm text-white font-sans focus:outline-none focus:border-amber-400"
                          placeholder="যোগাযোগ নম্বর"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-400 mb-1">ইমেইল</label>
                        <input
                          type="email"
                          value={teacherForm.email}
                          onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                          className="w-full bg-[#02100a] border border-emerald-800/60 rounded-lg py-2 px-3 text-xs sm:text-sm text-white font-sans focus:outline-none focus:border-amber-400"
                          placeholder="teacher@madrasah.edu"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-400 mb-1">যোগদানের তারিখ</label>
                        <input
                          type="text"
                          value={teacherForm.joinDate}
                          onChange={(e) => setTeacherForm({ ...teacherForm, joinDate: e.target.value })}
                          className="w-full bg-[#02100a] border border-emerald-800/60 rounded-lg py-2 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                          placeholder="উদা: ১২ মার্চ, ২০১৫"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-lg active:scale-95 transition-all shadow-lg mt-4 flex items-center justify-center gap-1.5"
                      >
                        <Plus className="h-4 w-4" />
                        <span>শিক্ষক পরিচিতি যোগ করুন</span>
                      </button>
                    </form>
                  </div>

                  {/* Teachers Table List */}
                  <div className="bg-[#031d12] border border-emerald-900/50 rounded-2xl p-6 shadow-xl lg:col-span-2 overflow-hidden flex flex-col justify-start">
                    <h3 className="text-base font-bold text-amber-400 border-b border-emerald-900/50 pb-3 mb-4">
                      <span>শিক্ষক পরিচিতি তালিকা</span>
                    </h3>

                    <div className="overflow-x-auto scrollbar-none">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm text-emerald-100">
                        <thead>
                          <tr className="bg-[#02100a] border-b border-emerald-900 text-amber-400 font-bold">
                            <th className="py-3 px-3">নাম</th>
                            <th className="py-3 px-3">পদবী</th>
                            <th className="py-3 px-3">বিভাগ</th>
                            <th className="py-3 px-3">মোবাইল</th>
                            <th className="py-3 px-3">যোগদান</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-900/40">
                          {teachersList.length > 0 ? (
                            teachersList.map((tea, idx) => (
                              <tr key={idx} className="hover:bg-emerald-950/40 font-semibold font-sans">
                                <td className="py-3 px-3 font-bold text-white">{tea.name}</td>
                                <td className="py-3 px-3 text-amber-300 font-bold">{tea.designation}</td>
                                <td className="py-3 px-3">{tea.department || 'সাধারণ বিভাগ'}</td>
                                <td className="py-3 px-3">{tea.phone}</td>
                                <td className="py-3 px-3 font-sans text-emerald-400">{tea.joinDate}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="py-8 text-center text-emerald-700 font-semibold">কোনো শিক্ষক পরিচিতি ডাটাবেসে পাওয়া যায়নি।</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* Tab 4: Messages Inbox */}
              {activeTab === 'messages' && (
                <div className="bg-[#031d12] border border-emerald-900/50 rounded-2xl p-6 shadow-xl overflow-hidden flex flex-col justify-start animate-fade-in">
                  <h3 className="text-base font-bold text-amber-400 border-b border-emerald-900/50 pb-3 mb-4">
                    <span>কন্টাক্ট মেসেজ ইনবক্স</span>
                  </h3>

                  <div className="overflow-x-auto scrollbar-none">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm text-emerald-100">
                      <thead>
                        <tr className="bg-[#02100a] border-b border-emerald-900 text-amber-400 font-bold">
                          <th className="py-3.5 px-3">নাম</th>
                          <th className="py-3.5 px-3">যোগাযোগ</th>
                          <th className="py-3.5 px-3">বিষয়</th>
                          <th className="py-3.5 px-3">মেসেজ</th>
                          <th className="py-3.5 px-3">তারিখ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-900/40">
                        {messagesList.length > 0 ? (
                          messagesList.map((msg, idx) => (
                            <tr key={idx} className="hover:bg-emerald-950/40 font-semibold font-sans">
                              <td className="py-3.5 px-3 font-bold text-white">{msg.name}</td>
                              <td className="py-3.5 px-3">
                                <p className="font-bold text-emerald-350">{msg.phone}</p>
                                <p className="text-[10px] text-emerald-500 font-sans">{msg.email}</p>
                              </td>
                              <td className="py-3.5 px-3 font-bold text-amber-300">{msg.subject}</td>
                              <td className="py-3.5 px-3 max-w-xs truncate font-sans text-justify text-xs text-emerald-100/90" title={msg.message}>
                                {msg.message}
                              </td>
                              <td className="py-3.5 px-3 text-[10px] text-emerald-500 font-sans">
                                {new Date(msg.created_at).toLocaleDateString('bn-BD', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-emerald-700 font-semibold">কোনো কন্টাক্ট মেসেজ পাওয়া যায়নি।</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </main>

    </div>
  );
}
