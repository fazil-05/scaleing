// src/components/layout/GlobalSearch.tsx
// Command Palette modal (Ctrl+K) — Clean Light Theme

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, CheckSquare, BookOpen, FileText, Building2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'employee' | 'task' | 'sop' | 'branch' | 'report';
  url: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim() || !user?.company_id) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const searchResults: SearchResult[] = [];

      try {
        const { data: employees } = await supabase
          .from('employees')
          .select('id, name, email, employee_code, role')
          .eq('company_id', user.company_id)
          .ilike('name', `%${query}%`)
          .limit(5);

        if (employees) {
          employees.forEach(e => searchResults.push({
            id: e.id,
            title: e.name,
            subtitle: `${e.employee_code} • ${e.role.replace(/_/g, ' ')}`,
            type: 'employee',
            url: `/employees/${e.id}`,
          }));
        }

        const { data: tasks } = await supabase
          .from('tasks')
          .select('id, title, priority, status')
          .eq('company_id', user.company_id)
          .ilike('title', `%${query}%`)
          .limit(5);

        if (tasks) {
          tasks.forEach(t => searchResults.push({
            id: t.id,
            title: t.title,
            subtitle: `Task • ${t.status} • Priority: ${t.priority}`,
            type: 'task',
            url: `/tasks`,
          }));
        }

        setResults(searchResults);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, user?.company_id]);

  const handleSelect = (url: string) => {
    navigate(url);
    onClose();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'employee': return <Users size={16} className="text-blue-600" />;
      case 'task': return <CheckSquare size={16} className="text-indigo-600" />;
      case 'sop': return <BookOpen size={16} className="text-emerald-600" />;
      case 'branch': return <Building2 size={16} className="text-amber-600" />;
      default: return <FileText size={16} className="text-slate-600" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl z-10"
          >
            <div className="flex items-center px-4 border-b border-slate-100">
              <Search size={18} className="text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search employees, tasks, SOPs, branches..."
                className="w-full py-4 px-3 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
                autoFocus
              />
              {query && (
                <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {loading ? (
                <p className="p-4 text-xs text-center text-slate-500">Searching...</p>
              ) : query && results.length === 0 ? (
                <p className="p-4 text-xs text-center text-slate-500">No results found for "{query}"</p>
              ) : !query ? (
                <div className="p-4 text-xs text-slate-500 space-y-2">
                  <p className="font-bold text-slate-700">Quick Navigation</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleSelect('/employees')} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-left text-slate-700 font-semibold hover:bg-blue-50 hover:text-blue-700">Employees List</button>
                    <button onClick={() => handleSelect('/tasks')} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-left text-slate-700 font-semibold hover:bg-blue-50 hover:text-blue-700">Task Board</button>
                    <button onClick={() => handleSelect('/attendance/mark')} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-left text-slate-700 font-semibold hover:bg-blue-50 hover:text-blue-700">Mark Attendance</button>
                    <button onClick={() => handleSelect('/sops')} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-left text-slate-700 font-semibold hover:bg-blue-50 hover:text-blue-700">SOP Library</button>
                  </div>
                </div>
              ) : (
                results.map(r => (
                  <div
                    key={`${r.type}-${r.id}`}
                    onClick={() => handleSelect(r.url)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-slate-100">{getIcon(r.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{r.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">{r.subtitle}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase font-mono px-2 py-0.5 rounded bg-slate-100">
                      {r.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
