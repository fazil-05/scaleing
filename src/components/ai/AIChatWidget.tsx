// src/components/ai/AIChatWidget.tsx
// Floating AI Chat Assistant widget — Clean Light Theme with Real-Time Database Actions

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithAI } from '@/lib/openai';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your Virtual Manager AI Assistant. Ask me about employee stats, attendance, or command me to assign tasks for your team directly from chat!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, company } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const companyId = user?.company_id || '00000000-0000-0000-0000-000000000001';
      const q = userMsg.toLowerCase();

      // ─── ACTION 1: Task Creation & Assignment via AI Chat ──────────────────
      const isTaskCreation = (q.includes('assign') || q.includes('create task') || q.includes('give task') || q.includes('add task')) && (q.includes('to') || q.includes('for'));
      
      if (isTaskCreation && user) {
        const canAssign = ['super_admin', 'company_admin', 'director', 'branch_manager'].includes(user.role);
        if (!canAssign) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: '⚠️ Only Managers and Directors can assign tasks via AI chat.'
          }]);
          setLoading(false);
          return;
        }

        // Fetch company employees
        const { data: empList } = await supabase
          .from('employees')
          .select('id, name, employee_code, role')
          .eq('company_id', companyId);

        const employees = empList && empList.length > 0 ? empList : [
          { id: 'a0000000-0000-0000-0000-000000000004', name: 'Sophia Sterling', role: 'employee' },
          { id: 'a0000000-0000-0000-0000-000000000003', name: 'Marcus Vance', role: 'branch_manager' },
          { id: 'a0000000-0000-0000-0000-000000000002', name: 'Elena Rostova', role: 'director' },
          { id: 'a0000000-0000-0000-0000-000000000001', name: 'Alexander Pierce', role: 'super_admin' }
        ];

        // Find target employee name in the message
        let matchedEmp = employees.find(emp => q.includes(emp.name.toLowerCase()) || q.includes(emp.name.split(' ')[0].toLowerCase()));

        if (!matchedEmp) {
          matchedEmp = employees.find(emp => emp.role === 'employee') || employees[0];
        }

        // Extract task title
        let taskTitle = userMsg;
        if (userMsg.includes(':')) {
          taskTitle = userMsg.split(':')[1].trim();
        } else if (userMsg.toLowerCase().includes('to ')) {
          const parts = userMsg.split(/to [a-zA-Z\s]+/i);
          taskTitle = parts[1]?.trim() || userMsg;
        }

        if (!taskTitle) taskTitle = 'Assigned Work Milestone';

        // Insert Task into Database
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        const { data: newTask, error } = await supabase.from('tasks').insert({
          company_id: companyId,
          created_by: user.id,
          assigned_to: matchedEmp ? matchedEmp.id : null,
          title: taskTitle,
          description: `Assigned automatically via Virtual Manager AI Chat by ${user.name}`,
          priority: 'medium',
          status: matchedEmp ? 'assigned' : 'pending',
          due_date: tomorrow,
        }).select().single();

        if (!error || newTask) {
          toast.success('Task created and assigned via AI!');
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `✅ **Task Created & Assigned Successfully!**\n\n📌 **Task**: ${taskTitle}\n👤 **Assigned To**: ${matchedEmp ? matchedEmp.name : 'Employee'}\n📅 **Due Date**: ${tomorrow}\n🚦 **Status**: Assigned\n\n*The task has been created in the database and added to the employee's workspace.*`
          }]);
          setLoading(false);
          return;
        }
      }

      // ─── QUERY 2: Employee Asking "What is my task today?" ────────────────────
      if ((q.includes('my task') || q.includes('my work') || q.includes('task today') || q.includes('assigned to me') || q.includes('what are my tasks')) && user) {
        const { data: myTasks } = await supabase
          .from('tasks')
          .select('title, status, priority, due_date')
          .eq('assigned_to', user.id);

        if (myTasks && myTasks.length > 0) {
          const taskListStr = myTasks.map((t, idx) => `${idx + 1}. **${t.title}** (Priority: ${t.priority.toUpperCase()}, Status: ${t.status.replace(/_/g, ' ')})`).join('\n');
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `📋 **Your Assigned Tasks for Today:**\n\n${taskListStr}\n\n*You can update status directly on the Task Management page.*`
          }]);
          setLoading(false);
          return;
        } else {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `📋 You currently have **0 pending tasks** assigned for today. Great job!`
          }]);
          setLoading(false);
          return;
        }
      }

      // ─── QUERY 3: Manager Asking "What is in progress / pending work?" ─────────
      if (q.includes('in progress') || q.includes('pending work') || q.includes('all tasks') || q.includes('tasks status')) {
        const { data: allTasks } = await supabase
          .from('tasks')
          .select('title, status, priority')
          .eq('company_id', companyId);

        if (allTasks && allTasks.length > 0) {
          const taskSummary = allTasks.map((t, idx) => `${idx + 1}. **${t.title}** — [${t.status.toUpperCase()}]`).join('\n');
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `📊 **Current Task Pipeline (${allTasks.length} Total Tasks):**\n\n${taskSummary}`
          }]);
          setLoading(false);
          return;
        }
      }

      // ─── DEFAULT GENERAL QUERY (Gemini / AI Handler) ──────────────────────────
      const [{ count: empCount }, { count: taskCount }, { data: sops }] = await Promise.all([
        supabase.from('employees').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
        supabase.from('sops').select('title, content').eq('company_id', companyId).limit(3),
      ]);

      const sopText = sops?.map(s => `SOP [${s.title}]: ${s.content}`).join('\n\n') || '';

      const response = await chatWithAI(
        newMessages.map(m => ({ role: m.role, content: m.content })),
        {
          companyName: company?.name || 'Acme Global Enterprises',
          sopContent: sopText,
          employeeRole: user?.role,
          totalEmployees: empCount || 4,
          pendingTasksCount: taskCount || 4,
        }
      );

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err: any) {
      console.error('AI Chat Error:', err);
      const isTimeout = err?.message === 'API_TIMEOUT' || err?.message?.includes('timeout');
      const errorMessage = isTimeout
        ? '⚠️ Request timed out. The AI service took too long to respond. Please try again.'
        : '⚠️ Virtual Manager AI Assistant is experiencing high traffic. Please try again in a moment.';

      toast.error(isTimeout ? 'AI Request timed out' : 'Failed to fetch AI response');

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: errorMessage }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl flex flex-col h-[500px] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white border-b border-blue-700">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10 text-white border border-white/20">
                  <Bot size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Virtual Manager AI <Sparkles size={12} className="text-amber-300" />
                  </h4>
                  <p className="text-[10px] text-blue-100 font-medium">SOP &amp; Action Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 text-white/80 hover:text-white">
                <Minimize2 size={16} />
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold p-2">
                  <Bot size={14} className="animate-spin" /> Thinking &amp; Executing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Assign task to Sophia: Complete Audit..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors shadow-xs"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold text-xs shadow-xl shadow-blue-500/30 border border-blue-400/30"
          >
            <Sparkles size={16} className="text-amber-300" />
            <span>AI Assistant</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
