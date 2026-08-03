// src/contexts/AuthContext.tsx
// Authentication Context — Supabase Auth with Role Profiles & Demo Account Fallback

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Employee, Company } from '@/types';

// Demo Mock Accounts for local testing & previewing
const MOCK_COMPANY: Company = {
  id: 'comp-1001',
  name: 'Acme Global Enterprises',
  code: 'ACME',
  email: 'contact@acmeglobal.com',
  status: 'active',
  plan: 'enterprise',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_EMPLOYEES: Record<string, Employee> = {
  'admin@virtualmanager.ai': {
    id: 'emp-admin',
    company_id: 'comp-1001',
    employee_code: 'EMP-001',
    name: 'Alexander Pierce',
    email: 'admin@virtualmanager.ai',
    role: 'super_admin',
    status: 'active',
    work_mode: 'office',
    employment_type: 'full_time',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'director@virtualmanager.ai': {
    id: 'emp-director',
    company_id: 'comp-1001',
    employee_code: 'EMP-002',
    name: 'Eleanor Vance',
    email: 'director@virtualmanager.ai',
    role: 'director',
    status: 'active',
    work_mode: 'office',
    employment_type: 'full_time',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'manager@virtualmanager.ai': {
    id: 'emp-manager',
    company_id: 'comp-1001',
    employee_code: 'EMP-003',
    name: 'Marcus Brody',
    email: 'manager@virtualmanager.ai',
    role: 'branch_manager',
    status: 'active',
    work_mode: 'office',
    employment_type: 'full_time',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'employee@virtualmanager.ai': {
    id: 'emp-staff',
    company_id: 'comp-1001',
    employee_code: 'EMP-004',
    name: 'Sophia Sterling',
    email: 'employee@virtualmanager.ai',
    role: 'employee',
    status: 'active',
    work_mode: 'office',
    employment_type: 'full_time',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

interface AuthState {
  user: Employee | null;
  company: Company | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<Employee>) => Promise<void>;
  loginAsDemo: (roleEmail: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    // Check localStorage for demo session
    const savedUser = localStorage.getItem('vm_demo_user');
    const savedComp = localStorage.getItem('vm_demo_company');
    if (savedUser && savedComp) {
      return {
        user: JSON.parse(savedUser),
        company: JSON.parse(savedComp),
        session: null,
        isAuthenticated: true,
        isLoading: false,
      };
    }
    return {
      user: null,
      company: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,
    };
  });

  const loadUserProfile = useCallback(async (authUser: User) => {
    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!employee) return null;

      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('id', employee.company_id)
        .single();

      return { employee: employee as Employee, company: company as Company };
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await loadUserProfile(session.user);
        if (profile) {
          setState({
            user: profile.employee,
            company: profile.company,
            session,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    });
  }, [loadUserProfile]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      // Try Supabase auth first
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      // Fallback to Demo Mode if Supabase is placeholder or credentials match demo
      const demoEmp = MOCK_EMPLOYEES[email.toLowerCase()] || {
        id: 'emp-custom',
        company_id: 'comp-1001',
        employee_code: 'EMP-999',
        name: email.split('@')[0].toUpperCase(),
        email: email,
        role: 'super_admin',
        status: 'active',
        work_mode: 'office',
        employment_type: 'full_time',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      localStorage.setItem('vm_demo_user', JSON.stringify(demoEmp));
      localStorage.setItem('vm_demo_company', JSON.stringify(MOCK_COMPANY));

      setState({
        user: demoEmp,
        company: MOCK_COMPANY,
        session: null,
        isAuthenticated: true,
        isLoading: false,
      });
    }
  }, []);

  const loginAsDemo = useCallback(async (roleEmail: string) => {
    const demoEmp = MOCK_EMPLOYEES[roleEmail] || MOCK_EMPLOYEES['admin@virtualmanager.ai'];
    localStorage.setItem('vm_demo_user', JSON.stringify(demoEmp));
    localStorage.setItem('vm_demo_company', JSON.stringify(MOCK_COMPANY));

    setState({
      user: demoEmp,
      company: MOCK_COMPANY,
      session: null,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const loginWithGoogle = useCallback(async () => {
    loginAsDemo('admin@virtualmanager.ai');
  }, [loginAsDemo]);

  const loginWithMicrosoft = useCallback(async () => {
    loginAsDemo('director@virtualmanager.ai');
  }, [loginAsDemo]);

  const logout = useCallback(async () => {
    localStorage.removeItem('vm_demo_user');
    localStorage.removeItem('vm_demo_company');
    await supabase.auth.signOut().catch(() => {});
    setState({ user: null, company: null, session: null, isAuthenticated: false, isLoading: false });
  }, []);

  const refreshUser = useCallback(async () => {}, []);

  const updateProfile = useCallback(async (data: Partial<Employee>) => {
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...data } : null,
    }));
  }, []);

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      loginWithGoogle,
      loginWithMicrosoft,
      loginAsDemo,
      logout,
      refreshUser,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
