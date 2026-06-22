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
  Trophy,
  Edit2,
  Trash2,
  FileText,
  User,
  ShieldCheck
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
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebaseClient';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();

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
  const [achievementsList, setAchievementsList] = useState([]);
  const [memoriamList, setMemoriamList] = useState([]);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [editingMemorial, setEditingMemorial] = useState(null);
  const [selectedClass, setSelectedClass] = useState('দাখিল ১০ম শ্রেণি');
  const [selectedMemorialFile, setSelectedMemorialFile] = useState(null);
  const [selectedEditMemorialFile, setSelectedEditMemorialFile] = useState(null);
  const [isMemorialUploading, setIsMemorialUploading] = useState(false);

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

  // 2. Teacher Form (39 Fields + Sub-tab & UI states)
  const [teacherForm, setTeacherForm] = useState({
    name_bn: '',
    name_en: '',
    father_name: '',
    mother_name: '',
    dob: '',
    nid: '',
    gender: 'পুরুষ',
    marital_status: 'অবিবাহিত',
    blood_group: 'O+',
    photo_url: '',
    nid_scan_url: '',
    mobile: '',
    alt_mobile: '',
    whatsapp: '',
    email: '',
    present_address: '',
    permanent_address: '',
    highest_degree: '',
    subject: '',
    passing_year: '',
    result: '',
    teacher_id: '',
    designation: '',
    department: 'সাধারণ বিভাগ',
    joining_date: '',
    status: 'সক্রিয়',
    salary: '',
    is_hafiz: false,
    is_qari: false,
    is_dawra: false,
    special_skills: '',
    bank_name: '',
    bank_branch: '',
    bank_account_no: '',
    routing_no: '',
    mobile_banking_type: 'bkash',
    mobile_banking_no: '',
    login_username: '',
    login_password: ''
  });

  const [activeTeacherSubTab, setActiveTeacherSubTab] = useState('list');
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [isTeacherUploading, setIsTeacherUploading] = useState(false);
  const [teacherUploadingMsg, setTeacherUploadingMsg] = useState('📖 অপেক্ষার প্রতিদান উত্তম,একটু ধৈর্য ধরুন।');
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');

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
      const querySnapshot = await getDocs(collection(db, "teachers"));
      if (!querySnapshot.empty) {
        const teac = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTeachersList(teac);
        tCount = teac.length;
      } else {
        const teac = await getTeachers();
        if (teac) {
          setTeachersList(teac);
          tCount = teac.length;
        }
      }
    } catch (err) {
      console.error("Error loading teachers from Firestore, falling back to Supabase:", err);
      try {
        const teac = await getTeachers();
        if (teac) {
          setTeachersList(teac);
          tCount = teac.length;
        }
      } catch (innerErr) {
        console.error("Supabase fallback error:", innerErr);
      }
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

    // Load Committee from Firestore
    try {
      const q = query(collection(db, "committee"), orderBy("created_at", "asc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCommitteeList(data);
    } catch (e) {
      console.error("Error loading committee from firestore:", e);
      try {
        const querySnapshot = await getDocs(collection(db, "committee"));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCommitteeList(data);
      } catch (innerErr) {
        setCommitteeList(JSON.parse(localStorage.getItem('committee_members') || '[]'));
      }
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

    // Load Achievements
    try {
      const q = query(collection(db, "achievements"), orderBy("created_at", "asc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAchievementsList(data);
    } catch (e) {
      console.error("Error loading achievements from firestore:", e);
      try {
        const querySnapshot = await getDocs(collection(db, "achievements"));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAchievementsList(data);
      } catch (innerErr) {
        setAchievementsList(JSON.parse(localStorage.getItem('achievements') || '[]'));
      }
    }

    // Load Memorial Committee
    try {
      const q = query(collection(db, "memorial_committee"), orderBy("created_at", "asc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMemoriamList(data);
    } catch (e) {
      console.error("Error loading memorial_committee from firestore:", e);
      try {
        const querySnapshot = await getDocs(collection(db, "memorial_committee"));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMemoriamList(data);
      } catch (innerErr) {
        setMemoriamList(JSON.parse(localStorage.getItem('memoriam_members') || '[]'));
      }
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

    // Setup Realtime subscriptions via Firestore onSnapshot
    const unsubAchievements = onSnapshot(
      query(collection(db, "achievements"), orderBy("created_at", "asc")),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAchievementsList(data);
      },
      (error) => {
        console.error("Firestore achievements subscription error, falling back to simple listen:", error);
        onSnapshot(collection(db, "achievements"), (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAchievementsList(data);
        });
      }
    );

    const unsubMemoriam = onSnapshot(
      query(collection(db, "memorial_committee"), orderBy("created_at", "asc")),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMemoriamList(data);
      },
      (error) => {
        console.error("Firestore memorial_committee subscription error, falling back to simple listen:", error);
        onSnapshot(collection(db, "memorial_committee"), (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMemoriamList(data);
        });
      }
    );

    const unsubCommittee = onSnapshot(
      query(collection(db, "committee"), orderBy("created_at", "asc")),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCommitteeList(data);
      },
      (error) => {
        console.error("Firestore committee subscription error, falling back to simple listen:", error);
        onSnapshot(collection(db, "committee"), (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCommitteeList(data);
        });
      }
    );

    const unsubTeachers = onSnapshot(
      collection(db, "teachers"),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTeachersList(data);
        setStats(prev => ({ ...prev, teachers: data.length }));
      },
      (error) => {
        console.error("Firestore teachers subscription error:", error);
      }
    );

    return () => {
      unsubAchievements();
      unsubMemoriam();
      unsubCommittee();
      unsubTeachers();
    };
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

  // Generate Unique Teacher ID: SN-TEA-2026-XX
  const generateUniqueTeacherId = async () => {
    try {
      const q = query(collection(db, "teachers"));
      const querySnapshot = await getDocs(q);
      let maxNum = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.teacher_id && data.teacher_id.startsWith('SN-TEA-2026-')) {
          const parts = data.teacher_id.split('-');
          const numPart = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(numPart) && numPart > maxNum) {
            maxNum = numPart;
          }
        }
      });
      const nextNum = maxNum + 1;
      return `SN-TEA-2026-${nextNum.toString().padStart(2, '0')}`;
    } catch (err) {
      console.error("Error generating teacher ID:", err);
      const randomSuffix = Math.floor(10 + Math.random() * 90);
      return `SN-TEA-2026-${randomSuffix}`;
    }
  };

  // Upload File to ImgBB
  const uploadFileToImgBB = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch('https://api.imgbb.com/1/upload?key=96be92cf24f1281697cde3f7ad9d506e', {
      method: 'POST',
      body: formData
    });
    const resData = await response.json();
    if (resData.success) {
      return resData.data.url;
    } else {
      throw new Error(resData.error?.message || 'Upload failed');
    }
  };

  // Handle Teacher Photo Change
  const handleTeacherPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsTeacherUploading(true);
    setTeacherUploadingMsg('📖 অপেক্ষার প্রতিদান উত্তম,একটু ধৈর্য ধরুন।');
    try {
      const url = await uploadFileToImgBB(file);
      setTeacherForm(prev => ({ ...prev, photo_url: url }));
      triggerToast('শিক্ষকের ছবি সফলভাবে আপলোড হয়েছে!');
    } catch (err) {
      console.error("Error uploading photo:", err);
      triggerToast('ছবি আপলোড ব্যর্থ হয়েছে: ' + err.message, 'error');
    } finally {
      setIsTeacherUploading(false);
    }
  };

  // Handle Teacher NID Copy Change
  const handleTeacherNidChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsTeacherUploading(true);
    setTeacherUploadingMsg('📖 অপেক্ষার প্রতিদান উত্তম,একটু ধৈর্য ধরুন।');
    try {
      const url = await uploadFileToImgBB(file);
      setTeacherForm(prev => ({ ...prev, nid_scan_url: url }));
      triggerToast('এনআইডি স্ক্যান কপি সফলভাবে আপলোড হয়েছে!');
    } catch (err) {
      console.error("Error uploading NID scan:", err);
      triggerToast('এনআইডি স্ক্যান কপি আপলোড ব্যর্থ হয়েছে: ' + err.message, 'error');
    } finally {
      setIsTeacherUploading(false);
    }
  };

  // Reset Teacher Form
  const resetTeacherForm = () => {
    setTeacherForm({
      name_bn: '',
      name_en: '',
      father_name: '',
      mother_name: '',
      dob: '',
      nid: '',
      gender: 'পুরুষ',
      marital_status: 'অবিবাহিত',
      blood_group: 'O+',
      photo_url: '',
      nid_scan_url: '',
      mobile: '',
      alt_mobile: '',
      whatsapp: '',
      email: '',
      present_address: '',
      permanent_address: '',
      highest_degree: '',
      subject: '',
      passing_year: '',
      result: '',
      teacher_id: '',
      designation: '',
      department: 'সাধারণ বিভাগ',
      joining_date: '',
      status: 'সক্রিয়',
      salary: '',
      is_hafiz: false,
      is_qari: false,
      is_dawra: false,
      special_skills: '',
      bank_name: '',
      bank_branch: '',
      bank_account_no: '',
      routing_no: '',
      mobile_banking_type: 'bkash',
      mobile_banking_no: '',
      login_username: '',
      login_password: ''
    });
    setEditingTeacherId(null);
  };

  // Handle Teacher Submit (Add or Edit)
  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    if (!teacherForm.name_bn.trim() || !teacherForm.designation.trim() || !teacherForm.mobile.trim()) {
      triggerToast('শিক্ষকের নাম (বাংলা), পদবী এবং মোবাইল নম্বর পূরণ করা আবশ্যক।', 'error');
      return;
    }

    setIsTeacherUploading(true);
    setTeacherUploadingMsg('📖 অপেক্ষার প্রতিদান উত্তম,একটু ধৈর্য ধরুন।');

    try {
      if (editingTeacherId) {
        // Edit mode
        const docRef = doc(db, "teachers", editingTeacherId);
        await updateDoc(docRef, {
          name_bn: teacherForm.name_bn.trim(),
          name_en: teacherForm.name_en.trim(),
          father_name: teacherForm.father_name.trim(),
          mother_name: teacherForm.mother_name.trim(),
          dob: teacherForm.dob,
          nid: teacherForm.nid.trim(),
          gender: teacherForm.gender,
          marital_status: teacherForm.marital_status,
          blood_group: teacherForm.blood_group,
          photo_url: teacherForm.photo_url,
          nid_scan_url: teacherForm.nid_scan_url,
          mobile: teacherForm.mobile.trim(),
          alt_mobile: teacherForm.alt_mobile.trim(),
          whatsapp: teacherForm.whatsapp.trim(),
          email: teacherForm.email.trim(),
          present_address: teacherForm.present_address.trim(),
          permanent_address: teacherForm.permanent_address.trim(),
          highest_degree: teacherForm.highest_degree.trim(),
          subject: teacherForm.subject.trim(),
          passing_year: teacherForm.passing_year.trim(),
          result: teacherForm.result.trim(),
          teacher_id: teacherForm.teacher_id,
          designation: teacherForm.designation.trim(),
          department: teacherForm.department.trim(),
          joining_date: teacherForm.joining_date,
          status: teacherForm.status,
          salary: teacherForm.salary,
          is_hafiz: teacherForm.is_hafiz,
          is_qari: teacherForm.is_qari,
          is_dawra: teacherForm.is_dawra,
          special_skills: teacherForm.special_skills.trim(),
          bank_name: teacherForm.bank_name.trim(),
          bank_branch: teacherForm.bank_branch.trim(),
          bank_account_no: teacherForm.bank_account_no.trim(),
          routing_no: teacherForm.routing_no.trim(),
          mobile_banking_type: teacherForm.mobile_banking_type,
          mobile_banking_no: teacherForm.mobile_banking_no.trim(),
          login_username: teacherForm.login_username.trim() || teacherForm.teacher_id,
          login_password: teacherForm.login_password.trim(),
          updated_at: new Date()
        });
        triggerToast('শিক্ষকের তথ্য সফলভাবে আপডেট হয়েছে!');
      } else {
        // Add mode
        const newId = await generateUniqueTeacherId();
        const teacherId = teacherForm.login_username.trim() || newId;
        const authEmail = `${teacherId.toLowerCase()}@madrasah.com`;
        const password = teacherForm.login_password.trim() || '123456';

        // 1. Create account in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, authEmail, password);
        const authUid = userCredential.user.uid;

        // 2. Save teacher profile in Firestore
        await addDoc(collection(db, "teachers"), {
          name_bn: teacherForm.name_bn.trim(),
          name_en: teacherForm.name_en.trim(),
          father_name: teacherForm.father_name.trim(),
          mother_name: teacherForm.mother_name.trim(),
          dob: teacherForm.dob,
          nid: teacherForm.nid.trim(),
          gender: teacherForm.gender,
          marital_status: teacherForm.marital_status,
          blood_group: teacherForm.blood_group,
          photo_url: teacherForm.photo_url,
          nid_scan_url: teacherForm.nid_scan_url,
          mobile: teacherForm.mobile.trim(),
          alt_mobile: teacherForm.alt_mobile.trim(),
          whatsapp: teacherForm.whatsapp.trim(),
          email: teacherForm.email.trim(),
          present_address: teacherForm.present_address.trim(),
          permanent_address: teacherForm.permanent_address.trim(),
          highest_degree: teacherForm.highest_degree.trim(),
          subject: teacherForm.subject.trim(),
          passing_year: teacherForm.passing_year.trim(),
          result: teacherForm.result.trim(),
          teacher_id: teacherId,
          teacherId: teacherId,
          designation: teacherForm.designation.trim(),
          department: teacherForm.department.trim(),
          joining_date: teacherForm.joining_date,
          status: teacherForm.status,
          salary: teacherForm.salary,
          is_hafiz: teacherForm.is_hafiz,
          is_qari: teacherForm.is_qari,
          is_dawra: teacherForm.is_dawra,
          special_skills: teacherForm.special_skills.trim(),
          bank_name: teacherForm.bank_name.trim(),
          bank_branch: teacherForm.bank_branch.trim(),
          bank_account_no: teacherForm.bank_account_no.trim(),
          routing_no: teacherForm.routing_no.trim(),
          mobile_banking_type: teacherForm.mobile_banking_type,
          mobile_banking_no: teacherForm.mobile_banking_no.trim(),
          login_username: teacherId.toLowerCase(),
          login_password: password,
          uid: authUid,
          authEmail: authEmail,
          created_at: new Date()
        });
        triggerToast('নতুন শিক্ষক পরিচিতি ও অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
      }
      resetTeacherForm();
      setActiveTeacherSubTab('list');
      loadDatabaseData();
    } catch (err) {
      console.error("Error saving teacher:", err);
      triggerToast('শিক্ষকের তথ্য সংরক্ষণ বা অ্যাকাউন্ট তৈরি ব্যর্থ হয়েছে: ' + err.message, 'error');
    } finally {
      setIsTeacherUploading(false);
    }
  };

  // Handle Edit Teacher Click
  const handleEditTeacher = (tea) => {
    setTeacherForm({
      name_bn: tea.name_bn || tea.name || '',
      name_en: tea.name_en || '',
      father_name: tea.father_name || '',
      mother_name: tea.mother_name || '',
      dob: tea.dob || '',
      nid: tea.nid || '',
      gender: tea.gender || 'পুরুষ',
      marital_status: tea.marital_status || 'অবিবাহিত',
      blood_group: tea.blood_group || 'O+',
      photo_url: tea.photo_url || '',
      nid_scan_url: tea.nid_scan_url || '',
      mobile: tea.mobile || tea.phone || '',
      alt_mobile: tea.alt_mobile || '',
      whatsapp: tea.whatsapp || '',
      email: tea.email || '',
      present_address: tea.present_address || '',
      permanent_address: tea.permanent_address || '',
      highest_degree: tea.highest_degree || '',
      subject: tea.subject || '',
      passing_year: tea.passing_year || '',
      result: tea.result || '',
      teacher_id: tea.teacher_id || '',
      designation: tea.designation || '',
      department: tea.department || 'সাধারণ বিভাগ',
      joining_date: tea.joining_date || tea.joinDate || '',
      status: tea.status || 'সক্রিয়',
      salary: tea.salary || '',
      is_hafiz: tea.is_hafiz === true || tea.is_hafiz === 'true',
      is_qari: tea.is_qari === true || tea.is_qari === 'true',
      is_dawra: tea.is_dawra === true || tea.is_dawra === 'true',
      special_skills: tea.special_skills || '',
      bank_name: tea.bank_name || '',
      bank_branch: tea.bank_branch || '',
      bank_account_no: tea.bank_account_no || '',
      routing_no: tea.routing_no || '',
      mobile_banking_type: tea.mobile_banking_type || 'bkash',
      mobile_banking_no: tea.mobile_banking_no || '',
      login_username: tea.login_username || '',
      login_password: tea.login_password || ''
    });
    setEditingTeacherId(tea.id);
    setActiveTeacherSubTab('add');
  };

  // Handle Delete Teacher Click
  const handleDeleteTeacher = async (id, name) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে "${name}" শিক্ষকের প্রোফাইলটি ডিলিট করতে চান?`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, "teachers", id));
      triggerToast('শিক্ষকের প্রোফাইল সফলভাবে ডিলিট হয়েছে!');
      loadDatabaseData();
    } catch (err) {
      console.error("Error deleting teacher:", err);
      triggerToast('শিক্ষকের প্রোফাইল ডিলিট করতে সমস্যা হয়েছে: ' + err.message, 'error');
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

  // Handle Committee Submission (connected to Firestore)
  const handleCommitteeSubmit = async (e) => {
    e.preventDefault();
    if (!committeeForm.name.trim() || !committeeForm.phone.trim()) {
      triggerToast('নাম ও মোবাইল নম্বর পূরণ করুন।', 'error');
      return;
    }

    try {
      await addDoc(collection(db, "committee"), {
        name: committeeForm.name.trim(),
        designation: committeeForm.designation,
        phone: committeeForm.phone.trim(),
        email: committeeForm.email.trim() || null,
        bio: 'পরিচালনা কমিটির সম্মানিত সদস্য।',
        created_at: new Date()
      });

      triggerToast('নতুন কমিটির সদস্য সফলভাবে যোগ হয়েছে!');
      setCommitteeForm({ name: '', designation: 'সভাপতি', phone: '', email: '' });
      alert("সফলভাবে ডাটাবেসে জমা হয়েছে!");
    } catch (err) {
      alert("ডাটা জমা হয়নি! কারণ: " + err.message);
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

    try {
      await addDoc(collection(db, "achievements"), {
        student_name: achievementForm.student_name.trim(),
        student_class: achievementForm.student_class,
        headline: achievementForm.headline.trim(),
        description: achievementForm.description.trim(),
        image_url: achievementForm.image_url.trim() || null,
        created_at: new Date()
      });

      triggerToast('শিক্ষার্থীর সাফল্য সফলভাবে যুক্ত করা হয়েছে!');
      setAchievementForm({
        student_name: '',
        student_class: 'দাখিল ১০ম শ্রেণি',
        headline: '',
        description: '',
        image_url: ''
      });
      setShowAchievementModal(false);
      alert("সফলভাবে ডাটাবেসে জমা হয়েছে!");
    } catch (err) {
      alert("ডাটা জমা হয়নি! কারণ: " + err.message);
    }
  };

  // Handle Homepage Memorial Submission (with optional image upload)
  const handleMemorialSubmit = async (e) => {
    e.preventDefault();
    if (!memorialForm.member_name.trim() || !memorialForm.lifespan.trim() || !memorialForm.contribution_headline.trim() || !memorialForm.contribution_details.trim()) {
      triggerToast('সকল প্রয়োজনীয় ঘর পূরণ করুন।', 'error');
      return;
    }

    setIsMemorialUploading(true);
    triggerToast('📖 অপেক্ষার প্রতিদান উত্তম,একটু ধৈর্য ধরুন।', 'success');

    try {
      let finalImageUrl = '';

      if (selectedMemorialFile) {
        const { getStorage, ref: sRef, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const storage = getStorage();
        const fileRef = sRef(storage, `memorial/${Date.now()}_${selectedMemorialFile.name}`);
        const snapshot = await uploadBytes(fileRef, selectedMemorialFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, "memorial_committee"), {
        member_name: memorialForm.member_name.trim(),
        lifespan: memorialForm.lifespan.trim(),
        contribution_headline: memorialForm.contribution_headline.trim(),
        contribution_details: memorialForm.contribution_details.trim(),
        image_url: finalImageUrl,
        created_at: new Date()
      });

      triggerToast('কমিটির স্মরণীয় ব্যক্তি সফলভাবে যুক্ত করা হয়েছে!');
      setMemorialForm({
        member_name: '',
        lifespan: '',
        contribution_headline: '',
        contribution_details: '',
        image_url: ''
      });
      setSelectedMemorialFile(null);
      setShowMemorialModal(false);
      alert("সফলভাবে ডাটাবেসে জমা হয়েছে!");
    } catch (err) {
      alert("ডাটা জমা হয়নি! কারণ: " + err.message);
    } finally {
      setIsMemorialUploading(false);
    }
  };

  // 1. Edit Achievement Submit
  const handleEditAchievementSubmit = async (e) => {
    e.preventDefault();
    if (!editingAchievement.student_name.trim() || !editingAchievement.headline.trim() || !editingAchievement.description.trim()) {
      triggerToast('সকল প্রয়োজনীয় ঘর পূরণ করুন।', 'error');
      return;
    }
    try {
      const docRef = doc(db, "achievements", editingAchievement.id);
      await updateDoc(docRef, {
        student_name: editingAchievement.student_name.trim(),
        student_class: editingAchievement.student_class,
        headline: editingAchievement.headline.trim(),
        description: editingAchievement.description.trim(),
        image_url: editingAchievement.image_url ? editingAchievement.image_url.trim() : null
      });

      triggerToast('শিক্ষার্থীর সাফল্য সফলভাবে আপডেট করা হয়েছে!');
      setEditingAchievement(null);
      loadDatabaseData();
    } catch (err) {
      alert("আপডেট ব্যর্থ হয়েছে! কারণ: " + err.message);
    }
  };

  // 2. Edit Memorial Submit (with optional image upload / update)
  const handleEditMemorialSubmit = async (e) => {
    e.preventDefault();
    if (!editingMemorial.member_name.trim() || !editingMemorial.lifespan.trim() || !editingMemorial.contribution_headline.trim() || !editingMemorial.contribution_details.trim()) {
      triggerToast('সকল প্রয়োজনীয় ঘর পূরণ করুন।', 'error');
      return;
    }
    
    setIsMemorialUploading(true);
    triggerToast('📖 অপেক্ষার প্রতিদান উত্তম,একটু ধৈর্য ধরুন।', 'success');

    try {
      let finalImageUrl = editingMemorial.image_url || '';

      if (selectedEditMemorialFile) {
        const { getStorage, ref: sRef, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const storage = getStorage();
        const fileRef = sRef(storage, `memorial/${Date.now()}_${selectedEditMemorialFile.name}`);
        const snapshot = await uploadBytes(fileRef, selectedEditMemorialFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      const docRef = doc(db, "memorial_committee", editingMemorial.id);
      await updateDoc(docRef, {
        member_name: editingMemorial.member_name.trim(),
        lifespan: editingMemorial.lifespan.trim(),
        contribution_headline: editingMemorial.contribution_headline.trim(),
        contribution_details: editingMemorial.contribution_details.trim(),
        image_url: finalImageUrl
      });

      triggerToast('কমিটির স্মরণীয় ব্যক্তিত্ব সফলভাবে আপডেট করা হয়েছে!');
      setEditingMemorial(null);
      setSelectedEditMemorialFile(null);
      loadDatabaseData();
    } catch (err) {
      alert("আপডেট ব্যর্থ হয়েছে! কারণ: " + err.message);
    } finally {
      setIsMemorialUploading(false);
    }
  };

  // 3. Delete Achievement
  const handleDeleteAchievement = async (id) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই শিক্ষার্থীর সাফল্য ডিলিট করতে চান?")) return;
    try {
      const docRef = doc(db, "achievements", id);
      await deleteDoc(docRef);
      triggerToast('শিক্ষার্থীর সাফল্য সফলভাবে ডিলিট করা হয়েছে!');
      loadDatabaseData();
    } catch (err) {
      alert("ডিলিট ব্যর্থ হয়েছে! কারণ: " + err.message);
    }
  };

  // 4. Delete Memorial
  const handleDeleteMemorial = async (id) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই স্মরণীয় ব্যক্তিত্ব ডিলিট করতে চান?")) return;
    try {
      const docRef = doc(db, "memorial_committee", id);
      await deleteDoc(docRef);
      triggerToast('স্মরণীয় ব্যক্তিত্ব সফলভাবে ডিলিট করা হয়েছে!');
      loadDatabaseData();
    } catch (err) {
      alert("ডিলিট ব্যর্থ হয়েছে! কারণ: " + err.message);
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
              { id: 'online_admissions', label: 'অনলাইন আবেদন', icon: FileText },
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
              { id: 'online_admissions', label: 'অনলাইন আবেদন', icon: FileText },
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
              <p className="text-xs text-amber-400 mt-3 font-semibold font-serif tracking-wide">📖 অপেক্ষার প্রতিদান উত্তম,একটু ধৈর্য ধরুন।</p>
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
                <div className="space-y-6 animate-fade-in relative">
                  {/* Image Upload Loading Overlay */}
                  {isTeacherUploading && (
                    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/65 backdrop-blur-md">
                      <div className="bg-[#031d12]/90 border border-emerald-500/30 p-8 rounded-3xl text-center shadow-2xl max-w-md mx-4 animate-pulse">
                        <Loader2 className="h-12 w-12 text-amber-400 animate-spin mx-auto mb-4" />
                        <h4 className="text-lg font-black text-amber-400 mb-2">ফাইল আপলোড হচ্ছে</h4>
                        <p className="text-emerald-100/90 text-sm font-semibold">{teacherUploadingMsg}</p>
                      </div>
                    </div>
                  )}

                  {/* Header & Sub-tab Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-950/20 pb-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-amber-400 flex items-center gap-2">
                        <Users className="h-6 w-6 text-emerald-400" />
                        <span>শিক্ষক ম্যানেজমেন্ট পোর্টাল</span>
                      </h2>
                      <p className={`text-xs ${isDarkMode ? 'text-emerald-300/70' : 'text-slate-500'} font-semibold mt-1`}>
                        মাদ্রাসার সম্মানিত শিক্ষকদের তথ্য নিবন্ধন ও হালনাগাদ করার ডেডিকেটেড সেল।
                      </p>
                    </div>

                    <div className="flex bg-[#02100a] p-1 rounded-2xl border border-emerald-900/35">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTeacherSubTab('list');
                          resetTeacherForm();
                        }}
                        className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                          activeTeacherSubTab === 'list'
                            ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                            : 'text-emerald-400 hover:text-white'
                        }`}
                      >
                        📋 শিক্ষক তালিকা
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTeacherSubTab('add');
                          if (!editingTeacherId) resetTeacherForm();
                        }}
                        className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                          activeTeacherSubTab === 'add'
                            ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                            : 'text-emerald-400 hover:text-white'
                        }`}
                      >
                        {editingTeacherId ? '📝 শিক্ষক সংশোধন' : '➕ শিক্ষক যোগ'}
                      </button>
                    </div>
                  </div>

                  {/* Sub-tab 1: Teachers List */}
                  {activeTeacherSubTab === 'list' && (
                    <div className="space-y-6">
                      {/* Search and Stats Cards */}
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                        <div className="lg:col-span-2 relative">
                          <Search className="absolute left-3 top-3.5 h-4 w-4 text-emerald-500/70" />
                          <input
                            type="text"
                            value={teacherSearchQuery}
                            onChange={(e) => setTeacherSearchQuery(e.target.value)}
                            placeholder="নাম, আইডি, পদবী বা বিভাগ দিয়ে খুঁজুন..."
                            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 font-sans ${
                              isDarkMode
                                ? 'bg-[#02100a] border-emerald-800/60 text-white placeholder-emerald-700'
                                : 'bg-white border-gray-300 text-slate-900'
                            }`}
                          />
                          {teacherSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setTeacherSearchQuery('')}
                              className="absolute right-3 top-2.5 text-xs text-amber-500 font-bold hover:text-amber-400 cursor-pointer"
                            >
                              মুছুন
                            </button>
                          )}
                        </div>

                        {/* Quick Stats */}
                        <div className={`p-3 rounded-2xl border flex items-center justify-between ${
                          isDarkMode ? 'bg-[#02100a]/50 border-emerald-950/40 text-white' : 'bg-emerald-50 border-emerald-100 text-emerald-900'
                        }`}>
                          <span className="text-xs font-bold">মোট শিক্ষক</span>
                          <span className="text-sm sm:text-base font-sans font-black text-amber-400 bg-[#031d12] px-2.5 py-0.5 rounded-lg border border-emerald-900/30">
                            {teachersList.length} জন
                          </span>
                        </div>

                        <div className={`p-3 rounded-2xl border flex items-center justify-between ${
                          isDarkMode ? 'bg-[#02100a]/50 border-emerald-950/40 text-white' : 'bg-emerald-50 border-emerald-100 text-emerald-900'
                        }`}>
                          <span className="text-xs font-bold">সক্রিয় শিক্ষক</span>
                          <span className="text-sm sm:text-base font-sans font-black text-emerald-400 bg-[#031d12] px-2.5 py-0.5 rounded-lg border border-emerald-900/30">
                            {teachersList.filter(t => t.status === 'সক্রিয়' || !t.status).length} জন
                          </span>
                        </div>
                      </div>

                      {/* Teachers Card Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {teachersList.filter(tea => {
                          const queryStr = teacherSearchQuery.toLowerCase();
                          const nameBn = (tea.name_bn || tea.name || '').toLowerCase();
                          const nameEn = (tea.name_en || '').toLowerCase();
                          const tid = (tea.teacher_id || '').toLowerCase();
                          const desig = (tea.designation || '').toLowerCase();
                          const dept = (tea.department || '').toLowerCase();
                          return nameBn.includes(queryStr) || nameEn.includes(queryStr) || tid.includes(queryStr) || desig.includes(queryStr) || dept.includes(queryStr);
                        }).length > 0 ? (
                          teachersList
                            .filter(tea => {
                              const queryStr = teacherSearchQuery.toLowerCase();
                              const nameBn = (tea.name_bn || tea.name || '').toLowerCase();
                              const nameEn = (tea.name_en || '').toLowerCase();
                              const tid = (tea.teacher_id || '').toLowerCase();
                              const desig = (tea.designation || '').toLowerCase();
                              const dept = (tea.department || '').toLowerCase();
                              return nameBn.includes(queryStr) || nameEn.includes(queryStr) || tid.includes(queryStr) || desig.includes(queryStr) || dept.includes(queryStr);
                            })
                            .map((tea, idx) => {
                              const isHafiz = tea.is_hafiz === true || tea.is_hafiz === 'true';
                              const isQari = tea.is_qari === true || tea.is_qari === 'true';
                              const isDawra = tea.is_dawra === true || tea.is_dawra === 'true';
                              
                              return (
                                <div
                                  key={tea.id || idx}
                                  className={`border rounded-3xl p-5 shadow-lg relative flex flex-col justify-between overflow-hidden group hover:scale-[1.01] hover:shadow-xl transition-all duration-300 ${
                                    isDarkMode ? 'bg-[#031d12] border-emerald-900/40 text-emerald-100' : 'bg-white border-gray-200 text-slate-800'
                                  }`}
                                >
                                  {/* Upper Badge Layer */}
                                  <div className="flex items-center justify-between mb-4">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      tea.status === 'সক্রিয়' || !tea.status
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/25'
                                    }`}>
                                      {tea.status || 'সক্রিয়'}
                                    </span>
                                    <span className="text-[10px] font-sans font-black text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded-full border border-amber-500/15">
                                      {tea.teacher_id || 'SN-TEA-XXXX'}
                                    </span>
                                  </div>

                                  {/* Teacher Avatar & Info */}
                                  <div className="flex items-start gap-4 mb-4">
                                    {tea.photo_url ? (
                                      <img
                                        src={tea.photo_url}
                                        alt={tea.name_bn || tea.name}
                                        className="h-16 w-16 rounded-2xl object-cover border border-emerald-500/30 shadow-md bg-[#02100a]"
                                      />
                                    ) : (
                                      <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-white font-black text-xl border border-emerald-500/20 shadow-md ${tea.avatarBg || 'bg-emerald-800'}`}>
                                        {(tea.name_bn || tea.name || 'শ').substring(0, 1)}
                                      </div>
                                    )}

                                    <div className="space-y-1">
                                      <h4 className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                        {tea.name_bn || tea.name}
                                      </h4>
                                      {tea.name_en && (
                                        <p className="text-[11px] font-sans font-bold text-emerald-400 uppercase tracking-wide">
                                          {tea.name_en}
                                        </p>
                                      )}
                                      <p className="text-xs font-bold text-amber-400">
                                        {tea.designation}
                                      </p>
                                      <p className={`text-[11px] font-semibold ${isDarkMode ? 'text-emerald-300/60' : 'text-slate-500'}`}>
                                        {tea.department || 'সাধারণ বিভাগ'}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Details Section */}
                                  <div className={`border-t border-emerald-950/10 pt-3 mt-1 space-y-2 text-[11px] sm:text-xs font-semibold ${isDarkMode ? 'text-emerald-200/80' : 'text-slate-600'}`}>
                                    <div className="flex items-center gap-1">
                                      <span className="text-emerald-500">📞</span>
                                      <span className="font-sans">{tea.mobile || tea.phone || 'মোবাইল নম্বর নেই'}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-emerald-500">📅</span>
                                      <span>যোগদান: {tea.joining_date || tea.joinDate || 'যোগদান তারিখ নেই'}</span>
                                    </div>

                                    {/* Religious badges */}
                                    {(isHafiz || isQari || isDawra) && (
                                      <div className="flex flex-wrap gap-1.5 pt-2">
                                        {isHafiz && (
                                          <span className="bg-amber-400/10 text-amber-400 text-[9px] px-1.5 py-0.5 rounded border border-amber-400/20 font-bold">হাফেজ</span>
                                        )}
                                        {isQari && (
                                          <span className="bg-amber-400/10 text-amber-400 text-[9px] px-1.5 py-0.5 rounded border border-amber-400/20 font-bold">ক্বারী</span>
                                        )}
                                        {isDawra && (
                                          <span className="bg-amber-400/10 text-amber-400 text-[9px] px-1.5 py-0.5 rounded border border-amber-400/20 font-bold">দাওরায়ে হাদিস</span>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Card Action Buttons */}
                                  <div className="flex gap-2.5 mt-4 border-t border-emerald-950/10 pt-3">
                                    <button
                                      type="button"
                                      onClick={() => handleEditTeacher(tea)}
                                      className="flex-1 py-2 bg-emerald-700/20 hover:bg-emerald-700/35 border border-emerald-700/30 text-emerald-300 font-bold text-xs rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <span>📝 এডিট করুন</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTeacher(tea.id, tea.name_bn || tea.name)}
                                      className="flex-1 py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 font-bold text-xs rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <span>🗑️ ডিলিট করুন</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                        ) : (
                          <div className={`col-span-full py-12 text-center border rounded-3xl border-dashed ${
                            isDarkMode ? 'bg-[#02100a]/40 border-emerald-900/40 text-emerald-455' : 'bg-slate-50 border-gray-300 text-slate-500'
                          }`}>
                            <p className="font-bold text-sm sm:text-base">খোঁজা অনুযায়ী কোনো শিক্ষক প্রোফাইল খুঁজে পাওয়া যায়নি।</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sub-tab 2: Add / Edit Teacher Form */}
                  {activeTeacherSubTab === 'add' && (
                    <div className="space-y-6">
                      
                      {/* Guidance alert */}
                      <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold leading-relaxed flex items-start gap-2 ${
                        isDarkMode ? 'bg-amber-400/5 border-amber-400/20 text-amber-300/90' : 'bg-amber-50 border-amber-250 text-amber-900'
                      }`}>
                        <span className="text-base sm:text-lg shrink-0">⚠️</span>
                        <div>
                          <p className="font-black text-amber-400 mb-0.5">শিক্ষক ডাটাবেস এন্ট্রি গাইডলাইন</p>
                          <p>তারকাচিহ্ন (*) যুক্ত সব ঘর নিখুঁতভাবে পূরণ করা বাধ্যতামূলক। ছবি ও এনআইডি ফাইল সিলেক্ট করার সাথে সাথেই ব্যাকগ্রাউন্ডে আপলোড সম্পন্ন হবে। অনুগ্রহ করে সম্পূর্ণ লোডিং সম্পন্ন হওয়া পর্যন্ত অপেক্ষা করুন।</p>
                        </div>
                      </div>

                      <form onSubmit={handleTeacherSubmit} className="space-y-6">
                        {/* 1. Personal Information */}
                        <div className={`border rounded-3xl p-5 sm:p-6 shadow-xl ${
                          isDarkMode ? 'bg-[#031d12] border-emerald-900/40' : 'bg-white border-gray-200 text-slate-900'
                        }`}>
                          <h3 className="text-sm sm:text-base font-black text-amber-400 border-b border-emerald-900/40 pb-3 mb-5 flex items-center gap-2">
                            <span className="text-emerald-400 text-lg">👤</span>
                            <span>সেকশন ১: ব্যক্তিগত তথ্য (Personal Information) *</span>
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">শিক্ষকের নাম (বাংলা) *</label>
                              <input
                                type="text"
                                required
                                value={teacherForm.name_bn}
                                onChange={(e) => setTeacherForm({ ...teacherForm, name_bn: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-950'
                                }`}
                                placeholder="এখানে শিক্ষকের নাম (বাংলা) লিখুন"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">শিক্ষকের নাম (ইংরেজি) *</label>
                              <input
                                type="text"
                                required
                                value={teacherForm.name_en}
                                onChange={(e) => setTeacherForm({ ...teacherForm, name_en: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 font-sans ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-950'
                                }`}
                                placeholder="এখানে শিক্ষকের নাম (ইংরেজি) লিখুন"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">পিতার নাম *</label>
                              <input
                                type="text"
                                required
                                value={teacherForm.father_name}
                                onChange={(e) => setTeacherForm({ ...teacherForm, father_name: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                                placeholder="এখানে পিতার নাম লিখুন"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">মাতার নাম *</label>
                              <input
                                type="text"
                                required
                                value={teacherForm.mother_name}
                                onChange={(e) => setTeacherForm({ ...teacherForm, mother_name: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                                placeholder="এখানে মাতার নাম লিখুন"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">জন্ম তারিখ *</label>
                              <input
                                type="date"
                                required
                                value={teacherForm.dob}
                                onChange={(e) => setTeacherForm({ ...teacherForm, dob: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">এনআইডি/জন্ম নিবন্ধন নম্বর *</label>
                              <input
                                type="text"
                                required
                                value={teacherForm.nid}
                                onChange={(e) => setTeacherForm({ ...teacherForm, nid: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                                placeholder="এখানে এনআইডি বা জন্ম নিবন্ধন নাম্বার লিখুন"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">লিঙ্গ *</label>
                              <select
                                value={teacherForm.gender}
                                onChange={(e) => setTeacherForm({ ...teacherForm, gender: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white text-emerald-100 focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                              >
                                <option value="পুরুষ">পুরুষ</option>
                                <option value="মহিলা">মহিলা</option>
                                <option value="অন্যান্য">অন্যান্য</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">বৈবাহিক অবস্থা</label>
                              <select
                                value={teacherForm.marital_status}
                                onChange={(e) => setTeacherForm({ ...teacherForm, marital_status: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white text-emerald-100 focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                              >
                                <option value="অবিবাহিত">অবিবাহিত</option>
                                <option value="বিবাহিত">বিবাহিত</option>
                                <option value="অন্যান্য">অন্যান্য</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">রক্তের গ্রুপ</label>
                              <select
                                value={teacherForm.blood_group}
                                onChange={(e) => setTeacherForm({ ...teacherForm, blood_group: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white text-emerald-100 focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                              >
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                              </select>
                            </div>

                            {/* Photos inputs */}
                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                              <div className="border border-dashed border-emerald-800/60 p-4 rounded-2xl flex items-center justify-between gap-4">
                                <div className="flex-1">
                                  <label className="block text-xs font-bold text-amber-400 mb-1">শিক্ষকের ছবি (Photo) *</label>
                                  <p className="text-[10px] text-gray-400 font-semibold mb-2">জেপিজি বা পিএনজি ফাইল। সাইজ সর্বোচ্চ ২ এমবি।</p>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleTeacherPhotoChange}
                                    required={!editingTeacherId && !teacherForm.photo_url}
                                    className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-900/35 file:text-emerald-300 hover:file:bg-emerald-900/50 file:cursor-pointer"
                                  />
                                </div>
                                {teacherForm.photo_url && (
                                  <img
                                    src={teacherForm.photo_url}
                                    alt="Preview"
                                    className="h-14 w-14 rounded-xl object-cover border border-emerald-500/30 bg-[#02100a] shrink-0"
                                  />
                                )}
                              </div>

                              <div className="border border-dashed border-emerald-800/60 p-4 rounded-2xl flex items-center justify-between gap-4">
                                <div className="flex-1">
                                  <label className="block text-xs font-bold text-amber-400 mb-1">এনআইডি স্ক্যান কপি (NID Scan) *</label>
                                  <p className="text-[10px] text-gray-400 font-semibold mb-2">এনআইডি কার্ডের স্পষ্ট রঙিন ছবি বা স্ক্যান কপি।</p>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleTeacherNidChange}
                                    required={!editingTeacherId && !teacherForm.nid_scan_url}
                                    className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-900/35 file:text-emerald-300 hover:file:bg-emerald-900/50 file:cursor-pointer"
                                  />
                                </div>
                                {teacherForm.nid_scan_url && (
                                  <div className="h-14 w-14 rounded-xl border border-emerald-500/30 bg-[#02100a] flex flex-col items-center justify-center text-emerald-400 text-xs font-bold shrink-0">
                                    <span>✔️</span>
                                    <span className="text-[9px] mt-0.5">আপলোডড</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2. Contact Information */}
                        <div className={`border rounded-3xl p-5 sm:p-6 shadow-xl ${
                          isDarkMode ? 'bg-[#031d12] border-emerald-900/40' : 'bg-white border-gray-200 text-slate-900'
                        }`}>
                          <h3 className="text-sm sm:text-base font-black text-amber-400 border-b border-emerald-900/40 pb-3 mb-5 flex items-center gap-2">
                            <span className="text-emerald-400 text-lg">📞</span>
                            <span>সেকশন ২: যোগাযোগের তথ্য (Contact Information) *</span>
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">মোবাইল নম্বর *</label>
                              <input
                                type="text"
                                required
                                value={teacherForm.mobile}
                                onChange={(e) => setTeacherForm({ ...teacherForm, mobile: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-950'
                                }`}
                                placeholder="এখানে ১১ ডিজিটের মোবাইল নাম্বার লিখুন"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">বিকল্প মোবাইল নম্বর</label>
                              <input
                                type="text"
                                value={teacherForm.alt_mobile}
                                onChange={(e) => setTeacherForm({ ...teacherForm, alt_mobile: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                                placeholder="এখানে বিকল্প মোবাইল নাম্বার লিখুন"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">হোয়াটসঅ্যাপ নম্বর (WhatsApp)</label>
                              <input
                                type="text"
                                value={teacherForm.whatsapp}
                                onChange={(e) => setTeacherForm({ ...teacherForm, whatsapp: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                                placeholder="এখানে হোয়াটসঅ্যাপ নাম্বার লিখুন"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">ইমেইল ঠিকানা</label>
                              <input
                                type="email"
                                value={teacherForm.email}
                                onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                                placeholder="এখানে ইমেইল এড্রেস দিন"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">বর্তমান ঠিকানা *</label>
                              <textarea
                                required
                                rows="2"
                                value={teacherForm.present_address}
                                onChange={(e) => setTeacherForm({ ...teacherForm, present_address: e.target.value })}
                                className={`w-full border rounded-xl py-2 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                                placeholder="এখানে বিস্তারিত বর্তমান ঠিকানা লিখুন"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">স্থায়ী ঠিকানা *</label>
                              <textarea
                                required
                                rows="2"
                                value={teacherForm.permanent_address}
                                onChange={(e) => setTeacherForm({ ...teacherForm, permanent_address: e.target.value })}
                                className={`w-full border rounded-xl py-2 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                                placeholder="এখানে বিস্তারিত স্থায়ী ঠিকানা লিখুন"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 3. Academic Credentials */}
                        <div className={`border rounded-3xl p-5 sm:p-6 shadow-xl ${
                          isDarkMode ? 'bg-[#031d12] border-emerald-900/40' : 'bg-white border-gray-200 text-slate-900'
                        }`}>
                          <h3 className="text-sm sm:text-base font-black text-amber-400 border-b border-emerald-900/40 pb-3 mb-5 flex items-center gap-2">
                            <span className="text-emerald-400 text-lg">🎓</span>
                            <span>সেকশন ৩: শিক্ষাগত যোগ্যতা (Academic Credentials) *</span>
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-5">
                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">সর্বোচ্চ ডিগ্রি *</label>
                              <input
                                type="text"
                                required
                                value={teacherForm.highest_degree}
                                onChange={(e) => setTeacherForm({ ...teacherForm, highest_degree: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                                placeholder="এখানে শিক্ষকের সর্বোচ্চ শিক্ষাগত ডিগ্রি লিখুন"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">বিষয়/বিভাগ *</label>
                              <input
                                type="text"
                                required
                                value={teacherForm.subject}
                                onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                                placeholder="এখানে ডিগ্রির বিষয় বা বিভাগ লিখুন"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">পাসের সন *</label>
                              <input
                                type="text"
                                required
                                value={teacherForm.passing_year}
                                onChange={(e) => setTeacherForm({ ...teacherForm, passing_year: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                                placeholder="এখানে পাস করার সাল (সন) লিখুন"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">ফলাফল (GPA/Division) *</label>
                              <input
                                type="text"
                                required
                                value={teacherForm.result}
                                onChange={(e) => setTeacherForm({ ...teacherForm, result: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                                placeholder="এখানে অর্জিত রেজাল্ট বা জিপিএ লিখুন"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 4. Job Details */}
                        <div className={`border rounded-3xl p-5 sm:p-6 shadow-xl ${
                          isDarkMode ? 'bg-[#031d12] border-emerald-900/40' : 'bg-white border-gray-200 text-slate-900'
                        }`}>
                          <h3 className="text-sm sm:text-base font-black text-amber-400 border-b border-emerald-900/40 pb-3 mb-5 flex items-center gap-2">
                            <span className="text-emerald-400 text-lg">💼</span>
                            <span>সেকশন ৪: চাকরির তথ্য (Job Information) *</span>
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">শিক্ষক আইডি (Teacher ID)</label>
                              <input
                                type="text"
                                disabled
                                value={editingTeacherId ? teacherForm.teacher_id : 'অটো-জেনারেটেড আইডি'}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none select-none opacity-70 cursor-not-allowed ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/30 text-amber-400/85' : 'bg-slate-100 border-gray-300 text-amber-600'
                                }`}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">পদবী *</label>
                              <input
                                type="text"
                                required
                                value={teacherForm.designation}
                                onChange={(e) => setTeacherForm({ ...teacherForm, designation: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-950'
                                }`}
                                placeholder="এখানে শিক্ষকের পদবী লিখুন"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-405 mb-1">বিভাগ (কর্মক্ষেত্র) *</label>
                              <input
                                type="text"
                                required
                                value={teacherForm.department}
                                onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                                placeholder="এখানে মাদ্রাসার কর্মক্ষেত্র বিভাগ লিখুন"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-405 mb-1">যোগদানের তারিখ *</label>
                              <input
                                type="date"
                                required
                                value={teacherForm.joining_date}
                                onChange={(e) => setTeacherForm({ ...teacherForm, joining_date: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">অবস্থা (Status) *</label>
                              <select
                                value={teacherForm.status}
                                onChange={(e) => setTeacherForm({ ...teacherForm, status: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white text-emerald-100 focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                              >
                                <option value="সক্রিয়">সক্রিয়</option>
                                <option value="অবসরপ্রাপ্ত">অবসরপ্রাপ্ত</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">মাসিক বেতন / সম্মানী</label>
                              <input
                                type="number"
                                value={teacherForm.salary}
                                onChange={(e) => setTeacherForm({ ...teacherForm, salary: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                                placeholder="এখানে মাসিক বেতন বা সম্মানীর পরিমাণ লিখুন"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 5. Religious optional qualifications */}
                        <div className={`border rounded-3xl p-5 sm:p-6 shadow-xl ${
                          isDarkMode ? 'bg-[#031d12] border-emerald-900/40' : 'bg-white border-gray-200 text-slate-900'
                        }`}>
                          <h3 className="text-sm sm:text-base font-black text-amber-400 border-b border-emerald-900/40 pb-3 mb-5 flex items-center gap-2">
                            <span className="text-emerald-400 text-lg">🕌</span>
                            <span>সেকশন ৫: ধর্মীয় অতিরিক্ত যোগ্যতা (Religious Optional Qualifications)</span>
                          </h3>

                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-6 items-center">
                              <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-semibold select-none">
                                <input
                                  type="checkbox"
                                  checked={teacherForm.is_hafiz}
                                  onChange={(e) => setTeacherForm({ ...teacherForm, is_hafiz: e.target.checked })}
                                  className="h-4 w-4 rounded border-emerald-850 text-amber-500 focus:ring-amber-400 cursor-pointer"
                                />
                                <span>হাফেজ (Hifz)</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-semibold select-none">
                                <input
                                  type="checkbox"
                                  checked={teacherForm.is_qari}
                                  onChange={(e) => setTeacherForm({ ...teacherForm, is_qari: e.target.checked })}
                                  className="h-4 w-4 rounded border-emerald-850 text-amber-500 focus:ring-amber-400 cursor-pointer"
                                />
                                <span>ক্বারী (Qira'at)</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-semibold select-none">
                                <input
                                  type="checkbox"
                                  checked={teacherForm.is_dawra}
                                  onChange={(e) => setTeacherForm({ ...teacherForm, is_dawra: e.target.checked })}
                                  className="h-4 w-4 rounded border-emerald-850 text-amber-500 focus:ring-amber-400 cursor-pointer"
                                />
                                <span>দাওরায়ে হাদিস (Dawra-e-Hadith)</span>
                              </label>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-455 mb-1">অন্যান্য বিশেষ যোগ্যতা / দক্ষতা</label>
                              <input
                                type="text"
                                value={teacherForm.special_skills}
                                onChange={(e) => setTeacherForm({ ...teacherForm, special_skills: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                                placeholder="অন্য কোনো বিশেষ যোগ্যতা বা দক্ষতা থাকলে এখানে লিখুন"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 6. Bank & Financial Information */}
                        <div className={`border rounded-3xl p-5 sm:p-6 shadow-xl ${
                          isDarkMode ? 'bg-[#031d12] border-emerald-900/40' : 'bg-white border-gray-200 text-slate-900'
                        }`}>
                          <h3 className="text-sm sm:text-base font-black text-amber-400 border-b border-emerald-900/40 pb-3 mb-5 flex items-center gap-2">
                            <span className="text-emerald-400 text-lg">🏦</span>
                            <span>সেকশন ৬: ব্যাংক ও আর্থিক তথ্য (Bank & Financial Information)</span>
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">ব্যাংকের নাম</label>
                              <input
                                type="text"
                                value={teacherForm.bank_name}
                                onChange={(e) => setTeacherForm({ ...teacherForm, bank_name: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                                placeholder="এখানে ব্যাংকের নাম লিখুন"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">শাখার নাম</label>
                              <input
                                type="text"
                                value={teacherForm.bank_branch}
                                onChange={(e) => setTeacherForm({ ...teacherForm, bank_branch: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                                placeholder="এখানে ব্যাংক শাখার নাম লিখুন"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">ব্যাংক অ্যাকাউন্ট নম্বর</label>
                              <input
                                type="text"
                                value={teacherForm.bank_account_no}
                                onChange={(e) => setTeacherForm({ ...teacherForm, bank_account_no: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                                placeholder="এখানে ব্যাংক অ্যাকাউন্ট নাম্বার লিখুন"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">রাউটিং নম্বর</label>
                              <input
                                type="text"
                                value={teacherForm.routing_no}
                                onChange={(e) => setTeacherForm({ ...teacherForm, routing_no: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                                placeholder="এখানে ব্যাংক রাউটিং নাম্বার লিখুন"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">মোবাইল ব্যাংকিং সেবাদাতা</label>
                              <select
                                value={teacherForm.mobile_banking_type}
                                onChange={(e) => setTeacherForm({ ...teacherForm, mobile_banking_type: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white text-emerald-100 focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                              >
                                <option value="none">প্রযোজ্য নয়</option>
                                <option value="bkash">বিকাশ (bKash)</option>
                                <option value="nagad">নগদ (Nagad)</option>
                                <option value="rocket">রকেট (Rocket)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">মোবাইল ব্যাংকিং নম্বর</label>
                              <input
                                type="text"
                                value={teacherForm.mobile_banking_no}
                                onChange={(e) => setTeacherForm({ ...teacherForm, mobile_banking_no: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                                placeholder="এখানে মোবাইল ব্যাংকিং অ্যাকাউন্ট নাম্বার লিখুন"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 7. Account Login Credentials */}
                        <div className={`border rounded-3xl p-5 sm:p-6 shadow-xl ${
                          isDarkMode ? 'bg-[#031d12] border-emerald-900/40' : 'bg-white border-gray-200 text-slate-900'
                        }`}>
                          <h3 className="text-sm sm:text-base font-black text-amber-400 border-b border-emerald-900/40 pb-3 mb-5 flex items-center gap-2">
                            <span className="text-emerald-400 text-lg">🔑</span>
                            <span>সেকশন ৭: অ্যাকাউন্ট লগইন তথ্য (Account Login Credentials)</span>
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">লগইন ইউজারনেম (শিক্ষক আইডি)*</label>
                              <input
                                type="text"
                                value={teacherForm.login_username}
                                onChange={(e) => setTeacherForm({ ...teacherForm, login_username: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                                placeholder="এখানে শিক্ষকের নির্দিষ্ট আইডি নম্বরটি লিখুন (যেমন: SN-TEA-101)"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1">লগইন পাসওয়ার্ড (Login Password)</label>
                              <input
                                type="password"
                                value={teacherForm.login_password}
                                onChange={(e) => setTeacherForm({ ...teacherForm, login_password: e.target.value })}
                                className={`w-full border rounded-xl py-2.5 px-3 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-350 text-slate-955'
                                }`}
                                placeholder="লগইন করার জন্য একটি স্ট্রং পাসওয়ার্ড সেট করুন"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Form action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                          <button
                            type="submit"
                            className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-2xl active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>{editingTeacherId ? '🔄 তথ্য আপডেট করুন' : '➕ শিক্ষক নিবন্ধন সম্পন্ন করুন'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              resetTeacherForm();
                              setActiveTeacherSubTab('list');
                            }}
                            className={`px-6 py-3.5 border rounded-2xl text-sm font-bold active:scale-95 transition-all cursor-pointer ${
                              isDarkMode
                                ? 'bg-transparent border-emerald-800 text-emerald-300 hover:bg-emerald-950/20'
                                : 'bg-slate-50 border-gray-350 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            বাতিল করুন
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
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
                      className="bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-600 border-4 border-amber-300 hover:border-amber-450 rounded-3xl p-8 relative overflow-hidden shadow-[0_10px_35px_rgba(245,158,11,0.35)] hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[220px]"
                    >
                      <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-600 to-emerald-800"></div>
                      <div className="flex items-start justify-between h-full">
                        <div className="space-y-4">
                          <h3 className="text-xl sm:text-2xl font-black text-slate-950 flex items-center gap-2.5">
                            <Award className="h-7 w-7 text-slate-950" />
                            <span>সাফল্য যোগ করুন</span>
                          </h3>
                          <p className="text-xs sm:text-sm leading-relaxed font-bold text-slate-900/90 max-w-md">
                            বোর্ড পরীক্ষায় জিপিএ-৫ প্রাপ্তি, হেফজ বা জাতীয় প্রতিযোগিতায় অসামান্য সাফল্য অর্জনকারী শিক্ষার্থীদের গৌরবগাঁথা যুক্ত করুন।
                          </p>
                        </div>
                        <div className="p-4 bg-slate-950/10 text-slate-950 rounded-2xl shrink-0 group-hover:bg-slate-950/20 transition-all">
                          <Award className="h-8 w-8" />
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Memorial Members */}
                    <div 
                      onClick={() => {
                        setMemorialForm({ member_name: '', lifespan: '', contribution_headline: '', contribution_details: '', image_url: '' });
                        setSelectedMemorialFile(null);
                        setShowMemorialModal(true);
                      }}
                      className="bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-600 border-4 border-amber-300 hover:border-amber-450 rounded-3xl p-8 relative overflow-hidden shadow-[0_10px_35px_rgba(245,158,11,0.35)] hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[220px]"
                    >
                      <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-600 to-emerald-800"></div>
                      <div className="flex items-start justify-between h-full">
                        <div className="space-y-4">
                          <h3 className="text-xl sm:text-2xl font-black text-slate-950 flex items-center gap-2.5">
                            <BookOpen className="h-7 w-7 text-slate-950" />
                            <span>মেম্বার অ্যাড করুন</span>
                          </h3>
                          <p className="text-xs sm:text-sm leading-relaxed font-bold text-slate-900/90 max-w-md">
                            মাদ্রাসার প্রতিষ্ঠাতা, আজীবন দাতা বা গৌরবময় পরিচালনাকারী স্মরণীয় ব্যক্তিত্বদের স্মৃতি ও অবদানের কথা লিখে শ্রদ্ধাঞ্জলি জানান।
                          </p>
                        </div>
                        <div className="p-4 bg-slate-950/10 text-slate-950 rounded-2xl shrink-0 group-hover:bg-slate-950/20 transition-all">
                          <BookOpen className="h-8 w-8" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Distinct History Header */}
                  <div className="relative my-12 py-6 text-center border-y border-amber-500/35 bg-gradient-to-r from-emerald-950/15 via-[#042114] to-emerald-950/15 rounded-2xl shadow-inner animate-fade-in">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#031d12] px-4 py-0.5 border border-amber-500/35 rounded-full text-[10px] text-amber-400 font-bold uppercase tracking-widest font-sans">
                      Homepage History & Management
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-amber-400 flex items-center justify-center gap-3">
                      <span>📜 হোমপেজ তথ্য পরিবর্তন ও হিস্ট্রি প্যানেল</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-300 mt-2 font-semibold max-w-2xl mx-auto px-4">
                      ডাটাবেসের বর্তমান এক্সিসটিং হিস্ট্রি তালিকা। এখান থেকে যেকোনো সাফল্য বা স্মরণীয় ব্যক্তির তথ্য সংশোধন (Edit) বা স্থায়ীভাবে মুছে (Delete) ফেলতে পারেন।
                    </p>
                  </div>

                  {/* History Logs Grid: Achievements and Memorial Tables */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Table 1: Student Achievements */}
                    <div className={`border rounded-3xl p-6 shadow-xl relative ${
                      isDarkMode ? 'bg-[#031d12] border-emerald-900/40 text-emerald-100' : 'bg-white border-gray-200 text-slate-900'
                    }`}>
                      <h3 className="text-base font-bold text-amber-400 border-b border-emerald-900/40 pb-3 mb-5 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-amber-400" />
                          <span>১. শিক্ষার্থীর সাফল্য তালিকা</span>
                        </span>
                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full border border-emerald-500/25">
                          মোট: {achievementsList.length}টি
                        </span>
                      </h3>
                      <div className="overflow-x-auto scrollbar-none">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                          <thead>
                            <tr className={`border-b text-amber-450 font-bold ${
                              isDarkMode ? 'bg-[#02100a]/80 border-emerald-900' : 'bg-slate-50 border-gray-250 text-emerald-850'
                            }`}>
                              <th className="py-3 px-3.5">নাম ও শ্রেণী</th>
                              <th className="py-3 px-3.5">সাফল্য হেডলাইন</th>
                              <th className="py-3 px-3.5">বিবরণ</th>
                              <th className="py-3 px-3.5 text-center">অ্যাকশন</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-emerald-900/20">
                            {achievementsList.length > 0 ? (
                              achievementsList.map((ach) => (
                                <tr key={ach.id} className={`font-semibold font-sans transition-colors ${
                                  isDarkMode ? 'hover:bg-white/5 text-emerald-100' : 'hover:bg-slate-50 text-slate-800'
                                }`}>
                                  <td className="py-3 px-3.5">
                                    <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{ach.student_name}</div>
                                    <div className="text-[10px] text-gray-400">{ach.student_class}</div>
                                  </td>
                                  <td className="py-3 px-3.5 max-w-[150px] truncate" title={ach.headline}>{ach.headline}</td>
                                  <td className="py-3 px-3.5 max-w-[200px] truncate" title={ach.description}>{ach.description}</td>
                                  <td className="py-3 px-3.5 text-center">
                                    <div className="flex items-center justify-center gap-2.5">
                                      <button
                                        onClick={() => setEditingAchievement(ach)}
                                        className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-500/50 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                                        title="সম্পাদনা"
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteAchievement(ach.id)}
                                        className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 hover:text-rose-400 border border-rose-500/30 hover:border-rose-500/50 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                                        title="মুছে ফেলুন"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="py-8 text-center text-gray-400 font-bold">কোনো শিক্ষার্থীর সাফল্য তালিকাভুক্ত নেই।</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Table 2: Memorial Members */}
                    <div className={`border rounded-3xl p-6 shadow-xl relative ${
                      isDarkMode ? 'bg-[#031d12] border-emerald-900/40 text-emerald-100' : 'bg-white border-gray-200 text-slate-900'
                    }`}>
                      <h3 className="text-base font-bold text-emerald-400 border-b border-emerald-900/40 pb-3 mb-5 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-emerald-400" />
                          <span>২. স্মরণীয় ব্যক্তি তালিকা</span>
                        </span>
                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full border border-emerald-500/25">
                          মোট: {memoriamList.length}জন
                        </span>
                      </h3>
                      <div className="overflow-x-auto scrollbar-none">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                          <thead>
                            <tr className={`border-b text-amber-450 font-bold ${
                              isDarkMode ? 'bg-[#02100a]/80 border-emerald-900' : 'bg-slate-50 border-gray-250 text-emerald-850'
                            }`}>
                              <th className="py-3 px-3.5">নাম ও জীবনকাল</th>
                              <th className="py-3 px-3.5">অবদান হেডলাইন</th>
                              <th className="py-3 px-3.5">অবদান বিবরণ</th>
                              <th className="py-3 px-3.5 text-center">অ্যাকশন</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-emerald-900/20">
                            {memoriamList.length > 0 ? (
                              memoriamList.map((mem) => (
                                <tr key={mem.id} className={`font-semibold font-sans transition-colors ${
                                  isDarkMode ? 'hover:bg-white/5 text-emerald-100' : 'hover:bg-slate-50 text-slate-800'
                                }`}>
                                  <td className="py-3 px-3.5">
                                    <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{mem.member_name}</div>
                                    <div className="text-[10px] text-gray-400 font-sans">{mem.lifespan}</div>
                                  </td>
                                  <td className="py-3 px-3.5 max-w-[150px] truncate" title={mem.contribution_headline}>{mem.contribution_headline}</td>
                                  <td className="py-3 px-3.5 max-w-[200px] truncate" title={mem.contribution_details}>{mem.contribution_details}</td>
                                  <td className="py-3 px-3.5 text-center">
                                    <div className="flex items-center justify-center gap-2.5">
                                      <button
                                        onClick={() => { setSelectedEditMemorialFile(null); setEditingMemorial(mem); }}
                                        className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-450 hover:text-amber-300 border border-amber-500/30 hover:border-amber-500/50 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                                        title="সম্পাদনা"
                                      >
                                        <Edit2 className="h-4 w-4 text-amber-400" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteMemorial(mem.id)}
                                        className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 hover:text-rose-400 border border-rose-500/30 hover:border-rose-500/50 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                                        title="মুছে ফেলুন"
                                      >
                                        <Trash2 className="h-4 w-4 text-rose-500" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="py-8 text-center text-gray-400 font-bold">কোনো স্মরণীয় ব্যক্তিত্ব তালিকাভুক্ত নেই।</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
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

                  {/* Popup Modal 2: Memorial Figure — Single-Column Inline Layout */}
                  {showMemorialModal && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 pb-4 px-3 sm:px-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
                      <div className={`w-full max-w-xl rounded-3xl border-t-4 border-emerald-500 shadow-2xl relative my-4 p-5 md:p-6 ${
                        isDarkMode ? 'bg-[#031a10] text-white' : 'bg-white text-slate-900'
                      }`}>

                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-emerald-900/30 mb-4">
                          <h3 className="text-base font-black text-emerald-400 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 shrink-0" />
                            <span>কমিটির স্মরণীয় ব্যক্তিত্ব ফর্ম</span>
                          </h3>
                          <button
                            onClick={() => setShowMemorialModal(false)}
                            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleMemorialSubmit} className="space-y-3.5 text-left">
                          <div>
                            <label className="block text-xs font-bold text-emerald-400 mb-1">স্মরণীয় ব্যক্তির নাম *</label>
                            <input
                              type="text"
                              required
                              value={memorialForm.member_name}
                              onChange={(e) => setMemorialForm({...memorialForm, member_name: e.target.value})}
                              placeholder="মরহুম আলহাজ্ব নূর উদ্দিন আহমেদ"
                              className={`w-full border rounded-xl py-2.5 px-3.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors ${
                                isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-300 text-slate-900'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-emerald-400 mb-1">জন্ম-মৃত্যু সাল (জীবনকাল) *</label>
                            <input
                              type="text"
                              required
                              value={memorialForm.lifespan}
                              onChange={(e) => setMemorialForm({...memorialForm, lifespan: e.target.value})}
                              placeholder="উদা: ১৯৩০ - ২০০৮"
                              className={`w-full border rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors ${
                                isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-300 text-slate-900'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-emerald-400 mb-1">অবদান হেডলাইন * <span className="text-gray-500 font-normal">(সর্বোচ্চ ২৫ অক্ষর)</span></label>
                            <input
                              type="text"
                              required
                              maxLength={25}
                              value={memorialForm.contribution_headline}
                              onChange={(e) => setMemorialForm({...memorialForm, contribution_headline: e.target.value})}
                              placeholder="মাদ্রাসার ভূমি দাতা ও প্রতিষ্ঠাতা সভাপতি।"
                              className={`w-full border rounded-xl py-2.5 px-3.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors ${
                                isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-300 text-slate-900'
                              }`}
                            />
                            <div className="flex justify-end mt-0.5 pr-1">
                              <span className={`text-[10px] font-bold ${
                                memorialForm.contribution_headline.length >= 25 ? 'text-rose-500' : 'text-emerald-400'
                              }`}>
                                {memorialForm.contribution_headline.length}/25
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-emerald-400 mb-1">অবদান বিস্তারিত *</label>
                            <textarea
                              required
                              rows="3"
                              value={memorialForm.contribution_details}
                              onChange={(e) => setMemorialForm({...memorialForm, contribution_details: e.target.value})}
                              placeholder="মাদ্রাসার প্রতিষ্ঠা ও এর উন্নয়নে এই ব্যক্তির অবদান ও শ্রদ্ধাঞ্জলি স্মৃতিসমূহ বিস্তারিত লিখুন।"
                              className={`w-full border rounded-xl py-2.5 px-3.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors ${
                                isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-300 text-slate-900'
                              }`}
                            ></textarea>
                          </div>

                          {/* Optional Image Upload */}
                          <div>
                            <label className="block text-xs font-bold text-emerald-400 mb-1">
                              ছবি আপলোড করুন <span className="text-gray-500 font-normal">(ঐচ্ছিক)</span>
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) setSelectedMemorialFile(f);
                              }}
                              className={`w-full border rounded-xl py-2 px-3 text-xs focus:outline-none ${
                                isDarkMode
                                  ? 'bg-[#02100a] border-emerald-800/60 text-gray-300 file:bg-emerald-900/70 file:text-emerald-300 file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-2 file:cursor-pointer file:text-xs'
                                  : 'bg-slate-50 border-gray-300 text-slate-700'
                              }`}
                            />
                            {selectedMemorialFile && (
                              <div className="mt-2 flex items-center gap-2.5 bg-emerald-900/20 rounded-xl p-2 border border-emerald-800/30">
                                <img
                                  src={URL.createObjectURL(selectedMemorialFile)}
                                  alt="preview"
                                  className="w-12 h-12 object-cover rounded-lg border border-amber-400/40 shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="text-[10px] text-amber-400 font-bold">নির্ধারিত ছবি</p>
                                  <p className="text-[9px] text-gray-400 truncate">{selectedMemorialFile.name}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedMemorialFile(null)}
                                  className="ml-auto p-1 rounded-full hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          <button
                            type="submit"
                            disabled={isMemorialUploading}
                            className={`w-full py-3 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                              isMemorialUploading
                                ? 'bg-amber-500/50 text-slate-950/60 cursor-not-allowed'
                                : 'bg-amber-500 hover:bg-amber-600 text-slate-950 active:scale-95'
                            }`}
                          >
                            {isMemorialUploading ? (
                              <><Loader2 className="h-4 w-4 animate-spin" /><span>📖 অপেক্ষার প্রতিদান উত্তম,একটু ধৈর্য ধরুন।</span></>
                            ) : (
                              <><Plus className="h-4 w-4" /><span>স্মরণীয় ব্যক্তিত্ব যুক্ত করুন</span></>
                            )}
                          </button>

                          {/* Islamic Prayer Banner - Inline under submit button */}
                          <div className="bg-gradient-to-br from-[#022e1b] via-[#032d1a] to-[#043d25] border border-amber-400/25 rounded-2xl p-4 text-center relative overflow-hidden mt-4">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
                            <div className="absolute inset-1 border border-amber-400/10 rounded-xl pointer-events-none" />
                            <div className="relative z-10 space-y-2.5">
                              <div className="text-3xl leading-none">🕌</div>
                              <div className="text-xl text-amber-400/70 font-serif leading-none">﷽</div>
                              <h4 className="text-xs font-black text-amber-300 tracking-wider uppercase border-b border-amber-400/20 pb-1.5">
                                স্মরণ ও শ্রদ্ধাঞ্জলি
                              </h4>
                              <p className="text-[10px] leading-relaxed font-semibold text-amber-100/80 text-justify">
                                যারা এই মাদ্রাসার প্রতিষ্ঠা, উন্নয়ন ও পরিচালনায় অসামান্য অবদান রেখে আজ আমাদের মাঝে নেই, আমরা তাঁদের গভীর শ্রদ্ধা ও কৃতজ্ঞতার সঙ্গে স্মরণ করছি।
                              </p>
                              <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-2.5">
                                <p className="text-[10px] text-amber-300 font-bold leading-relaxed">
                                  আল্লাহ তাআলা তাঁদের সকল ভুল-ত্রুটি ক্ষমা করে দিন, কবরকে নূরে পরিপূর্ণ করুন এবং তাঁদেরকে জান্নাতুল ফেরদাউসের সম্মানিত মেহমান হিসেবে কবুল করুন। <span className="text-emerald-300">আমীন।</span>
                                </p>
                              </div>
                            </div>
                          </div>

                        </form>
                      </div>
                    </div>
                  )}

                  {/* Popup Modal 3: Edit Achievement */}
                  {editingAchievement && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
                      <div className={`w-full max-w-lg rounded-3xl border-t-4 border-amber-500 p-6 md:p-8 shadow-2xl relative ${
                        isDarkMode ? 'bg-[#031a10] border-emerald-900/50 text-white' : 'bg-white border-gray-200 text-slate-900'
                      }`}>
                        <button 
                          onClick={() => setEditingAchievement(null)}
                          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <X className="h-5 w-5" />
                        </button>
                        <h3 className="text-lg font-black text-amber-400 mb-6 flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          <span>শিক্ষার্থীর সাফল্য সম্পাদন করুন</span>
                        </h3>
                        <form onSubmit={handleEditAchievementSubmit} className="space-y-4 text-left">
                          <div>
                            <label className="block text-xs font-bold text-emerald-450 mb-1">শিক্ষার্থীর নাম *</label>
                            <input 
                              type="text"
                              required
                              value={editingAchievement.student_name}
                              onChange={(e) => setEditingAchievement({...editingAchievement, student_name: e.target.value})}
                              placeholder="মোহাম্মদ তানভীর রহমান"
                              className={`w-full border rounded-xl py-2.5 px-3.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-300 text-slate-900'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-emerald-455 mb-1">শ্রেণী নির্বাচন করুন *</label>
                            <select 
                              value={editingAchievement.student_class}
                              onChange={(e) => setEditingAchievement({...editingAchievement, student_class: e.target.value})}
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
                            <label className="block text-xs font-bold text-emerald-455 mb-1">সাফল্য হেডলাইন *</label>
                            <input 
                              type="text"
                              required
                              value={editingAchievement.headline}
                              onChange={(e) => setEditingAchievement({...editingAchievement, headline: e.target.value})}
                              placeholder="সাফল্য হেডলাইন লিখুন"
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
                              value={editingAchievement.description}
                              onChange={(e) => setEditingAchievement({...editingAchievement, description: e.target.value})}
                              placeholder="সাফল্য বিবরণী লিখুন"
                              className={`w-full border rounded-xl py-2.5 px-3.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-300 text-slate-900'
                              }`}
                            ></textarea>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-emerald-450 mb-1">ছবির লিংক (Image URL)</label>
                            <input 
                              type="text"
                              value={editingAchievement.image_url || ''}
                              onChange={(e) => setEditingAchievement({...editingAchievement, image_url: e.target.value})}
                              placeholder="https://example.com/photo.jpg"
                              className={`w-full border rounded-xl py-2.5 px-3.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-300 text-slate-900'
                              }`}
                            />
                          </div>
                          <div className="flex gap-4 mt-6">
                            <button 
                              type="button"
                              onClick={() => setEditingAchievement(null)}
                              className="flex-1 py-3 border border-emerald-800/60 hover:bg-emerald-950/20 text-emerald-300 font-black text-xs sm:text-sm rounded-xl active:scale-95 transition-all cursor-pointer"
                            >
                              বাতিল
                            </button>
                            <button 
                              type="submit"
                              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl active:scale-95 transition-all shadow-md cursor-pointer"
                            >
                              সংরক্ষণ করুন
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Popup Modal 4: Edit Memorial Figure — Single-Column Inline Layout */}
                  {editingMemorial && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 pb-4 px-3 sm:px-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
                      <div className={`w-full max-w-xl rounded-3xl border-t-4 border-emerald-500 shadow-2xl relative my-4 p-5 md:p-6 ${
                        isDarkMode ? 'bg-[#031a10] text-white' : 'bg-white text-slate-900'
                      }`}>

                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-emerald-900/30 mb-4">
                          <h3 className="text-base font-black text-emerald-400 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 shrink-0" />
                            <span>স্মরণীয় ব্যক্তিত্ব সম্পাদন করুন</span>
                          </h3>
                          <button
                            onClick={() => setEditingMemorial(null)}
                            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleEditMemorialSubmit} className="space-y-3.5 text-left">
                          <div>
                            <label className="block text-xs font-bold text-emerald-400 mb-1">স্মরণীয় ব্যক্তির নাম *</label>
                            <input
                              type="text"
                              required
                              value={editingMemorial.member_name}
                              onChange={(e) => setEditingMemorial({...editingMemorial, member_name: e.target.value})}
                              placeholder="মরহুম আলহাজ্ব নূর উদ্দিন আহমেদ"
                              className={`w-full border rounded-xl py-2.5 px-3.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors ${
                                isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-300 text-slate-900'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-emerald-400 mb-1">জন্ম-মৃত্যু সাল (জীবনকাল) *</label>
                            <input
                              type="text"
                              required
                              value={editingMemorial.lifespan}
                              onChange={(e) => setEditingMemorial({...editingMemorial, lifespan: e.target.value})}
                              placeholder="উদা: ১৯৩০ - ২০০৮"
                              className={`w-full border rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors ${
                                isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-300 text-slate-900'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-emerald-400 mb-1">অবদান হেডলাইন * <span className="text-gray-500 font-normal">(সর্বোচ্চ ২৫ অক্ষর)</span></label>
                            <input
                              type="text"
                              required
                              maxLength={25}
                              value={editingMemorial.contribution_headline}
                              onChange={(e) => setEditingMemorial({...editingMemorial, contribution_headline: e.target.value})}
                              placeholder="অবদান হেডলাইন লিখুন"
                              className={`w-full border rounded-xl py-2.5 px-3.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors ${
                                isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-300 text-slate-900'
                              }`}
                            />
                            <div className="flex justify-end mt-0.5 pr-1">
                              <span className={`text-[10px] font-bold ${
                                editingMemorial.contribution_headline.length >= 25 ? 'text-rose-500' : 'text-emerald-400'
                              }`}>
                                {editingMemorial.contribution_headline.length}/25
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-emerald-400 mb-1">অবদান বিস্তারিত *</label>
                            <textarea
                              required
                              rows="3"
                              value={editingMemorial.contribution_details}
                              onChange={(e) => setEditingMemorial({...editingMemorial, contribution_details: e.target.value})}
                              placeholder="অবদান বিস্তারিত লিখুন"
                              className={`w-full border rounded-xl py-2.5 px-3.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors ${
                                isDarkMode ? 'bg-[#02100a] border-emerald-800/60 text-white focus:border-amber-400' : 'bg-slate-50 border-gray-300 text-slate-900'
                              }`}
                            ></textarea>
                          </div>

                          {/* Optional Image Upload & Current Image Preview */}
                          <div>
                            <label className="block text-xs font-bold text-emerald-400 mb-1">
                              নতুন ছবি আপলোড করুন <span className="text-gray-500 font-normal">(ঐচ্ছিক)</span>
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) setSelectedEditMemorialFile(f);
                              }}
                              className={`w-full border rounded-xl py-2 px-3 text-xs focus:outline-none ${
                                isDarkMode
                                  ? 'bg-[#02100a] border-emerald-800/60 text-gray-300 file:bg-emerald-900/70 file:text-emerald-300 file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-2 file:cursor-pointer file:text-xs'
                                  : 'bg-slate-50 border-gray-300 text-slate-700'
                              }`}
                            />
                            
                            {selectedEditMemorialFile ? (
                              <div className="mt-2 flex items-center gap-2.5 bg-emerald-900/20 rounded-xl p-2 border border-emerald-800/30">
                                <img
                                  src={URL.createObjectURL(selectedEditMemorialFile)}
                                  alt="new preview"
                                  className="w-12 h-12 object-cover rounded-lg border border-amber-400/40 shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="text-[10px] text-amber-400 font-bold">নতুন ছবি (আপলোড হবে)</p>
                                  <p className="text-[9px] text-gray-400 truncate">{selectedEditMemorialFile.name}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedEditMemorialFile(null)}
                                  className="ml-auto p-1 rounded-full hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : editingMemorial.image_url ? (
                              <div className="mt-2 flex items-center gap-2.5 bg-emerald-900/20 rounded-xl p-2 border border-emerald-800/30">
                                <img
                                  src={editingMemorial.image_url}
                                  alt="current preview"
                                  className="w-12 h-12 object-cover rounded-lg border border-amber-400/40 shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="text-[10px] text-emerald-400 font-bold">বিদ্যমান ছবি</p>
                                  <p className="text-[9px] text-gray-400 truncate">ডাটাবেসে সংরক্ষিত</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setEditingMemorial({ ...editingMemorial, image_url: '' })}
                                  className="ml-auto p-1 rounded-full hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                                  title="ছবি মুছে ফেলুন"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : null}
                          </div>

                          <div className="flex gap-4 mt-6">
                            <button
                              type="button"
                              onClick={() => setEditingMemorial(null)}
                              className={`flex-1 py-3 border font-black text-xs sm:text-sm rounded-xl transition-all cursor-pointer ${
                                isDarkMode
                                  ? 'border-emerald-800/60 hover:bg-emerald-950/20 text-emerald-300'
                                  : 'border-gray-300 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              বাতিল
                            </button>
                            <button
                              type="submit"
                              disabled={isMemorialUploading}
                              className={`flex-2 py-3 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                                isMemorialUploading
                                  ? 'bg-amber-500/50 text-slate-950/60 cursor-not-allowed'
                                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950 active:scale-95'
                              }`}
                            >
                              {isMemorialUploading ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /><span>📖 অপেক্ষার প্রতিদান উত্তম,একটু ধৈর্য ধরুন।</span></>
                              ) : (
                                <span>পরিবর্তন সংরক্ষণ করুন</span>
                              )}
                            </button>
                          </div>

                          {/* Islamic Prayer Banner - Inline under actions */}
                          <div className="bg-gradient-to-br from-[#022e1b] via-[#032d1a] to-[#043d25] border border-amber-400/25 rounded-2xl p-4 text-center relative overflow-hidden mt-4">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
                            <div className="absolute inset-1 border border-amber-400/10 rounded-xl pointer-events-none" />
                            <div className="relative z-10 space-y-2.5">
                              <div className="text-3xl leading-none">🕌</div>
                              <div className="text-2xl text-amber-400/70 font-serif leading-none">﷽</div>
                              <h4 className="text-xs font-black text-amber-300 tracking-wider uppercase border-b border-amber-400/20 pb-1.5">
                                স্মরণ ও শ্রদ্ধাঞ্জলি
                              </h4>
                              <p className="text-[11px] leading-[1.9] font-semibold text-amber-100/85 text-justify">
                                যারা এই মাদ্রাসার প্রতিষ্ঠা, উন্নয়ন ও পরিচালনায় অসামান্য অবদান রেখে আজ আমাদের মাঝে নেই, আমরা তাঁদের গভীর শ্রদ্ধা ও কৃতজ্ঞতার সঙ্গে স্মরণ করছি।
                              </p>
                              <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-2.5">
                                <p className="text-[10px] text-amber-300 font-bold leading-relaxed">
                                  আল্লাহ তাআলা তাঁদের সকল ভুল-ত্রুটি ক্ষমা করে দিন, কবরকে নূরে পরিপূর্ণ করুন এবং তাঁদেরকে জান্নাতুল ফেরদাউসের সম্মানিত মেহমান হিসেবে কবুল করুন। <span className="text-emerald-300">আমীন।</span>
                                </p>
                              </div>
                            </div>
                          </div>

                        </form>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {activeTab === 'online_admissions' && (
                <div className="space-y-8 animate-fade-in">
                  <OnlineAdmissionsTab 
                    isDarkMode={isDarkMode} 
                    triggerToast={triggerToast} 
                  />
                </div>
              )}

            </div>
          )}
        </div>

      </main>

    </div>
  );
}

// ==========================================================
// Tab Component: Online Admissions Management
// ==========================================================
function OnlineAdmissionsTab({ isDarkMode, triggerToast }) {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals States
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAcceptForm, setShowAcceptForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Form Inputs
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, "admissions"),
      where("status", "==", "pending")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => {
        const t1 = a.applied_at?.toDate()?.getTime() || 0;
        const t2 = b.applied_at?.toDate()?.getTime() || 0;
        return t2 - t1;
      });
      setAdmissions(list);
      setLoading(false);
    }, (err) => {
      console.error("Fetch pending admissions error:", err);
      triggerToast("আবেদন তালিকা লোড করতে সমস্যা হয়েছে।", "error");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const checkRollDuplicate = async (cls, rollVal) => {
    const q1 = query(
      collection(db, "admissions"),
      where("class", "==", cls),
      where("status", "==", "accepted"),
      where("roll_no", "==", parseInt(rollVal, 10))
    );
    const q2 = query(
      collection(db, "admissions"),
      where("class", "==", cls),
      where("status", "==", "accepted"),
      where("roll_no", "==", rollVal.trim())
    );
    const q3 = query(
      collection(db, "admissions"),
      where("class", "==", cls),
      where("status", "==", "accepted"),
      where("roll", "==", rollVal.trim())
    );
    const q4 = query(
      collection(db, "admissions"),
      where("class", "==", cls),
      where("status", "==", "accepted"),
      where("roll", "==", parseInt(rollVal, 10))
    );

    const [s1, s2, s3, s4] = await Promise.all([
      getDocs(q1), getDocs(q2), getDocs(q3), getDocs(q4)
    ]);
    return !s1.empty || !s2.empty || !s3.empty || !s4.empty;
  };

  const handleAcceptSubmit = async (e) => {
    e.preventDefault();
    if (!studentId.trim() || !password.trim() || !rollNo.trim()) {
      alert("সকল ক্ষেত্র পূরণ করুন।");
      return;
    }

    setActionLoading(true);
    try {
      const isDuplicate = await checkRollDuplicate(selectedAdmission.class, rollNo);
      if (isDuplicate) {
        alert("এই ক্লাসে এই রোলটি ইতিমধ্যে ব্যবহার করা হয়েছে, অন্য রোল দিন");
        setActionLoading(false);
        return;
      }

      const docRef = doc(db, "admissions", selectedAdmission.id);
      await updateDoc(docRef, {
        status: "accepted",
        student_id: String(studentId).trim(),
        password: String(password).trim(),
        roll: String(rollNo).trim(),
        roll_no: String(rollNo).trim()
      });

      triggerToast("ভর্তি আবেদন সফলভাবে অনুমোদিত হয়েছে!", "success");
      
      // Reset & Close
      setShowAcceptForm(false);
      setShowDetailsModal(false);
      setSelectedAdmission(null);
      setStudentId('');
      setPassword('');
      setRollNo('');
      // Real-time listener handles state updates automatically
    } catch (err) {
      console.error("Accept error:", err);
      alert("আবেদন অনুমোদন করতে সমস্যা হয়েছে। কারণ: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert("বাতিল করার কারণ লিখুন।");
      return;
    }
    if (rejectionReason.length > 50) {
      alert("বাতিলের কারণ সর্বোচ্চ ৫০ অক্ষরের হতে হবে।");
      return;
    }

    setActionLoading(true);
    try {
      const docRef = doc(db, "admissions", selectedAdmission.id);
      await updateDoc(docRef, {
        status: "rejected",
        rejection_reason: rejectionReason.trim()
      });

      triggerToast("আবেদন বাতিল করা হয়েছে।", "success");
      
      // Reset & Close
      setShowRejectForm(false);
      setShowDetailsModal(false);
      setSelectedAdmission(null);
      setRejectionReason('');
      // Real-time listener handles state updates automatically
    } catch (err) {
      console.error("Reject error:", err);
      alert("আবেদন বাতিল করতে সমস্যা হয়েছে। কারণ: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDetails = (admission) => {
    setSelectedAdmission(admission);
    setShowDetailsModal(true);
    setShowAcceptForm(false);
    setShowRejectForm(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Main List Box */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-emerald-900/10 rounded-3xl">
          <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
          <p className="text-xs text-amber-400 mt-3 font-semibold font-serif tracking-wide">
            📖 অপেক্ষার প্রতিদান উত্তম,একটু ধৈর্য ধরুন।
          </p>
        </div>
      ) : admissions.length === 0 ? (
        <div className={`border rounded-3xl p-12 text-center space-y-3 shadow-md ${
          isDarkMode ? 'bg-[#031a10] border-emerald-950/40 text-emerald-300' : 'bg-white border-gray-200 text-slate-500'
        }`}>
          <FileText className="h-12 w-12 mx-auto text-amber-500/60" />
          <h4 className="text-sm sm:text-base font-black">কোনো পেন্ডিং আবেদন পাওয়া যায়নি</h4>
          <p className="text-[10px] sm:text-xs">ভর্তি আবেদনকারী শিক্ষার্থী সফলভাবে ফর্ম সাবমিট করলে এখানে তালিকা দেখতে পাবেন।</p>
        </div>
      ) : (
        <div className={`border rounded-3xl overflow-hidden shadow-xl ${
          isDarkMode ? 'bg-[#031a10] border-emerald-950/40' : 'bg-white border-gray-200'
        }`}>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-xs uppercase tracking-wider font-bold ${
                  isDarkMode ? 'bg-emerald-950/40 border-emerald-900/35 text-emerald-450' : 'bg-slate-50 border-gray-150 text-slate-655'
                }`}>
                  <th className="py-4 px-5">শিক্ষার্থীর নাম (বাংলা)</th>
                  <th className="py-4 px-5">শ্রেণী</th>
                  <th className="py-4 px-5">ফোন নাম্বার</th>
                  <th className="py-4 px-5">আবেদনের তারিখ</th>
                  <th className="py-4 px-5 text-center">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody className={`text-xs sm:text-sm font-semibold divide-y ${
                isDarkMode ? 'divide-emerald-950/30' : 'divide-gray-100'
              }`}>
                {admissions.map((item) => (
                  <tr key={item.id} className={`transition-colors hover:bg-white/5`}>
                    <td className="py-3.5 px-5 font-bold text-amber-400/90">{item.student_name_bn}</td>
                    <td className="py-3.5 px-5">
                      <span className="bg-emerald-150/15 border border-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                        {item.class}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-sans">{item.applicant_phone}</td>
                    <td className="py-3.5 px-5 font-sans">
                      {item.applied_at?.toDate()?.toLocaleDateString('bn-BD', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) || '---'}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <button
                        onClick={() => handleOpenDetails(item)}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1 mx-auto"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>বিস্তারিত</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Admission Details View (Read-Only) */}
      {showDetailsModal && selectedAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
          
          {/* Action Loading overlay */}
          {actionLoading && (
            <div className="absolute inset-0 bg-[#020e09]/90 z-[70] flex flex-col items-center justify-center space-y-4 rounded-3xl">
              <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
              <p className="text-xs text-amber-400 mt-3 font-semibold font-serif tracking-wide">
                📖 অপেক্ষার প্রতিদান উত্তম,একটু ধৈর্য ধরুন।
              </p>
            </div>
          )}

          <div className={`w-full max-w-3xl rounded-3xl border-t-4 border-amber-500 shadow-2xl relative my-4 p-5 md:p-6 max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-[#031a10] border-emerald-950 text-white' : 'bg-white text-slate-800'
          }`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-emerald-900/20 mb-5">
              <div className="min-w-0">
                <p className="text-[10px] text-emerald-400 font-bold uppercase">ভর্তি আবেদনকারী প্রোফাইল</p>
                <h3 className="text-base sm:text-lg font-black text-white truncate">{selectedAdmission.student_name_bn}</h3>
              </div>
              <button
                onClick={() => {
                  if (!actionLoading) {
                    setShowDetailsModal(false);
                    setSelectedAdmission(null);
                  }
                }}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Read-Only Form Details */}
            <div className="space-y-6 text-left">
              
              {/* SECTION 1: Student Details */}
              <div className={`p-4 rounded-2xl border ${
                isDarkMode ? 'bg-[#02100a] border-emerald-950/60' : 'bg-slate-50 border-gray-200'
              }`}>
                <h4 className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5 border-b border-emerald-900/10 pb-2 mb-3">
                  <User className="h-4 w-4" />
                  <span>শিক্ষার্থীর তথ্য</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <span className="text-gray-450 block text-[10px] font-bold">পূর্ণ নাম (বাংলা):</span>
                    <span className="font-semibold text-white">{selectedAdmission.student_name_bn}</span>
                  </div>
                  <div>
                    <span className="text-gray-450 block text-[10px] font-bold">পূর্ণ নাম (ইংরেজি):</span>
                    <span className="font-semibold text-white uppercase">{selectedAdmission.student_name_en}</span>
                  </div>
                  <div>
                    <span className="text-gray-450 block text-[10px] font-bold">লিঙ্গ:</span>
                    <span className="font-semibold text-white">{selectedAdmission.gender === 'Male' ? 'পুরুষ' : selectedAdmission.gender === 'Female' ? 'মহিলা' : 'অন্যান্য'}</span>
                  </div>
                  <div>
                    <span className="text-gray-450 block text-[10px] font-bold">আবেদনকারীর ফোন:</span>
                    <span className="font-semibold text-white font-sans">{selectedAdmission.applicant_phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-450 block text-[10px] font-bold">ইমেইল:</span>
                    <span className="font-semibold text-white font-sans">{selectedAdmission.email || 'নেই'}</span>
                  </div>
                  <div>
                    <span className="text-gray-450 block text-[10px] font-bold">জন্ম নিবন্ধন / এনআইডি নম্বর:</span>
                    <span className="font-semibold text-white font-sans">{selectedAdmission.birth_nid_no}</span>
                  </div>
                  <div>
                    <span className="text-gray-450 block text-[10px] font-bold">জন্মসাল:</span>
                    <span className="font-semibold text-white font-sans">{selectedAdmission.birth_year}</span>
                  </div>
                  <div>
                    <span className="text-gray-450 block text-[10px] font-bold">রক্তের গ্রুপ:</span>
                    <span className="font-semibold text-rose-400 font-sans">{selectedAdmission.blood_group || 'নেই'}</span>
                  </div>
                  <div>
                    <span className="text-gray-450 block text-[10px] font-bold">আবেদনকৃত শ্রেণী:</span>
                    <span className="inline-block bg-emerald-950 border border-emerald-700/30 text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px] mt-0.5">
                      {selectedAdmission.class}
                    </span>
                  </div>
                  <div className="hidden sm:block"></div>
                  
                  <div className="sm:col-span-2">
                    <span className="text-gray-450 block text-[10px] font-bold">বর্তমান ঠিকানা:</span>
                    <span className="font-semibold text-white">{selectedAdmission.present_address}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-450 block text-[10px] font-bold">স্থায়ী ঠিকানা:</span>
                    <span className="font-semibold text-white">{selectedAdmission.permanent_address}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Guardian Details */}
              <div className={`p-4 rounded-2xl border ${
                isDarkMode ? 'bg-[#02100a] border-emerald-950/60' : 'bg-slate-50 border-gray-200'
              }`}>
                <h4 className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5 border-b border-emerald-900/10 pb-2 mb-3">
                  <ShieldCheck className="h-4 w-4" />
                  <span>অভিভাবকের তথ্য</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <span className="text-gray-450 block text-[10px] font-bold">পিতার নাম:</span>
                    <span className="font-semibold text-white">{selectedAdmission.father_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-450 block text-[10px] font-bold">মাতার নাম:</span>
                    <span className="font-semibold text-white">{selectedAdmission.mother_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-450 block text-[10px] font-bold">পিতার ফোন নম্বর:</span>
                    <span className="font-semibold text-white font-sans">{selectedAdmission.father_phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-450 block text-[10px] font-bold">অভিভাবকের ইমেইল:</span>
                    <span className="font-semibold text-white font-sans">{selectedAdmission.parent_email || 'নেই'}</span>
                  </div>
                  <div>
                    <span className="text-gray-450 block text-[10px] font-bold">পিতার এনআইডি:</span>
                    <span className="font-semibold text-white font-sans">{selectedAdmission.father_nid}</span>
                  </div>
                  <div>
                    <span className="text-gray-450 block text-[10px] font-bold">মাতার এনআইডি:</span>
                    <span className="font-semibold text-white font-sans">{selectedAdmission.mother_nid}</span>
                  </div>
                  <div>
                    <span className="text-gray-450 block text-[10px] font-bold">পিতার পেশা:</span>
                    <span className="font-semibold text-white">{selectedAdmission.father_occupation}</span>
                  </div>
                  <div>
                    <span className="text-gray-450 block text-[10px] font-bold">মাতার পেশা:</span>
                    <span className="font-semibold text-white">{selectedAdmission.mother_occupation}</span>
                  </div>
                  <div>
                    <span className="text-gray-450 block text-[10px] font-bold">থানা:</span>
                    <span className="font-semibold text-white">{selectedAdmission.upazila_thana}</span>
                  </div>
                  <div>
                    <span className="text-gray-450 block text-[10px] font-bold">জেলা:</span>
                    <span className="font-semibold text-white">{selectedAdmission.district}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Conditional Academic details (Grades 6-9) */}
              {selectedAdmission.prev_school_name && (
                <div className={`p-4 rounded-2xl border ${
                  isDarkMode ? 'bg-[#02100a] border-emerald-950/60' : 'bg-slate-50 border-gray-200'
                }`}>
                  <h4 className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5 border-b border-emerald-900/10 pb-2 mb-3">
                    <Award className="h-4 w-4" />
                    <span>পূর্ববর্তী শিক্ষাগত বিবরণী</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <span className="text-gray-450 block text-[10px] font-bold">পূর্ববর্তী শিক্ষা প্রতিষ্ঠান:</span>
                      <span className="font-semibold text-white">{selectedAdmission.prev_school_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-450 block text-[10px] font-bold">সর্বশেষ পাসকৃত শ্রেণি:</span>
                      <span className="font-semibold text-white">{selectedAdmission.prev_class}</span>
                    </div>
                    <div>
                      <span className="text-gray-450 block text-[10px] font-bold">রোল নম্বর:</span>
                      <span className="font-semibold text-white font-sans">{selectedAdmission.prev_roll || 'নেই'}</span>
                    </div>
                    <div>
                      <span className="text-gray-450 block text-[10px] font-bold">ফলাফল / GPA:</span>
                      <span className="font-semibold text-white font-sans">{selectedAdmission.prev_gpa}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-gray-450 block text-[10px] font-bold">প্রতিষ্ঠান ত্যাগ করার কারণ:</span>
                      <span className="font-semibold text-white">{selectedAdmission.exit_reason}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Accept & Reject Action Forms Inline Container */}
            <div className="mt-6 space-y-4 pt-4 border-t border-emerald-900/20">
              
              {/* ACCEPT FORM SUB-PANEL */}
              {showAcceptForm ? (
                <form onSubmit={handleAcceptSubmit} className="bg-emerald-950/40 border border-emerald-500/25 rounded-2xl p-4 space-y-4 animate-fade-in text-left">
                  <h4 className="text-xs sm:text-sm font-black text-emerald-400">ভর্তি আবেদন অনুমোদন ফর্ম</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">আইডি নম্বর *</label>
                      <input 
                        type="text" 
                        required
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="উদা: 1003"
                        className="w-full bg-[#02100a] border border-emerald-800/60 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">পাসওয়ার্ড *</label>
                      <input 
                        type="text" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="পাসওয়ার্ড লিখুন"
                        className="w-full bg-[#02100a] border border-emerald-800/60 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">রোল নম্বর *</label>
                      <input 
                        type="text" 
                        required
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        placeholder="উদা: ১"
                        className="w-full bg-[#02100a] border border-emerald-800/60 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 text-white font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAcceptForm(false)}
                      className="px-4 py-2 border border-emerald-800/40 hover:bg-emerald-950/20 text-emerald-300 font-bold text-xs rounded-xl active:scale-95 transition-all cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      <span>অনুমোদন সম্পন্ন করুন</span>
                    </button>
                  </div>
                </form>
              ) : null}

              {/* REJECT FORM SUB-PANEL */}
              {showRejectForm ? (
                <form onSubmit={handleRejectSubmit} className="bg-rose-950/30 border border-rose-500/25 rounded-2xl p-4 space-y-4 animate-fade-in text-left">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs sm:text-sm font-black text-rose-455">ভর্তি আবেদন বাতিল ফর্ম</h4>
                    <span className="text-[10px] text-gray-400 font-sans">{rejectionReason.length}/50</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">আবেদন বাতিল করার কারণ *</label>
                    <input 
                      type="text" 
                      required
                      maxLength={50}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="উদা: ভুল মোবাইল নাম্বার বা ত্রুটিপূর্ণ কাগজপত্র।"
                      className="w-full bg-[#02100a] border border-emerald-800/60 rounded-xl py-2 px-3.5 text-xs focus:outline-none focus:ring-1 focus:ring-rose-400 text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(false)}
                      className="px-4 py-2 border border-emerald-800/40 hover:bg-emerald-950/20 text-emerald-300 font-bold text-xs rounded-xl active:scale-95 transition-all cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      <span>বাতিল সম্পন্ন করুন</span>
                    </button>
                  </div>
                </form>
              ) : null}

              {/* PRIMARY DECISION ACTIONS */}
              {!showAcceptForm && !showRejectForm && (
                <div className="flex flex-col sm:flex-row justify-end items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectionReason('');
                      setShowRejectForm(true);
                      setShowAcceptForm(false);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    আবেদন বাতিল করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStudentId('');
                      setPassword('');
                      setRollNo('');
                      setShowAcceptForm(true);
                      setShowRejectForm(false);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    আবেদন গ্রহণ করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedAdmission(null);
                    }}
                    className={`w-full sm:w-auto px-5 py-2.5 border font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer ${
                      isDarkMode 
                        ? 'border-emerald-800/60 hover:bg-emerald-950/20 text-emerald-300' 
                        : 'border-gray-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    বন্ধ করুন
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
