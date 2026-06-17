import React, { useState, useEffect } from 'react';
import { 
  Home, 
  UserPlus, 
  Users, 
  Mail, 
  Settings, 
  LogOut, 
  Plus, 
  CheckCircle, 
  ShieldAlert, 
  Loader2,
  Calendar,
  Lock,
  Search,
  Bell,
  Moon,
  Sun,
  BookOpen,
  UserCheck,
  Menu,
  X,
  Award,
  Trophy
} from 'lucide-react';
import { 
  supabase, 
  getStudents, 
  addStudent, 
  getTeachers, 
  addTeacher, 
  getContactMessages,
  createNewUser
} from '../supabaseClient';

export default function AdminDashboard({ adminUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  const [committeeList, setCommitteeList] = useState([]);
  const [resultsList, setResultsList] = useState([]);
  const [routineList, setRoutineList] = useState([]);
  const [selectedClass, setSelectedClass] = useState('দাখিল ১০ম শ্রেণি');

  // Forms States
  // 1. Student Form
  const [studentForm, setStudentForm] = useState({
    name: '',
    roll_no: '',
    class: 'দাখিল ১০ম শ্রেণি',
    section_or_department: 'সাধারণ বিভাগ',
    guardian_name: '',
    phone: '',
    gender: 'Male'
  });

  // 2. Teacher Form
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    designation: '',
    department: 'সাধারণ বিভাগ',
    phone: '',
    email: '',
    joinDate: '',
    avatarBg: 'bg-emerald-700'
  });

  // 3. User Form (Settings)
  const [userForm, setUserForm] = useState({
    name: '',
    username_or_email: '',
    password: '',
    phone: '',
    role: 'teacher',
    designation: '',
    department: 'সাধারণ বিভাগ'
  });

  // 4. Committee Form
  const [committeeForm, setCommitteeForm] = useState({
    name: '',
    designation: 'সভাপতি',
    phone: '',
    email: ''
  });

  // 5. Result Form
  const [resultForm, setResultForm] = useState({
    student_name: '',
    roll_no: '',
    class: 'দাখিল ১০ম শ্রেণি',
    exam_type: 'বার্ষিক পরীক্ষা',
    gpa: '',
    grade: 'A+'
  });

  // 6. Routine Form
  const [routineForm, setRoutineForm] = useState({
    day: 'শনিবার',
    class: 'দাখিল ১০ম শ্রেণি',
    subject: '',
    time_slot: '০৯:০০ - ০৯:৪৫',
    teacher_name: ''
  });

  // 7. Homepage Update Modals and Form States
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showMemorialModal, setShowMemorialModal] = useState(false);

  const [achievementForm, setAchievementForm] = useState({
    student_name: '',
    student_class: 'দাখিল ১০ম শ্রেণি',
    headline: '',
    description: '',
    image_url: ''
  });

  const [memorialForm, setMemorialForm] = useState({
    member_name: '',
    lifespan: '',
    contribution_headline: '',
    contribution_details: ''
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
        const savedGenders = JSON.parse(localStorage.getItem('student_genders') || '{}');
        const enriched = studs.map(stu => {
          const g = stu.gender || savedGenders[stu.roll_no] || (stu.roll_no % 2 === 0 ? 'Female' : 'Male');
          return { ...stu, gender: g };
        });
        setStudentsList(enriched);
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

    // Load Committee
    try {
      const { data, error } = await supabase.from('committee_members').select('*').order('id', { ascending: true });
      if (!error && data) {
        setCommitteeList(data);
      } else {
        setCommitteeList(JSON.parse(localStorage.getItem('committee_members') || '[]'));
      }
    } catch (e) {
      setCommitteeList(JSON.parse(localStorage.getItem('committee_members') || '[]'));
    }

    // Load Results
    try {
      const { data, error } = await supabase.from('results').select('*').order('id', { ascending: false });
      if (!error && data) {
        setResultsList(data);
      } else {
        setResultsList(JSON.parse(localStorage.getItem('results') || '[]'));
      }
    } catch (e) {
      setResultsList(JSON.parse(localStorage.getItem('results') || '[]'));
    }

    // Load Routine
    try {
      const { data, error } = await supabase.from('routines').select('*').order('id', { ascending: true });
      if (!error && data) {
        setRoutineList(data);
      } else {
        setRoutineList(JSON.parse(localStorage.getItem('routines') || '[]'));
      }
    } catch (e) {
      setRoutineList(JSON.parse(localStorage.getItem('routines') || '[]'));
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
      // Save gender locally in fallback mapping
      const savedGenders = JSON.parse(localStorage.getItem('student_genders') || '{}');
      savedGenders[studentForm.roll_no] = studentForm.gender || 'Male';
      localStorage.setItem('student_genders', JSON.stringify(savedGenders));

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
        class: 'দাখিল ১০ম শ্রেণি',
        section_or_department: 'সাধারণ বিভাগ',
        guardian_name: '',
        phone: '',
        gender: 'Male'
      });
      loadDatabaseData();
    } catch (err) {
      console.error("Error adding student:", err);
      triggerToast('ভর্তি ডেটাবেসে যোগ করতে সমস্যা হয়েছে: ' + err.message, 'error');
    }
  };

  // Handle Teacher Addition
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

  // Handle New Admin User
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!userForm.name.trim() || !userForm.username_or_email.trim() || !userForm.password) {
      triggerToast('অনুগ্রহ করে নাম, ইমেল/ইউজারনেম এবং পাসওয়ার্ড পূরণ করুন।', 'error');
      return;
    }

    try {
      const today = new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
      await createNewUser({
        name: userForm.name.trim(),
        username_or_email: userForm.username_or_email.trim().toLowerCase(),
        password: userForm.password,
        phone: userForm.phone.trim(),
        role: userForm.role,
        designation: userForm.designation.trim() || (userForm.role === 'teacher' ? 'সহকারী শিক্ষক' : 'শিক্ষার্থী'),
        department: userForm.department.trim() || 'সাধারণ বিভাগ',
        joinDate: today,
        avatarBg: userForm.role === 'teacher' ? 'bg-emerald-700' : 'bg-teal-700'
      });

      triggerToast('নতুন অ্যাডমিন/ইউজার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
      setUserForm({
        name: '',
        username_or_email: '',
        password: '',
        phone: '',
        role: 'teacher',
        designation: '',
        department: 'সাধারণ বিভাগ'
      });
    } catch (err) {
      console.error("Error creating user:", err);
      triggerToast('ইউজার অ্যাকাউন্ট তৈরিতে সমস্যা হয়েছে: ' + err.message, 'error');
    }
  };

  // Handle Committee Submission
  const handleCommitteeSubmit = async (e) => {
    e.preventDefault();
    if (!committeeForm.name.trim() || !committeeForm.phone.trim()) {
      triggerToast('নাম ও মোবাইল নম্বর পূরণ করুন।', 'error');
      return;
    }

    const newMember = {
      id: Date.now(),
      name: committeeForm.name.trim(),
      designation: committeeForm.designation,
      phone: committeeForm.phone.trim(),
      email: committeeForm.email.trim() || null,
      created_at: new Date().toISOString()
    };

    // Save locally
    const local = JSON.parse(localStorage.getItem('committee_members') || '[]');
    const updated = [...local, newMember];
    localStorage.setItem('committee_members', JSON.stringify(updated));
    setCommitteeList(updated);

    triggerToast('নতুন কমিটির সদস্য সফলভাবে যোগ হয়েছে!');
    setCommitteeForm({ name: '', designation: 'সভাপতি', phone: '', email: '' });

    // Try Supabase insert
    try {
      await supabase.from('committee_members').insert([
        {
          name: newMember.name,
          designation: newMember.designation,
          phone: newMember.phone,
          email: newMember.email
        }
      ]);
    } catch (err) {
      console.log("Supabase insert ignored for committee:", err.message);
    }
  };

  // Handle Result Submission
  const handleResultSubmit = async (e) => {
    e.preventDefault();
    if (!resultForm.student_name.trim() || !resultForm.roll_no || !resultForm.gpa) {
      triggerToast('সকল প্রয়োজনীয় ঘর পূরণ করুন।', 'error');
      return;
    }

    const newResult = {
      id: Date.now(),
      student_name: resultForm.student_name.trim(),
      roll_no: parseInt(resultForm.roll_no, 10),
      class: resultForm.class,
      exam_type: resultForm.exam_type,
      gpa: parseFloat(resultForm.gpa),
      grade: resultForm.grade,
      created_at: new Date().toISOString()
    };

    // Save locally
    const local = JSON.parse(localStorage.getItem('results') || '[]');
    const updated = [...local, newResult];
    localStorage.setItem('results', JSON.stringify(updated));
    setResultsList(updated);

    triggerToast('পরীক্ষার ফলাফল সফলভাবে যোগ হয়েছে!');
    setResultForm({
      student_name: '',
      roll_no: '',
      class: 'দাখিল ১০ম শ্রেণি',
      exam_type: 'বার্ষিক পরীক্ষা',
      gpa: '',
      grade: 'A+'
    });

    // Try Supabase insert
    try {
      await supabase.from('results').insert([
        {
          student_name: newResult.student_name,
          roll_no: newResult.roll_no,
          class: newResult.class,
          exam_type: newResult.exam_type,
          gpa: newResult.gpa,
          grade: newResult.grade
        }
      ]);
    } catch (err) {
      console.log("Supabase insert ignored for results:", err.message);
    }
  };

  // Handle Routine Submission
  const handleRoutineSubmit = async (e) => {
    e.preventDefault();
    if (!routineForm.subject.trim() || !routineForm.teacher_name.trim()) {
      triggerToast('বিষয় ও শিক্ষকের নাম পূরণ করুন।', 'error');
      return;
    }

    const newRoutine = {
      id: Date.now(),
      day: routineForm.day,
      class: routineForm.class,
      subject: routineForm.subject.trim(),
      time_slot: routineForm.time_slot,
      teacher_name: routineForm.teacher_name.trim(),
      created_at: new Date().toISOString()
    };

    // Save locally
    const local = JSON.parse(localStorage.getItem('routines') || '[]');
    const updated = [...local, newRoutine];
    localStorage.setItem('routines', JSON.stringify(updated));
    setRoutineList(updated);

    triggerToast('নতুন ক্লাস রুটিন সফলভাবে যোগ হয়েছে!');
    setRoutineForm({
      day: 'শনিবার',
      class: 'দাখিল ১০ম শ্রেণি',
      subject: '',
      time_slot: '০৯:০০ - ০৯:৪৫',
      teacher_name: ''
    });

    // Try Supabase insert
    try {
      await supabase.from('routines').insert([
        {
          day: newRoutine.day,
          class: newRoutine.class,
          subject: newRoutine.subject,
          time_slot: newRoutine.time_slot,
          teacher_name: newRoutine.teacher_name
        }
      ]);
    } catch (err) {
      console.log("Supabase insert ignored for routines:", err.message);
    }
  };

  // Handle Homepage Achievements Submission
  const handleAchievementSubmit = async (e) => {
    e.preventDefault();
    if (!achievementForm.student_name.trim() || !achievementForm.headline.trim() || !achievementForm.description.trim()) {
      triggerToast('সকল প্রয়োজনীয় ঘর পূরণ করুন।', 'error');
      return;
    }

    const newAchievement = {
      id: Date.now(),
      name: achievementForm.student_name.trim(),
      class: achievementForm.student_class,
      achievement: achievementForm.headline.trim(),
      fullDetails: achievementForm.description.trim(),
      avatarColor: "bg-emerald-800 text-amber-300",
      initials: achievementForm.student_name.trim().substring(0, 2),
      student_name: achievementForm.student_name.trim(),
      student_class: achievementForm.student_class,
      headline: achievementForm.headline.trim(),
      description: achievementForm.description.trim(),
      image_url: achievementForm.image_url.trim() || null,
      created_at: new Date().toISOString()
    };

    // Save locally
    const local = JSON.parse(localStorage.getItem('achievements') || '[]');
    localStorage.setItem('achievements', JSON.stringify([...local, newAchievement]));

    triggerToast('শিক্ষার্থীর সাফল্য সফলভাবে যুক্ত করা হয়েছে!');
    setAchievementForm({
      student_name: '',
      student_class: 'দাখিল ১০ম শ্রেণি',
      headline: '',
      description: '',
      image_url: ''
    });
    setShowAchievementModal(false);

    // Try Supabase insert
    try {
      const { error } = await supabase.from('achievements').insert([
        {
          student_name: newAchievement.student_name,
          student_class: newAchievement.student_class,
          headline: newAchievement.headline,
          description: newAchievement.description,
          image_url: newAchievement.image_url
        }
      ]);
      if (error) throw error;
      alert("সফলভাবে ডাটাবেসে জমা হয়েছে!");
    } catch (err) {
      alert("ডাটা জমা হয়নি! কারণ: " + err.message);
    }
  };

  // Handle Homepage Memorial Submission
  const handleMemorialSubmit = async (e) => {
    e.preventDefault();
    if (!memorialForm.member_name.trim() || !memorialForm.lifespan.trim() || !memorialForm.contribution_headline.trim() || !memorialForm.contribution_details.trim()) {
      triggerToast('সকল প্রয়োজনীয় ঘর পূরণ করুন।', 'error');
      return;
    }

    const newMemorial = {
      id: Date.now(),
      name: memorialForm.member_name.trim(),
      lifetime: memorialForm.lifespan.trim(),
      contribution: memorialForm.contribution_headline.trim(),
      bio: memorialForm.contribution_details.trim(),
      member_name: memorialForm.member_name.trim(),
      lifespan: memorialForm.lifespan.trim(),
      contribution_headline: memorialForm.contribution_headline.trim(),
      contribution_details: memorialForm.contribution_details.trim(),
      created_at: new Date().toISOString()
    };

    // Save locally
    const local = JSON.parse(localStorage.getItem('memoriam_members') || '[]');
    localStorage.setItem('memoriam_members', JSON.stringify([...local, newMemorial]));

    triggerToast('কমিটির স্মরণীয় ব্যক্তি সফলভাবে যুক্ত করা হয়েছে!');
    setMemorialForm({
      member_name: '',
      lifespan: '',
      contribution_headline: '',
      contribution_details: ''
    });
    setShowMemorialModal(false);

    // Try Supabase insert
    try {
      await supabase.from('memorial_committee').insert([
        {
          member_name: newMemorial.member_name,
          lifespan: newMemorial.lifespan,
          contribution_headline: newMemorial.contribution_headline,
          contribution_details: newMemorial.contribution_details
        }
      ]);
    } catch (err) {
      console.log("Supabase insert ignored for memorial_committee:", err.message);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "শুভ সকাল";
    if (hour >= 12 && hour < 16) return "শুভ অপরাহ্ন";
    if (hour >= 16 && hour < 19) return "শুভ বিকেল";
    return "শুভ রাত";
  };

  return (
    <div className={`flex flex-col md:flex-row min-h-screen text-emerald-100 font-sans ${
      isDarkMode ? 'bg-[#0a0f0d]' : 'bg-[#f4f6f5] text-slate-800'
    }`}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatUpDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes goldGlow {
          0%, 100% { box-shadow: 0 4px 20px rgba(5, 50, 33, 0.3), 0 0 15px rgba(212, 175, 55, 0.15), inset 0 0 10px rgba(212, 175, 55, 0.1); border-color: rgba(212, 175, 55, 0.25); }
          50% { box-shadow: 0 4px 30px rgba(5, 50, 33, 0.5), 0 0 25px rgba(212, 175, 55, 0.35), inset 0 0 15px rgba(212, 175, 55, 0.25); border-color: rgba(212, 175, 55, 0.5); }
        }
        .animate-avatar-float {
          animation: floatUpDown 4s infinite ease-in-out;
        }
        .animate-avatar-glow {
          animation: goldGlow 3s infinite ease-in-out;
        }
        .sidebar-nav-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sidebar-nav-item:hover {
          transform: translateX(6px);
        }
      `}} />
      
      {/* Toast Notification Alert */}
      {toastMsg && (
        <div className={`fixed top-6 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-2 border animate-bounce ${
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

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-over Sidebar Drawer */}
      <aside className={`fixed top-0 bottom-0 left-0 w-72 max-w-[80vw] z-50 md:hidden flex flex-col justify-between p-6 transition-transform duration-300 transform shadow-2xl border-r ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        isDarkMode 
          ? 'bg-[#020b06] border-[#d4af37]/20 text-emerald-150' 
          : 'bg-white border-gray-200 text-slate-700'
      }`}>
        <div className="space-y-8">
          {/* Drawer Header with Close Button */}
          <div className="flex items-center justify-between pb-5 border-b border-emerald-900/30">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/5 rounded-2xl p-1 border border-emerald-500/25 flex items-center justify-center">
                <img src="/photo/logo.png" alt="মাদ্রাসা লোগো" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-black text-xs tracking-wider uppercase text-amber-400 block font-serif">Supia Nuria</span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-550">Admin Portal</span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-1.5 rounded-xl border transition-all ${
                isDarkMode ? 'bg-[#06120c] border-emerald-900/50 text-amber-400' : 'bg-slate-100 border-gray-300 text-slate-600'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {[
              { id: 'home', label: 'ড্যাশবোর্ড', icon: Home },
              { id: 'students', label: 'শিক্ষার্থী', icon: UserPlus },
              { id: 'teachers', label: 'শিক্ষক', icon: Users },
              { id: 'committee', label: 'মাদ্রাসার কমিটির সদস্যগন', icon: Award },
              { id: 'result', label: 'রেজাল্ট', icon: Trophy },
              { id: 'routine', label: 'রুটিন', icon: Calendar },
              { id: 'messages', label: 'মেসেজ ইনবক্স', icon: Mail },
              { id: 'settings', label: 'এডমিন সেটিংস', icon: Settings },
              { id: 'homepage_update', label: 'হোমপেজ আপডেট', icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer sidebar-nav-item border ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/15 border-amber-400'
                      : isDarkMode 
                        ? 'bg-[#03140c]/40 border-transparent hover:bg-[#062416]/60 text-emerald-100 hover:text-amber-300 hover:border-amber-500/30' 
                        : 'bg-slate-50 border-transparent hover:bg-slate-100 text-slate-700 hover:text-emerald-800'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Drawer Footer */}
        <div className="pt-6 border-t border-emerald-900/30 space-y-4">
          <div className={`flex items-center gap-3 p-3 rounded-2xl border ${
            isDarkMode ? 'bg-[#06120c] border-emerald-900/40' : 'bg-slate-50 border-gray-200'
          }`}>
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/35 shrink-0">
              <Lock className="h-4 w-4 text-amber-300" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-wider">Authenticated Admin</p>
              <p className={`text-xs font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{adminUser?.name || 'প্রধান শিক্ষক'}</p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-rose-950/50 hover:bg-rose-950/20 hover:border-rose-500 text-rose-300 hover:text-white font-black text-xs rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>লগআউট করুন</span>
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar Navigation */}
      <aside className={`hidden md:flex w-68 shrink-0 flex-col justify-between p-6 border-r transition-all duration-500 relative z-40 ${
        isDarkMode 
          ? 'bg-[#020b06] border-[#d4af37]/10 text-emerald-150 hover:border-[#d4af37]/30' 
          : 'bg-white border-gray-200 text-slate-700'
      }`}>
        <div className="space-y-8">
          
          {/* Header/Logo Brand */}
          <div className="pb-5 border-b border-emerald-900/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 rounded-2xl p-1.5 border border-emerald-500/25 flex items-center justify-center shadow-inner">
                <img src="/photo/logo.png" alt="মাদ্রাসা লোগো" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-black text-sm tracking-wider uppercase text-amber-400 block font-serif">Supia Nuria</span>
                <span className={`text-[10px] uppercase font-bold tracking-widest ${isDarkMode ? 'text-emerald-550' : 'text-slate-400'}`}>Admin Portal</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {[
              { id: 'home', label: 'ড্যাশবোর্ড', icon: Home },
              { id: 'students', label: 'শিক্ষার্থী', icon: UserPlus },
              { id: 'teachers', label: 'শিক্ষক', icon: Users },
              { id: 'committee', label: 'মাদ্রাসার কমিটির সদস্যগন', icon: Award },
              { id: 'result', label: 'রেজাল্ট', icon: Trophy },
              { id: 'routine', label: 'রুটিন', icon: Calendar },
              { id: 'messages', label: 'মেসেজ ইনবক্স', icon: Mail },
              { id: 'settings', label: 'এডমিন সেটিংস', icon: Settings },
              { id: 'homepage_update', label: 'হোমপেজ আপডেট', icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer sidebar-nav-item border ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/15 border-amber-400'
                      : isDarkMode 
                        ? 'bg-[#03140c]/40 border-transparent hover:bg-[#062416]/60 text-emerald-100 hover:text-amber-300 hover:border-amber-500/30' 
                        : 'bg-slate-50 border-transparent hover:bg-slate-100 text-slate-700 hover:text-emerald-800'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Luxurious Profile Card */}
        <div className="pt-6 border-t border-emerald-900/30 space-y-4">
          <div className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
            isDarkMode 
              ? 'bg-[#06120c] border-emerald-900/40' 
              : 'bg-slate-50 border-gray-200'
          }`}>
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/35 shrink-0">
              <Lock className="h-4.5 w-4.5 text-amber-300" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">Authenticated Admin</p>
              <p className={`text-xs font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{adminUser?.name || 'প্রধান শিক্ষক'}</p>
              <p className="text-[10px] text-gray-500 truncate">{adminUser?.designation || 'মুহতামিম'}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-rose-950/50 hover:bg-rose-950/20 hover:border-rose-500 text-rose-300 hover:text-white font-black text-xs rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>লগআউট করুন</span>
          </button>
        </div>

      </aside>

      {/* Main Dynamic View Workspace */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Navbar Title & Control Items */}
        <header className={`py-4 px-6 md:px-8 flex items-center justify-between border-b backdrop-blur-md sticky top-0 z-30 transition-all ${
          isDarkMode 
            ? 'bg-[#040907]/85 border-[#162720]/40' 
            : 'bg-white/95 border-gray-200'
        }`}>
          {/* Left section with mobile hamburger menu and search */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={`md:hidden p-2 rounded-xl border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-[#06120c] border-[#d4af37]/20 text-amber-400 hover:border-[#d4af37]/45' 
                  : 'bg-slate-100 border-gray-300 text-slate-655'
              }`}
              title="মেনু খুলুন"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>

            {/* Search */}
            <div className="relative w-40 sm:w-64 max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-emerald-600/70" />
              </span>
              <input
                type="text"
                placeholder="সার্চ করুন..."
                className={`w-full border rounded-xl pl-9 pr-3 py-1.5 text-xs font-sans focus:outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-[#06120c] border-emerald-900/60 text-white placeholder-emerald-850 focus:border-amber-400' 
                    : 'bg-slate-100 border-gray-300 text-slate-900 placeholder-slate-400 focus:border-emerald-650'
                }`}
              />
            </div>
          </div>

          {/* Right Action panel */}
          <div className="flex items-center gap-4">
            
            {/* Dark Mode toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-[#06120c] border-emerald-900/50 text-amber-400 hover:bg-white/5' 
                  : 'bg-slate-100 border-gray-300 text-slate-600 hover:bg-slate-200'
              }`}
              title="থিম পরিবর্তন করুন"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notification */}
            <div className="relative">
              <button className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-[#06120c] border-emerald-900/50 text-emerald-300' 
                  : 'bg-slate-100 border-gray-300 text-slate-600'
              }`}>
                <Bell className="h-4 w-4" />
              </button>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full"></span>
            </div>

            {/* Profile Avatar */}
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-xs text-amber-300 shadow-inner">
              {adminUser?.name ? adminUser.name.split(' ').slice(-1)[0][0] : 'A'}
            </div>
          </div>
        </header>

        {/* Content View Area */}
        <div className="p-6 md:p-8 flex-1">
          {loading ? (
            <div className="h-[50vh] flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
              <p className="text-xs text-emerald-450 mt-3 font-semibold">লাইভ ডাটাবেস সিঙ্ক হচ্ছে...</p>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Tab 1: Dashboard Home */}
              {activeTab === 'home' && (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* Main Welcome Banner (Gradient emerald banner matching reference layout) */}
                  <div className="bg-gradient-to-r from-[#032416] via-[#09472e] to-[#032416] border border-emerald-500/20 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
                    <div className="space-y-2.5 max-w-xl text-center sm:text-left z-10 flex flex-col items-center sm:items-start">
                      <span className="bg-amber-500/10 text-amber-300 text-[10px] font-black uppercase tracking-wider py-1 px-3.5 rounded-full border border-amber-500/25 self-center sm:self-start">
                        Isolated Control Panel
                      </span>
                      <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                        আসসালামু প্রিয় এডমিন, {getGreeting()}
                      </h2>
                      <div className="inline-block bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold px-4 py-1.5 rounded-xl text-base sm:text-lg md:text-xl shadow-md tracking-wide font-sans my-1">
                        {adminUser?.email || adminUser?.username_or_email || 'admin@madrasah.edu'}
                      </div>
                      <p className="text-xs md:text-sm text-emerald-200 leading-relaxed font-semibold pt-1">
                        সুফিয়া নূরিয়া দাখিল মাদ্রাসা নিয়ন্ত্রণ প্যানেলে আপনাকে স্বাগতম। আপনি এখান থেকে ভর্তি প্রক্রিয়া, শিক্ষক তথ্য এবং বার্তা নিয়ন্ত্রণ করতে পারবেন।
                      </p>
                    </div>

                    {/* Right side illustration / Animated Premium Admin Avatar */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 text-amber-400 bg-emerald-950/40 rounded-full p-4 border border-amber-500/35 flex items-center justify-center shadow-2xl z-10 animate-avatar-float animate-avatar-glow hover:scale-105 transition-transform duration-300">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-500/20 to-emerald-900/40 flex items-center justify-center border border-amber-500/20 shadow-inner">
                        <UserCheck className="w-12 h-12 text-amber-400 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Check Message */}
                  <div className={`p-4 rounded-2xl border-l-4 border-amber-500 text-xs md:text-sm font-semibold transition-all ${
                    isDarkMode ? 'bg-[#06120c] border-[#162720]/40 text-emerald-100' : 'bg-amber-50 border-amber-200 text-slate-800'
                  }`}>
                    <span className="font-bold text-amber-800 block mb-1">সিস্টেম সিকিউর কানেকশন:</span>
                    <p className="leading-relaxed">
                      ✓ সুপাবেস ডাটাবেস সিকিউর কানেকশন সক্রিয়। সমস্ত শিক্ষার্থী ভর্তি ও শিক্ষক পরিচিতির ডেটাবেস অপারেশন রিয়েল-টাইমে মূল সার্ভারের সাথে সিঙ্ক হচ্ছে।
                    </p>
                  </div>

                  {/* Stats Summary Grid (238961.jpg layout style, glassmorphic cards with golden shadows) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Students card */}
                    <div className={`border rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 group shadow-[0_4px_30px_rgba(0,0,0,0.15)] ${
                      isDarkMode 
                        ? 'bg-white/5 border-white/10 hover:border-amber-500/30' 
                        : 'bg-white border-gray-200 hover:border-emerald-600/40 text-slate-850'
                    }`}>
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600/30"></div>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1.5">
                          <span className="text-gray-400 block text-[10px] font-black uppercase tracking-wider">মোট শিক্ষার্থী ভর্তি</span>
                          <span className={`text-4xl font-black font-sans ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats.students}</span>
                        </div>
                        <div className="p-3.5 bg-amber-500/10 text-amber-400 rounded-2xl">
                          <UserPlus className="h-6.5 w-6.5" />
                        </div>
                      </div>
                      <p className="text-[10px] text-emerald-550 mt-5 font-bold">● Active database rows</p>
                    </div>

                    {/* Teachers count */}
                    <div className={`border rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 group shadow-[0_4px_30px_rgba(0,0,0,0.15)] ${
                      isDarkMode 
                        ? 'bg-white/5 border-white/10 hover:border-emerald-500/30' 
                        : 'bg-white border-gray-200 hover:border-emerald-600/40 text-slate-850'
                    }`}>
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600/30"></div>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1.5">
                          <span className="text-gray-400 block text-[10px] font-black uppercase tracking-wider">নিবন্ধিত শিক্ষক পরিচিতি</span>
                          <span className={`text-4xl font-black font-sans ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats.teachers}</span>
                        </div>
                        <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                          <Users className="h-6.5 w-6.5" />
                        </div>
                      </div>
                      <p className="text-[10px] text-emerald-550 mt-5 font-bold">● Active database rows</p>
                    </div>

                    {/* Messages count */}
                    <div className={`border rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 group shadow-[0_4px_30px_rgba(0,0,0,0.15)] ${
                      isDarkMode 
                        ? 'bg-white/5 border-white/10 hover:border-amber-500/30' 
                        : 'bg-white border-gray-200 hover:border-emerald-600/40 text-slate-850'
                    }`}>
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500/70 to-amber-600/20"></div>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1.5">
                          <span className="text-gray-400 block text-[10px] font-black uppercase tracking-wider">নতুন ইউজার মেসেজ</span>
                          <span className={`text-4xl font-black font-sans ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats.messages}</span>
                        </div>
                        <div className="p-3.5 bg-amber-500/10 text-amber-400 rounded-2xl">
                          <Mail className="h-6.5 w-6.5" />
                        </div>
                      </div>
                      <p className="text-[10px] text-emerald-550 mt-5 font-bold">● Active database rows</p>
                    </div>
                  </div>

                  {/* General Stats notice */}
                  <div className={`border rounded-3xl p-6 shadow-xl ${
                    isDarkMode ? 'bg-[#031d12] border-emerald-900/30' : 'bg-emerald-50 border-emerald-200 text-slate-800'
                  }`}>
                    <h4 className="text-base font-bold text-amber-400 mb-3">মাদ্রাসা সেন্ট্রাল কন্ট্রোল ডিরেক্টিভস</h4>
                    <p className="text-xs leading-relaxed text-justify font-semibold">
                      এই স্বাধীন অ্যাডমিন পোর্টালটির সাথে শেয়ার্ড সুপাবেস ডাটাবেস সরাসরি লিংক করা রয়েছে। এখানে আপনার নেওয়া ভর্তি ও শিক্ষক সংক্রান্ত কার্যক্রম মূল ওয়েবসাইটে তৎক্ষণাৎ আপডেট হবে। যেকোনো অ্যাকাউন্ট সিকিউরিটি নিশ্চিত করতে প্রতি সেশন শেষে অবশ্যই লগআউট করতে ভুলবেন না।
                    </p>
                  </div>

                </div>
              )}

              {/* Tab 2: Students Admission & Database Table */}
              {activeTab === 'students' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Class Selection Navigation buttons */}
                  <div className="flex flex-wrap gap-2 pb-4 border-b border-emerald-900/10">
                    {[
                      "শিশু শ্রেণি", "১ম শ্রেণি", "২য় শ্রেণি", "৩য় শ্রেণি", "৪র্থ শ্রেণি", "৫ম শ্রেণি",
                      "দাখিল ৬ষ্ঠ শ্রেণি", "দাখিল ৭ম শ্রেণি", "দাখিল ৮ম শ্রেণি", "দাখিল ৯ম শ্রেণি", "দাখিল ১০ম শ্রেণি",
                      "হিফজ বিভাগ", "নূরানী বিভাগ"
                    ].map((cls) => (
                      <button
                        key={cls}
                        onClick={() => setSelectedClass(cls)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          selectedClass === cls
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                            : isDarkMode
                              ? 'bg-[#031d12]/60 border-emerald-900/50 hover:bg-[#062c1b]/80 text-emerald-100 hover:text-amber-300'
                              : 'bg-white border-gray-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>

                  {/* Math Stats Card (Gender calculation / percents) */}
                  {(() => {
                    const normalizeClass = (cls) => {
                      if (!cls) return "";
                      return cls.replace(/শ্রেণী/g, "শ্রেণি").trim();
                    };
                    const selectedClassStudents = studentsList.filter(stu => normalizeClass(stu.class) === normalizeClass(selectedClass));
                    const totalInClass = selectedClassStudents.length;
                    const maleInClass = selectedClassStudents.filter(s => s.gender === 'Male').length;
                    const femaleInClass = selectedClassStudents.filter(s => s.gender === 'Female').length;
                    const malePercent = totalInClass > 0 ? ((maleInClass / totalInClass) * 100).toFixed(0) : 0;
                    const femalePercent = totalInClass > 0 ? ((femaleInClass / totalInClass) * 100).toFixed(0) : 0;

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className={`p-5 rounded-3xl border transition-all ${
                          isDarkMode ? 'bg-white/5 border-white/10 text-emerald-100' : 'bg-white border-gray-200 text-slate-800'
                        } shadow-lg relative overflow-hidden`}>
                          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
                          <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider">মোট শিক্ষার্থী ({selectedClass})</p>
                          <p className="text-3xl font-black mt-1.5 text-white">{totalInClass} জন</p>
                        </div>

                        <div className={`p-5 rounded-3xl border transition-all ${
                          isDarkMode ? 'bg-white/5 border-white/10 text-emerald-100' : 'bg-white border-gray-200 text-slate-800'
                        } shadow-lg relative overflow-hidden`}>
                          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
                          <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider">ছাত্র (Male)</p>
                          <p className="text-3xl font-black mt-1.5 text-emerald-400">
                            {maleInClass} জন <span className="text-xs text-amber-300 font-bold">({malePercent}%)</span>
                          </p>
                        </div>

                        <div className={`p-5 rounded-3xl border transition-all ${
                          isDarkMode ? 'bg-white/5 border-white/10 text-emerald-100' : 'bg-white border-gray-200 text-slate-800'
                        } shadow-lg relative overflow-hidden`}>
                          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-500 to-pink-600"></div>
                          <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider">ছাত্রী (Female)</p>
                          <p className="text-3xl font-black mt-1.5 text-pink-400">
                            {femaleInClass} জন <span className="text-xs text-amber-300 font-bold">({femalePercent}%)</span>
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* Student Admission Form */}
                    <div className={`border rounded-3xl p-6 shadow-xl ${
                      isDarkMode ? 'bg-[#031d12] border-emerald-900/40' : 'bg-white border-gray-200 text-slate-900'
                    }`}>
                      <h3 className="text-base font-bold text-amber-400 border-b border-emerald-900/40 pb-3 mb-5 flex items-center gap-2">
                        <UserPlus className="h-5 w-5 shrink-0" />
                        <span>শিক্ষার্থী ভর্তি আবেদন ফরম</span>
                      </h3>

                      <form onSubmit={handleStudentSubmit} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-emerald-455 mb-1">শিক্ষার্থীর সম্পূর্ণ নাম *</label>
                          <input
                            type="text"
                            required
                            value={studentForm.name}
                            onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                            className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                              isDarkMode 
                                ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' 
                                : 'bg-slate-50 border-gray-350 text-slate-950 focus:border-emerald-600'
                            }`}
                            placeholder="শিক্ষার্থীর সম্পূর্ণ নাম লিখুন"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-emerald-455 mb-1">রোল নম্বর *</label>
                            <input
                              type="number"
                              required
                              value={studentForm.roll_no}
                              onChange={(e) => setStudentForm({ ...studentForm, roll_no: e.target.value })}
                              className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                isDarkMode 
                                  ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' 
                                  : 'bg-slate-50 border-gray-355 text-slate-950 focus:border-emerald-600'
                              }`}
                              placeholder="১০০১"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-emerald-455 mb-1">লিঙ্গ (Gender) *</label>
                            <select
                              value={studentForm.gender}
                              onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
                              className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                isDarkMode 
                                  ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' 
                                  : 'bg-slate-50 border-gray-350 text-slate-950'
                              }`}
                            >
                              <option value="Male">ছাত্র (Male)</option>
                              <option value="Female">ছাত্রী (Female)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-emerald-455 mb-1">শ্রেণী নির্বাচন করুন *</label>
                          <select
                            value={studentForm.class}
                            onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                            className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                              isDarkMode 
                                ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' 
                                : 'bg-slate-50 border-gray-350 text-slate-950'
                            }`}
                          >
                            {[
                              "শিশু শ্রেণি", "১ম শ্রেণি", "২য় শ্রেণি", "৩য় শ্রেণি", "৪র্থ শ্রেণি", "৫ম শ্রেণি",
                              "দাখিল ৬ষ্ঠ শ্রেণি", "দাখিল ৭ম শ্রেণি", "দাখিল ৮ম শ্রেণি", "দাখিল ৯ম শ্রেণি", "দাখিল ১০ম শ্রেণি",
                              "হিফজ বিভাগ", "নূরানী বিভাগ"
                            ].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-emerald-455 mb-1">বিভাগ/শাখা *</label>
                          <input
                            type="text"
                            required
                            value={studentForm.section_or_department}
                            onChange={(e) => setStudentForm({ ...studentForm, section_or_department: e.target.value })}
                            className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                              isDarkMode 
                                ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' 
                                : 'bg-slate-50 border-gray-350 text-slate-955'
                            }`}
                            placeholder="সাধারণ বিভাগ"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-emerald-455 mb-1">অভিভাবকের নাম *</label>
                          <input
                            type="text"
                            required
                            value={studentForm.guardian_name}
                            onChange={(e) => setStudentForm({ ...studentForm, guardian_name: e.target.value })}
                            className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                              isDarkMode 
                                ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' 
                                : 'bg-slate-50 border-gray-350 text-slate-955'
                            }`}
                            placeholder="পিতা বা মাতার নাম"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-emerald-455 mb-1">মোবাইল নম্বর *</label>
                          <input
                            type="text"
                            required
                            value={studentForm.phone}
                            onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                            className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                              isDarkMode 
                                ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' 
                                : 'bg-slate-50 border-gray-350 text-slate-955 font-sans'
                            }`}
                            placeholder="১১ ডিজিটের মোবাইল নম্বর"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl active:scale-95 transition-all shadow-md mt-5 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="h-4.5 w-4.5" />
                          <span>ভর্তি সম্পন্ন করুন</span>
                        </button>
                      </form>
                    </div>

                    {/* Student database table view */}
                    <div className={`border rounded-3xl p-6 shadow-xl lg:col-span-2 overflow-hidden flex flex-col justify-start ${
                      isDarkMode ? 'bg-[#031d12] border-emerald-900/40' : 'bg-white border-gray-200'
                    }`}>
                      <h3 className="text-base font-bold text-amber-400 border-b border-emerald-900/40 pb-3 mb-5 flex items-center justify-between">
                        <span>ভর্তিকৃত শিক্ষার্থী তালিকা - {selectedClass}</span>
                        <span className="text-[10px] text-gray-500 font-bold bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
                          সুপাবেস লাইভ সিঙ্ক
                        </span>
                      </h3>

                      <div className="overflow-x-auto scrollbar-none">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                          <thead>
                            <tr className={`border-b text-amber-450 font-bold ${
                              isDarkMode ? 'bg-[#02100a]/80 border-emerald-900' : 'bg-slate-50 border-gray-250 text-emerald-850'
                            }`}>
                              <th className="py-3 px-3.5">রোল</th>
                              <th className="py-3 px-3.5">নাম</th>
                              <th className="py-3 px-3.5">লিঙ্গ</th>
                              <th className="py-3 px-3.5">শ্রেণী</th>
                              <th className="py-3 px-3.5">বিভাগ</th>
                              <th className="py-3 px-3.5">মোবাইল</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-emerald-900/20">
                            {(() => {
                              const normalizeClass = (cls) => {
                                if (!cls) return "";
                                return cls.replace(/শ্রেণী/g, "শ্রেণি").trim();
                              };
                              const list = studentsList.filter(stu => normalizeClass(stu.class) === normalizeClass(selectedClass));
                              return list.length > 0 ? (
                                list.map((stu, idx) => (
                                  <tr key={idx} className={`font-semibold font-sans transition-colors ${
                                    isDarkMode ? 'hover:bg-white/5 text-emerald-100' : 'hover:bg-slate-50 text-slate-800'
                                  }`}>
                                    <td className="py-3 px-3.5 font-bold text-amber-300">{stu.roll_no}</td>
                                    <td className={`py-3 px-3.5 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stu.name}</td>
                                    <td className="py-3 px-3.5">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        stu.gender === 'Male' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-pink-500/10 text-pink-400'
                                      }`}>
                                        {stu.gender === 'Male' ? 'ছাত্র' : 'ছাত্রী'}
                                      </span>
                                    </td>
                                    <td className="py-3 px-3.5">{stu.class}</td>
                                    <td className="py-3 px-3.5 text-emerald-400">{stu.section_or_department || 'সাধারণ বিভাগ'}</td>
                                    <td className="py-3 px-3.5 font-sans">{stu.phone}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="6" className="py-8 text-center text-gray-400 font-bold">এই ক্লাসে কোনো শিক্ষার্থী ভর্তি নেই।</td>
                                </tr>
                              );
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Tab 3: Teachers Management */}
              {activeTab === 'teachers' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
                  
                  {/* Teacher Add Form */}
                  <div className={`border rounded-3xl p-6 shadow-xl ${
                    isDarkMode ? 'bg-[#031d12] border-emerald-900/40' : 'bg-white border-gray-200 text-slate-900'
                  }`}>
                    <h3 className="text-base font-bold text-amber-400 border-b border-emerald-900/40 pb-3 mb-5 flex items-center gap-2">
                      <Plus className="h-5 w-5 shrink-0" />
                      <span>শিক্ষক পরিচিতি যোগ করুন</span>
                    </h3>

                    <form onSubmit={handleTeacherSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-450 mb-1">শিক্ষকের নাম *</label>
                        <input
                          type="text"
                          required
                          value={teacherForm.name}
                          onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                          className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                            isDarkMode 
                              ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' 
                              : 'bg-slate-50 border-gray-350 text-slate-950'
                          }`}
                          placeholder="মাওলানা আব্দুর রহমান"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-450 mb-1">পদবী *</label>
                        <input
                          type="text"
                          required
                          value={teacherForm.designation}
                          onChange={(e) => setTeacherForm({ ...teacherForm, designation: e.target.value })}
                          className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                            isDarkMode 
                              ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' 
                              : 'bg-slate-50 border-gray-350 text-slate-955'
                          }`}
                          placeholder="উদা: সহকারী শিক্ষক / মুহতামিম"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-455 mb-1">বিভাগ</label>
                        <input
                          type="text"
                          value={teacherForm.department}
                          onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })}
                          className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                            isDarkMode 
                              ? 'bg-[#02100a] border-emerald-800/60 text-white' 
                              : 'bg-slate-50 border-gray-350'
                          }`}
                          placeholder="উদা: শরিয়াহ ও আরবি সাহিত্য"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-455 mb-1">মোবাইল নম্বর *</label>
                        <input
                          type="text"
                          required
                          value={teacherForm.phone}
                          onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                          className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                            isDarkMode 
                              ? 'bg-[#02100a] border-emerald-800/60 text-white' 
                              : 'bg-slate-50 border-gray-350 font-sans'
                          }`}
                          placeholder="০১৭০০-০০০০০০"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-455 mb-1">ইমেইল</label>
                        <input
                          type="email"
                          value={teacherForm.email}
                          onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                          className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                            isDarkMode 
                              ? 'bg-[#02100a] border-emerald-800/60 text-white' 
                              : 'bg-slate-50 border-gray-355 font-sans'
                          }`}
                          placeholder="teacher@madrasah.edu"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-455 mb-1">যোগদানের তারিখ</label>
                        <input
                          type="text"
                          value={teacherForm.joinDate}
                          onChange={(e) => setTeacherForm({ ...teacherForm, joinDate: e.target.value })}
                          className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                            isDarkMode 
                              ? 'bg-[#02100a] border-emerald-800/60 text-white' 
                              : 'bg-slate-50 border-gray-350'
                          }`}
                          placeholder="উদা: ১২ মার্চ, ২০১৫"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl active:scale-95 transition-all shadow-md mt-5 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="h-4.5 w-4.5" />
                        <span>শিক্ষক পরিচিতি যোগ করুন</span>
                      </button>
                    </form>
                  </div>

                  {/* Teachers Table view */}
                  <div className={`border rounded-3xl p-6 shadow-xl lg:col-span-2 overflow-hidden flex flex-col justify-start ${
                    isDarkMode ? 'bg-[#031d12] border-emerald-900/40' : 'bg-white border-gray-200'
                  }`}>
                    <h3 className="text-base font-bold text-amber-400 border-b border-emerald-900/40 pb-3 mb-5 flex items-center justify-between">
                      <span>শিক্ষক পরিচিতি তালিকা</span>
                    </h3>

                    <div className="overflow-x-auto scrollbar-none">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className={`border-b text-amber-450 font-bold ${
                            isDarkMode ? 'bg-[#02100a]/80 border-emerald-900' : 'bg-slate-50 border-gray-250 text-emerald-850'
                          }`}>
                            <th className="py-3 px-3.5">নাম</th>
                            <th className="py-3 px-3.5">পদবী</th>
                            <th className="py-3 px-3.5">বিভাগ</th>
                            <th className="py-3 px-3.5">মোবাইল</th>
                            <th className="py-3 px-3.5">যোগদান</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-900/20">
                          {teachersList.length > 0 ? (
                            teachersList.map((tea, idx) => (
                              <tr key={idx} className={`font-semibold font-sans transition-colors ${
                                isDarkMode ? 'hover:bg-white/5 text-emerald-100' : 'hover:bg-slate-50 text-slate-800'
                              }`}>
                                <td className={`py-3 px-3.5 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{tea.name}</td>
                                <td className="py-3 px-3.5 text-amber-300 font-bold">{tea.designation}</td>
                                <td className="py-3 px-3.5 text-emerald-405">{tea.department || 'সাধারণ বিভাগ'}</td>
                                <td className="py-3 px-3.5">{tea.phone}</td>
                                <td className="py-3 px-3.5">{tea.joinDate}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="py-8 text-center text-gray-405 font-bold">কোনো শিক্ষক ডাটাবেসে নিবন্ধিত নেই।</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* Tab 4: Committee Members */}
              {activeTab === 'committee' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
                  {/* Add Member Form */}
                  <div className={`border rounded-3xl p-6 shadow-xl ${
                    isDarkMode ? 'bg-[#031d12] border-emerald-900/40' : 'bg-white border-gray-200 text-slate-900'
                  }`}>
                    <h3 className="text-base font-bold text-amber-400 border-b border-emerald-900/40 pb-3 mb-5 flex items-center gap-2">
                      <Plus className="h-5 w-5 shrink-0" />
                      <span>কমিটির সদস্য যোগ করুন</span>
                    </h3>
                    <form onSubmit={handleCommitteeSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-450 mb-1">সদস্যের নাম *</label>
                        <input
                          type="text"
                          required
                          value={committeeForm.name}
                          onChange={(e) => setCommitteeForm({ ...committeeForm, name: e.target.value })}
                          className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                            isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                          }`}
                          placeholder="উদা: হাজী মোঃ ইউনুস আলী"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-emerald-455 mb-1">পদবী *</label>
                        <select
                          value={committeeForm.designation}
                          onChange={(e) => setCommitteeForm({ ...committeeForm, designation: e.target.value })}
                          className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                            isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white' : 'bg-slate-50 border-gray-350'
                          }`}
                        >
                          <option value="সভাপতি">সভাপতি</option>
                          <option value="সহ-সভাপতি">সহ-সভাপতি</option>
                          <option value="সাধারণ সম্পাদক">সাধারণ সম্পাদক</option>
                          <option value="যুগ্ম সম্পাদক">যুগ্ম সম্পাদক</option>
                          <option value="কোষাধ্যক্ষ">কোষাধ্যক্ষ</option>
                          <option value="সদস্য">সদস্য</option>
                          <option value="দাতা সদস্য">দাতা সদস্য</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-emerald-455 mb-1">মোবাইল নম্বর *</label>
                        <input
                          type="text"
                          required
                          value={committeeForm.phone}
                          onChange={(e) => setCommitteeForm({ ...committeeForm, phone: e.target.value })}
                          className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                            isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white' : 'bg-slate-50 border-gray-350 font-sans'
                          }`}
                          placeholder="০১৭০০-০০০০০০"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-emerald-455 mb-1">ইমেইল</label>
                        <input
                          type="email"
                          value={committeeForm.email}
                          onChange={(e) => setCommitteeForm({ ...committeeForm, email: e.target.value })}
                          className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                            isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white' : 'bg-slate-50 border-gray-355 font-sans'
                          }`}
                          placeholder="member@madrasah.edu"
                        />
                      </div>
                      <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl active:scale-95 transition-all shadow-md mt-5 flex items-center justify-center gap-1.5 cursor-pointer">
                        <Plus className="h-4.5 w-4.5" />
                        <span>সদস্য পরিচিতি যোগ করুন</span>
                      </button>
                    </form>
                  </div>

                  {/* Members list */}
                  <div className={`border rounded-3xl p-6 shadow-xl lg:col-span-2 overflow-hidden flex flex-col justify-start ${
                    isDarkMode ? 'bg-[#031d12] border-emerald-900/40' : 'bg-white border-gray-200'
                  }`}>
                    <h3 className="text-base font-bold text-amber-400 border-b border-emerald-900/40 pb-3 mb-5 flex items-center justify-between">
                      <span>মাদ্রাসার কমিটির সদস্যবৃন্দ তালিকা</span>
                      <span className="text-[10px] text-gray-500 font-bold bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
                        সুপাবেস ডাটা সংযোগ
                      </span>
                    </h3>
                    <div className="overflow-x-auto scrollbar-none">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className={`border-b text-amber-450 font-bold ${
                            isDarkMode ? 'bg-[#02100a]/80 border-emerald-900' : 'bg-slate-50 border-gray-250 text-emerald-850'
                          }`}>
                            <th className="py-3 px-3.5">নাম</th>
                            <th className="py-3 px-3.5">পদবী</th>
                            <th className="py-3 px-3.5">মোবাইল</th>
                            <th className="py-3 px-3.5">ইমেইল</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-900/20">
                          {committeeList.length > 0 ? (
                            committeeList.map((mem, idx) => (
                              <tr key={idx} className={`font-semibold font-sans transition-colors ${
                                isDarkMode ? 'hover:bg-white/5 text-emerald-100' : 'hover:bg-slate-50 text-slate-800'
                              }`}>
                                <td className={`py-3 px-3.5 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{mem.name}</td>
                                <td className="py-3 px-3.5 text-amber-300 font-bold">{mem.designation}</td>
                                <td className="py-3 px-3.5">{mem.phone}</td>
                                <td className="py-3 px-3.5 font-sans">{mem.email || 'N/A'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="py-8 text-center text-gray-405 font-bold">কোনো কমিটির সদস্য নিবন্ধিত নেই।</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Result Management */}
              {activeTab === 'result' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
                  {/* Add Result Form */}
                  <div className={`border rounded-3xl p-6 shadow-xl ${
                    isDarkMode ? 'bg-[#031d12] border-emerald-900/40' : 'bg-white border-gray-200 text-slate-900'
                  }`}>
                    <h3 className="text-base font-bold text-amber-400 border-b border-emerald-900/40 pb-3 mb-5 flex items-center gap-2">
                      <Trophy className="h-5 w-5 shrink-0" />
                      <span>পরীক্ষার ফলাফল যোগ করুন</span>
                    </h3>
                    <form onSubmit={handleResultSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-455 mb-1">শিক্ষার্থীর নাম *</label>
                        <input
                          type="text"
                          required
                          value={resultForm.student_name}
                          onChange={(e) => setResultForm({ ...resultForm, student_name: e.target.value })}
                          className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                            isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-950 focus:border-emerald-600'
                          }`}
                          placeholder="উদা: আব্দুল আলিম"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-emerald-455 mb-1">রোল নম্বর *</label>
                          <input
                            type="number"
                            required
                            value={resultForm.roll_no}
                            onChange={(e) => setResultForm({ ...resultForm, roll_no: e.target.value })}
                            className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                              isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white' : 'bg-slate-50 border-gray-355 font-sans'
                            }`}
                            placeholder="১০০১"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-emerald-455 mb-1">পরীক্ষার নাম *</label>
                          <select
                            value={resultForm.exam_type}
                            onChange={(e) => setResultForm({ ...resultForm, exam_type: e.target.value })}
                            className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                              isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white' : 'bg-slate-50 border-gray-350'
                            }`}
                          >
                            <option value="অর্ধ-বার্ষিক পরীক্ষা">অর্ধ-বার্ষিক পরীক্ষা</option>
                            <option value="বার্ষিক পরীক্ষা">বার্ষিক পরীক্ষা</option>
                            <option value="প্রাক-নির্বাচনী পরীক্ষা">প্রাক-নির্বাচনী পরীক্ষা</option>
                            <option value="নির্বাচনী পরীক্ষা">নির্বাচনী পরীক্ষা</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-emerald-455 mb-1">জিপিএ (GPA) *</label>
                          <input
                            type="number"
                            step="0.01"
                            max="5.00"
                            required
                            value={resultForm.gpa}
                            onChange={(e) => setResultForm({ ...resultForm, gpa: e.target.value })}
                            className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none ${
                              isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white' : 'bg-slate-50 border-gray-350 font-sans'
                            }`}
                            placeholder="উদা: ৫.০০"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-emerald-455 mb-1">গ্রেড *</label>
                          <select
                            value={resultForm.grade}
                            onChange={(e) => setResultForm({ ...resultForm, grade: e.target.value })}
                            className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none ${
                              isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white' : 'bg-slate-50 border-gray-350'
                            }`}
                          >
                            <option value="A+">A+</option>
                            <option value="A">A</option>
                            <option value="A-">A-</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="F">F</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-emerald-455 mb-1">শ্রেণী নির্বাচন করুন *</label>
                        <select
                          value={resultForm.class}
                          onChange={(e) => setResultForm({ ...resultForm, class: e.target.value })}
                          className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none ${
                            isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white' : 'bg-slate-50 border-gray-350'
                          }`}
                        >
                          {[
                            "শিশু শ্রেণি", "১ম শ্রেণি", "২য় শ্রেণি", "৩য় শ্রেণি", "৪র্থ শ্রেণি", "৫ম শ্রেণি",
                            "দাখিল ৬ষ্ঠ শ্রেণি", "দাখিল ৭ম শ্রেণি", "দাখিল ৮ম শ্রেণি", "দাখিল ৯ম শ্রেণি", "দাখিল ১০ম শ্রেণি",
                            "হিফজ বিভাগ", "নূরানী বিভাগ"
                          ].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl active:scale-95 transition-all shadow-md mt-5 flex items-center justify-center gap-1.5 cursor-pointer">
                        <Plus className="h-4.5 w-4.5" />
                        <span>ফলাফল সংরক্ষণ করুন</span>
                      </button>
                    </form>
                  </div>

                  {/* Results list */}
                  <div className={`border rounded-3xl p-6 shadow-xl lg:col-span-2 overflow-hidden flex flex-col justify-start ${
                    isDarkMode ? 'bg-[#031d12] border-emerald-900/40' : 'bg-white border-gray-200'
                  }`}>
                    <h3 className="text-base font-bold text-amber-400 border-b border-emerald-900/40 pb-3 mb-5 flex items-center justify-between">
                      <span>মাদ্রাসার পরীক্ষার ফলাফল সমূহ তালিকা</span>
                      <span className="text-[10px] text-gray-500 font-bold bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
                        সুপাবেস ডাটা সংযোগ
                      </span>
                    </h3>
                    <div className="overflow-x-auto scrollbar-none">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className={`border-b text-amber-450 font-bold ${
                            isDarkMode ? 'bg-[#02100a]/80 border-emerald-900' : 'bg-slate-50 border-gray-250 text-emerald-850'
                          }`}>
                            <th className="py-3 px-3.5">রোল</th>
                            <th className="py-3 px-3.5">নাম</th>
                            <th className="py-3 px-3.5">শ্রেণী</th>
                            <th className="py-3 px-3.5">পরীক্ষার নাম</th>
                            <th className="py-3 px-3.5">জিপিএ (GPA)</th>
                            <th className="py-3 px-3.5">গ্রেড</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-900/20">
                          {resultsList.length > 0 ? (
                            resultsList.map((res, idx) => (
                              <tr key={idx} className={`font-semibold font-sans transition-colors ${
                                isDarkMode ? 'hover:bg-white/5 text-emerald-100' : 'hover:bg-slate-50 text-slate-800'
                              }`}>
                                <td className="py-3 px-3.5 font-bold text-amber-300">{res.roll_no}</td>
                                <td className={`py-3 px-3.5 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{res.student_name}</td>
                                <td className="py-3 px-3.5">{res.class}</td>
                                <td className="py-3 px-3.5 text-emerald-405">{res.exam_type}</td>
                                <td className="py-3 px-3.5 font-bold text-amber-300">{parseFloat(res.gpa).toFixed(2)}</td>
                                <td className="py-3 px-3.5">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    res.grade === 'F' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                                  }`}>
                                    {res.grade}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="py-8 text-center text-gray-455 font-bold">কোনো পরীক্ষার ফলাফল যোগ করা হয়নি।</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 6: Routine / Class Schedule */}
              {activeTab === 'routine' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
                  {/* Add Routine Form */}
                  <div className={`border rounded-3xl p-6 shadow-xl ${
                    isDarkMode ? 'bg-[#031d12] border-emerald-900/40' : 'bg-white border-gray-200 text-slate-900'
                  }`}>
                    <h3 className="text-base font-bold text-amber-400 border-b border-emerald-900/40 pb-3 mb-5 flex items-center gap-2">
                      <Calendar className="h-5 w-5 shrink-0" />
                      <span>রুটিন পিরিয়ড যোগ করুন</span>
                    </h3>
                    <form onSubmit={handleRoutineSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-emerald-455 mb-1">বার (Day) *</label>
                          <select
                            value={routineForm.day}
                            onChange={(e) => setRoutineForm({ ...routineForm, day: e.target.value })}
                            className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                              isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white' : 'bg-slate-50 border-gray-350'
                            }`}
                          >
                            <option value="শনিবার">শনিবার</option>
                            <option value="রবিবার">রবিবার</option>
                            <option value="সোমবার">সোমবার</option>
                            <option value="মঙ্গলবার">মঙ্গলবার</option>
                            <option value="বুধবার">বুধবার</option>
                            <option value="বৃহস্পতিবার">বৃহস্পতিবার</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-emerald-455 mb-1">শ্রেণী *</label>
                          <select
                            value={routineForm.class}
                            onChange={(e) => setRoutineForm({ ...routineForm, class: e.target.value })}
                            className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                              isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white' : 'bg-slate-50 border-gray-350'
                            }`}
                          >
                            {[
                              "শিশু শ্রেণি", "১ম শ্রেণি", "২য় শ্রেণি", "৩য় শ্রেণি", "৪র্থ শ্রেণি", "৫ম শ্রেণি",
                              "দাখিল ৬ষ্ঠ শ্রেণি", "দাখিল ৭ম শ্রেণি", "দাখিল ৮ম শ্রেণি", "দাখিল ৯ম শ্রেণি", "দাখিল ১০ম শ্রেণি",
                              "হিফজ বিভাগ", "নূরানী বিভাগ"
                            ].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-emerald-450 mb-1">বিষয় (Subject) *</label>
                        <input
                          type="text"
                          required
                          value={routineForm.subject}
                          onChange={(e) => setRoutineForm({ ...routineForm, subject: e.target.value })}
                          className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none ${
                            isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350'
                          }`}
                          placeholder="উদা: কুরআন মাজীদ ও তাজবীদ"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-emerald-455 mb-1">সময় স্লট (Time Slot) *</label>
                        <select
                          value={routineForm.time_slot}
                          onChange={(e) => setRoutineForm({ ...routineForm, time_slot: e.target.value })}
                          className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none ${
                            isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white' : 'bg-slate-50 border-gray-350'
                          }`}
                        >
                          <option value="০৯:০০ - ০৯:৪৫">০৯:০০ - ০৯:৪৫ (১ম পিরিয়ড)</option>
                          <option value="০৯:৪৫ - ১০:৩০">০৯:৪৫ - ১০:৩০ (২য় পিরিয়ড)</option>
                          <option value="১০:৩০ - ১১:১৫">১০:৩০ - ১১:১৫ (৩য় পিরিয়ড)</option>
                          <option value="১১:১৫ - ১২:০০">১১:১৫ - ১২:০০ (৪র্থ পিরিয়ড)</option>
                          <option value="১২:০০ - ১২:৪৫">১২:০০ - ১২:৪৫ (৫ম পিরিয়ড)</option>
                          <option value="১২:৪৫ - ০১:৩০">১২:৪৫ - ০১:৩০ (৬ষ্ঠ পিরিয়ড)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-emerald-455 mb-1">শিক্ষকের নাম *</label>
                        <input
                          type="text"
                          required
                          value={routineForm.teacher_name}
                          onChange={(e) => setRoutineForm({ ...routineForm, teacher_name: e.target.value })}
                          className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none ${
                            isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white' : 'bg-slate-50 border-gray-350'
                          }`}
                          placeholder="উদা: মাওলানা আব্দুল করিম"
                        />
                      </div>
                      <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl active:scale-95 transition-all shadow-md mt-5 flex items-center justify-center gap-1.5 cursor-pointer">
                        <Plus className="h-4.5 w-4.5" />
                        <span>ক্লাস রুটিন যোগ করুন</span>
                      </button>
                    </form>
                  </div>

                  {/* Routine list */}
                  <div className={`border rounded-3xl p-6 shadow-xl lg:col-span-2 overflow-hidden flex flex-col justify-start ${
                    isDarkMode ? 'bg-[#031d12] border-emerald-900/40' : 'bg-white border-gray-200'
                  }`}>
                    <h3 className="text-base font-bold text-amber-400 border-b border-emerald-900/40 pb-3 mb-5 flex items-center justify-between">
                      <span>মাদ্রাসার নিয়মিত ক্লাস রুটিন তালিকা</span>
                      <span className="text-[10px] text-gray-500 font-bold bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
                        সুপাবেস ডাটা সংযোগ
                      </span>
                    </h3>
                    <div className="overflow-x-auto scrollbar-none">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className={`border-b text-amber-450 font-bold ${
                            isDarkMode ? 'bg-[#02100a]/80 border-emerald-900' : 'bg-slate-50 border-gray-250 text-emerald-850'
                          }`}>
                            <th className="py-3 px-3.5">বার (Day)</th>
                            <th className="py-3 px-3.5">শ্রেণী</th>
                            <th className="py-3 px-3.5">সময় (Time)</th>
                            <th className="py-3 px-3.5">বিষয় (Subject)</th>
                            <th className="py-3 px-3.5">শিক্ষক</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-900/20">
                          {routineList.length > 0 ? (
                            routineList.map((rtn, idx) => (
                              <tr key={idx} className={`font-semibold font-sans transition-colors ${
                                isDarkMode ? 'hover:bg-white/5 text-emerald-100' : 'hover:bg-slate-50 text-slate-800'
                              }`}>
                                <td className="py-3 px-3.5 font-bold text-amber-300">{rtn.day}</td>
                                <td className={`py-3 px-3.5 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{rtn.class}</td>
                                <td className="py-3 px-3.5 text-emerald-450">{rtn.time_slot}</td>
                                <td className="py-3 px-3.5 text-emerald-400 font-bold">{rtn.subject}</td>
                                <td className="py-3 px-3.5 font-sans">{rtn.teacher_name}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="py-8 text-center text-gray-455 font-bold">কোনো ক্লাস রুটিন যুক্ত করা হয়নি।</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 7: Messages Inbox */}
              {activeTab === 'messages' && (
                <div className={`border rounded-3xl p-6 shadow-xl overflow-hidden flex flex-col justify-start animate-fade-in ${
                  isDarkMode ? 'bg-[#031d12] border-emerald-900/40' : 'bg-white border-gray-200'
                }`}>
                  <h3 className="text-base font-bold text-amber-400 border-b border-emerald-900/40 pb-3 mb-5 flex items-center justify-between">
                    <span>যোগাযোগ ফর্ম থেকে আগত মেসেজ ইনবক্স</span>
                  </h3>

                  <div className="overflow-x-auto scrollbar-none">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className={`border-b text-amber-450 font-bold ${
                          isDarkMode ? 'bg-[#02100a]/80 border-emerald-900' : 'bg-slate-50 border-gray-250 text-emerald-850'
                        }`}>
                          <th className="py-3.5 px-3.5">নাম</th>
                          <th className="py-3.5 px-3.5">যোগাযোগ মোবাইল ও ইমেইল</th>
                          <th className="py-3.5 px-3.5">বিষয়</th>
                          <th className="py-3.5 px-3.5">বার্তা বিবরণ</th>
                          <th className="py-3.5 px-3.5">তারিখ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-900/20">
                        {messagesList.length > 0 ? (
                          messagesList.map((msg, idx) => (
                            <tr key={idx} className={`font-semibold font-sans transition-colors ${
                              isDarkMode ? 'hover:bg-white/5 text-emerald-100' : 'hover:bg-slate-50 text-slate-800'
                            }`}>
                              <td className={`py-3.5 px-3.5 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{msg.name}</td>
                              <td className="py-3.5 px-3.5 font-sans">
                                <p className="font-bold text-amber-305">{msg.phone}</p>
                                <p className="text-[10px] text-gray-500 font-sans">{msg.email}</p>
                              </td>
                              <td className="py-3.5 px-3.5 text-emerald-305 font-bold">{msg.subject}</td>
                              <td className="py-3.5 px-3.5 max-w-sm truncate leading-relaxed text-justify text-xs" title={msg.message}>
                                {msg.message}
                              </td>
                              <td className="py-3.5 px-3.5 text-[10px] text-gray-500 font-sans">
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
                            <td colSpan="5" className="py-8 text-center text-gray-400 font-semibold">কোনো মেসেজ পাওয়া যায়নি।</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 5: Admin Settings (User creation form) */}
              {activeTab === 'settings' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                  
                  {/* Create Account Form */}
                  <div className={`border rounded-3xl p-6 shadow-xl ${
                    isDarkMode ? 'bg-[#031d12] border-emerald-900/40' : 'bg-white border-gray-200 text-slate-900'
                  }`}>
                    <h3 className="text-base font-bold text-amber-400 border-b border-emerald-900/40 pb-3 mb-5 flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      <span>অ্যাডমিন ও শিক্ষক অ্যাকাউন্ট ক্রিয়েশন</span>
                    </h3>

                    <form onSubmit={handleUserSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-450 mb-1">ব্যবহারকারীর সম্পূর্ণ নাম *</label>
                        <input
                          type="text"
                          required
                          value={userForm.name}
                          onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                          className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none ${
                            isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white' : 'bg-slate-50 border-gray-300'
                          }`}
                          placeholder="নাম লিখুন"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-450 mb-1">ইউজারনেম অথবা ইমেইল *</label>
                        <input
                          type="text"
                          required
                          value={userForm.username_or_email}
                          onChange={(e) => setUserForm({ ...userForm, username_or_email: e.target.value })}
                          className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none ${
                            isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white' : 'bg-slate-50 border-gray-300'
                          }`}
                          placeholder="abdul123 বা abdul@madrasah.edu"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-450 mb-1">পাসওয়ার্ড *</label>
                        <input
                          type="password"
                          required
                          value={userForm.password}
                          onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                          className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none ${
                            isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white' : 'bg-slate-50 border-gray-300'
                          }`}
                          placeholder="গোপন পাসওয়ার্ড লিখুন"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-455 mb-1">মোবাইল নম্বর</label>
                        <input
                          type="text"
                          value={userForm.phone}
                          onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                          className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none ${
                            isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white' : 'bg-slate-50 border-gray-300'
                          }`}
                          placeholder="উদা: ০১৮০০-০০০০০০"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-emerald-455 mb-1">সিস্টেম রোল</label>
                          <select
                            value={userForm.role}
                            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                            className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none ${
                              isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white' : 'bg-slate-50 border-gray-300'
                            }`}
                          >
                            <option value="teacher">শিক্ষক / অ্যাডমিন</option>
                            <option value="student">শিক্ষার্থী</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-emerald-455 mb-1">পদবী</label>
                          <input
                            type="text"
                            value={userForm.designation}
                            onChange={(e) => setUserForm({ ...userForm, designation: e.target.value })}
                            className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none ${
                              isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white' : 'bg-slate-50 border-gray-300'
                            }`}
                            placeholder="সহকারী শিক্ষক / সহকারী সুপার"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl active:scale-95 transition-all shadow-md mt-5 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Settings className="h-4.5 w-4.5" />
                        <span>অ্যাকাউন্ট তৈরি করুন</span>
                      </button>
                    </form>
                  </div>

                  {/* Security directives Notice */}
                  <div className={`border rounded-3xl p-6 shadow-xl flex flex-col justify-between ${
                    isDarkMode ? 'bg-[#031d12] border-emerald-900/40' : 'bg-white border-gray-200 text-slate-800'
                  }`}>
                    <div>
                      <h3 className="text-base font-bold text-amber-400 mb-4">অ্যাডমিন সেটিংস নিরাপত্তা নির্দেশিকা</h3>
                      <p className="text-xs leading-relaxed text-justify font-semibold">
                        অত্র প্যানেলে তৈরি নতুন অ্যাকাউন্টের মাধ্যমে ব্যবহারকারী (শিক্ষক বা ছাত্র) তাদের নিজস্ব পোর্টাল প্যানেলে সফলভাবে লগইন করতে পারবেন। ডাটাবেসের নিরাপত্তা নিশ্চিত করতে অনুগ্রহ করে শুধুমাত্র সত্য ও যাচাইকৃত ব্যবহারকারীদের অ্যাকাউন্ট প্রদান করুন।
                        <br /><br />
                        নোট: নতুন অ্যাডমিন অ্যাকাউন্ট ক্রিয়েশন লজিক সরাসরি সুপাবেস `users` টেবিলে তথ্য যোগ করবে।
                      </p>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-[10px] text-amber-400 leading-relaxed font-bold mt-6">
                      ! সতর্কতা: অ্যাকাউন্ট ক্রিয়েট করার পূর্বে ব্যবহারকারীর পদবী ও সেশন রোল পুনরায় চেক করুন।
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 9: Homepage Update */}
              {activeTab === 'homepage_update' && (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* Banner Card */}
                  <div className="bg-gradient-to-r from-[#032416] via-[#09472e] to-[#032416] border border-emerald-500/20 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
                    <div className="space-y-2 z-10 relative">
                      <span className="bg-amber-500/10 text-amber-300 text-[10px] font-black uppercase tracking-wider py-1 px-3.5 rounded-full border border-amber-500/25">
                        Dynamic Website Customizer
                      </span>
                      <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
                        মাদ্রাসা মূল ওয়েবসাইট আপডেট কন্ট্রোল
                      </h2>
                      <p className="text-xs text-emerald-200 leading-relaxed font-semibold max-w-2xl">
                        এখান থেকে আপনি মূল ওয়েবসাইটের কৃতী শিক্ষার্থীর সাফল্য এবং পরিচালনা কমিটির স্মরণীয় ব্যক্তিদের তথ্য যুক্ত করতে পারবেন। যেকোনো তথ্য সফলভাবে যোগ হওয়ামাত্রই তা লাইভ ওয়েবসাইটে রিয়েল-টাইমে আপডেট হয়ে যাবে।
                      </p>
                    </div>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Card 1: Student Achievement */}
                    <div 
                      onClick={() => setShowAchievementModal(true)}
                      className={`border rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 group shadow-[0_4px_30px_rgba(0,0,0,0.15)] cursor-pointer ${
                        isDarkMode ? 'bg-[#031d12] border-emerald-900/40 text-emerald-100' : 'bg-white border-gray-200 text-slate-800'
                      }`}
                    >
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-amber-400 group-hover:text-amber-300 transition-colors">
                            ১. শিক্ষার্থীর সাফল্য যোগ করুন
                          </h3>
                          <p className={`text-xs leading-relaxed font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-650'}`}>
                            বোর্ড পরীক্ষায় জিপিএ-৫ প্রাপ্তি, ক্যালিগ্রাফি বা সাংস্কৃতিক প্রতিযোগিতায় অসামান্য সাফল্য অর্জনকারী শিক্ষার্থীদের তথ্য যুক্ত করুন।
                          </p>
                        </div>
                        <div className="p-3.5 bg-amber-500/10 text-amber-400 rounded-2xl shrink-0">
                          <Award className="h-6 w-6" />
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Memorial Members */}
                    <div 
                      onClick={() => setShowMemorialModal(true)}
                      className={`border rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 group shadow-[0_4px_30px_rgba(0,0,0,0.15)] cursor-pointer ${
                        isDarkMode ? 'bg-[#031d12] border-emerald-900/40 text-emerald-100' : 'bg-white border-gray-200 text-slate-800'
                      }`}
                    >
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                            ২. কমিটির স্মরণীয় ব্যক্তি যোগ করুন
                          </h3>
                          <p className={`text-xs leading-relaxed font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-650'}`}>
                            মাদ্রাসার প্রতিষ্ঠাতা, ভূমি দাতা বা আজীবন সেবাকারী স্মরণীয় ব্যক্তিত্বদের জীবনকাল ও অবদানের কথা লিখে শ্রদ্ধাঞ্জলি জানান।
                          </p>
                        </div>
                        <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl shrink-0">
                          <BookOpen className="h-6 w-6" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Popup Modal 1: Student Achievement */}
                  {showAchievementModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
                      <div className={`w-full max-w-lg rounded-3xl border-t-4 border-amber-500 p-6 md:p-8 shadow-2xl relative ${
                        isDarkMode ? 'bg-[#031a10] border-emerald-900/50 text-white' : 'bg-white border-gray-200 text-slate-900'
                      }`}>
                        <button 
                          onClick={() => setShowAchievementModal(false)}
                          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer animate-pulse"
                        >
                          <X className="h-5 w-5" />
                        </button>
                        <h3 className="text-lg font-black text-amber-400 mb-6 flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          <span>শিক্ষার্থীর সাফল্য অর্জন ফরম</span>
                        </h3>
                        <form onSubmit={handleAchievementSubmit} className="space-y-4 text-left">
                          <div>
                            <label className="block text-xs font-bold text-emerald-450 mb-1">শিক্ষার্থীর নাম *</label>
                            <input 
                              type="text"
                              required
                              value={achievementForm.student_name}
                              onChange={(e) => setAchievementForm({...achievementForm, student_name: e.target.value})}
                              placeholder="মোহাম্মদ তানভীর রহমান"
                              className={`w-full border rounded-xl py-2.5 px-3.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-300 text-slate-900'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-emerald-455 mb-1">শ্রেণী নির্বাচন করুন *</label>
                            <select 
                              value={achievementForm.student_class}
                              onChange={(e) => setAchievementForm({...achievementForm, student_class: e.target.value})}
                              className={`w-full border rounded-xl py-2.5 px-3.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white' : 'bg-slate-50 border-gray-300 text-slate-900'
                              }`}
                            >
                              {[
                                "দাখিল ১০ম শ্রেণি", "দাখিল ৯ম শ্রেণি", "দাখিল ৮ম শ্রেণি", "দাখিল ৭ম শ্রেণি", "দাখিল ৬ষ্ঠ শ্রেণি",
                                "৫ম শ্রেণি", "৪র্থ শ্রেণি", "৩য় শ্রেণি", "২য় শ্রেণি", "১ম শ্রেণি", "শিশু শ্রেণি"
                              ].map(cls => (
                                <option key={cls} value={cls}>{cls}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-emerald-450 mb-1">সাফল্য হেডলাইন *</label>
                            <input 
                              type="text"
                              required
                              value={achievementForm.headline}
                              onChange={(e) => setAchievementForm({...achievementForm, headline: e.target.value})}
                              placeholder="দাখিল বোর্ড পরীক্ষায় গোল্ডেন জিপিএ ৫.০০ এবং উপজেলায় প্রথম স্থান।"
                              className={`w-full border rounded-xl py-2.5 px-3.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-300 text-slate-900'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-emerald-450 mb-1">সাফল্য বিবরণী *</label>
                            <textarea 
                              required
                              rows="3"
                              value={achievementForm.description}
                              onChange={(e) => setAchievementForm({...achievementForm, description: e.target.value})}
                              placeholder="শিক্ষার্থীর মেধার বিবরণ, ভবিষ্যত পরিকল্পনা এবং অবদানের কথা বিস্তারিত লিখুন।"
                              className={`w-full border rounded-xl py-2.5 px-3.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-300 text-slate-900'
                              }`}
                            ></textarea>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-emerald-450 mb-1">ছবির লিংক (Image URL)</label>
                            <input 
                              type="text"
                              value={achievementForm.image_url}
                              onChange={(e) => setAchievementForm({...achievementForm, image_url: e.target.value})}
                              placeholder="https://example.com/photo.jpg"
                              className={`w-full border rounded-xl py-2.5 px-3.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-300 text-slate-900'
                              }`}
                            />
                          </div>
                          <button 
                            type="submit"
                            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl active:scale-95 transition-all shadow-md mt-6 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="h-4.5 w-4.5" />
                            <span>সাফল্য ডেটাবেসে যুক্ত করুন</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Popup Modal 2: Memorial Figure */}
                  {showMemorialModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
                      <div className={`w-full max-w-lg rounded-3xl border-t-4 border-emerald-500 p-6 md:p-8 shadow-2xl relative ${
                        isDarkMode ? 'bg-[#031a10] border-emerald-900/50 text-white' : 'bg-white border-gray-200 text-slate-900'
                      }`}>
                        <button 
                          onClick={() => setShowMemorialModal(false)}
                          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer animate-pulse"
                        >
                          <X className="h-5 w-5" />
                        </button>
                        <h3 className="text-lg font-black text-emerald-400 mb-6 flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          <span>কমিটির স্মরণীয় ব্যক্তিত্ব ফর্ম</span>
                        </h3>
                        <form onSubmit={handleMemorialSubmit} className="space-y-4 text-left">
                          <div>
                            <label className="block text-xs font-bold text-emerald-455 mb-1">স্মরণীয় ব্যক্তির নাম *</label>
                            <input 
                              type="text"
                              required
                              value={memorialForm.member_name}
                              onChange={(e) => setMemorialForm({...memorialForm, member_name: e.target.value})}
                              placeholder="মরহুম আলহাজ্ব নূর উদ্দিন আহমেদ"
                              className={`w-full border rounded-xl py-2.5 px-3.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-300 text-slate-900'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-emerald-455 mb-1">জন্ম-মৃত্যু সাল (জীবনকাল) *</label>
                            <input 
                              type="text"
                              required
                              value={memorialForm.lifespan}
                              onChange={(e) => setMemorialForm({...memorialForm, lifespan: e.target.value})}
                              placeholder="উদা: ১৯৩০ - ২০০৮"
                              className={`w-full border rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-300 text-slate-900 font-sans'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-emerald-455 mb-1">অবদান হেডলাইন *</label>
                            <input 
                              type="text"
                              required
                              value={memorialForm.contribution_headline}
                              onChange={(e) => setMemorialForm({...memorialForm, contribution_headline: e.target.value})}
                              placeholder="মাদ্রাসার ভূমি দাতা ও প্রতিষ্ঠাতা সভাপতি।"
                              className={`w-full border rounded-xl py-2.5 px-3.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-300 text-slate-900'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-emerald-455 mb-1">অবদান বিস্তারিত *</label>
                            <textarea 
                              required
                              rows="4"
                              value={memorialForm.contribution_details}
                              onChange={(e) => setMemorialForm({...memorialForm, contribution_details: e.target.value})}
                              placeholder="মাদ্রাসার প্রতিষ্ঠা ও এর উন্নয়নে এই ব্যক্তির অবদান ও শ্রদ্ধাঞ্জলি স্মৃতিসমূহ বিস্তারিত লিখুন।"
                              className={`w-full border rounded-xl py-2.5 px-3.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-300 text-slate-900'
                              }`}
                            ></textarea>
                          </div>
                          <button 
                            type="submit"
                            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl active:scale-95 transition-all shadow-md mt-6 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="h-4.5 w-4.5" />
                            <span>স্মরণীয় ব্যক্তিত্ব যুক্ত করুন</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}
        </div>

      </main>

    </div>
  );
}
