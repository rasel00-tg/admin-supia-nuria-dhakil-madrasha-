import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://vkrfuywpumklbmzjagkp.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrcmZ1eXdwdW1rbGJtemphZ2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MzQ0NzIsImV4cCI6MjA5NzExMDQ3Mn0.9hGCgs2DCwoDSCuKRRx27M_PEbAAnuLsMELv69VgoJ0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 1. Students Operations
export const getStudents = async () => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('roll_no', { ascending: true });
  if (error) throw error;
  return data;
};

export const addStudent = async (student) => {
  const { data, error } = await supabase
    .from('students')
    .insert([
      {
        name: student.name,
        roll_no: parseInt(student.roll_no, 10),
        class: student.class,
        section_or_department: student.section_or_department,
        guardian_name: student.guardian_name,
        phone: student.phone,
        created_at: new Date().toISOString()
      }
    ])
    .select();
  if (error) throw error;
  return data;
};

// 2. Teachers Operations
export const getTeachers = async () => {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .order('id', { ascending: true });
  if (error) throw error;
  return data;
};

export const addTeacher = async (teacher) => {
  const { data, error } = await supabase
    .from('teachers')
    .insert([
      {
        name: teacher.name,
        designation: teacher.designation,
        department: teacher.department,
        phone: teacher.phone,
        email: teacher.email,
        joinDate: teacher.joinDate || new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
        avatarBg: teacher.avatarBg || 'bg-emerald-700',
        created_at: new Date().toISOString()
      }
    ])
    .select();
  if (error) throw error;
  return data;
};

// 3. Contact Messages Operations
export const getContactMessages = async () => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// 4. Users Operations
export const createNewUser = async (user) => {
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        username_or_email: user.username_or_email,
        password: user.password,
        role: user.role,
        name: user.name,
        phone: user.phone,
        email: user.email,
        designation: user.designation,
        department: user.department,
        joinDate: user.joinDate || new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
        avatarBg: user.avatarBg || 'bg-emerald-700',
        created_at: new Date().toISOString()
      }
    ])
    .select();
  if (error) throw error;
  return data;
};
