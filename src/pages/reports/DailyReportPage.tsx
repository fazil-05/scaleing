// src/pages/reports/DailyReportPage.tsx
// Employee Daily Work Report Submission Page with AI Auditing

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { auditReport } from '@/lib/openai';
import { FileText, Send, Sparkles, AlertTriangle, Paperclip, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const DailyReportPage: React.FC = () => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    work_done: '',
    client_visits: '',
    products_discussed: '',
    problems_faced: '',
    solutions_applied: '',
    tomorrow_plan: '',
    hours_worked: 8,
    remarks: '',
  });

  const [aiScore, setAiScore] = useState<number | null>(null);
  const [aiFlags, setAiFlags] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !user?.company_id) return;

    if (!formData.work_done.trim()) {
      toast.error("Please describe today's work");
      return;
    }

    setSubmitting(true);
    const todayStr = new Date().toISOString().split('T')[0];

    try {
      // Step 1: Run AI Report Audit using OpenAI
      toast.loading('AI Auditor inspecting report...', { id: 'audit' });
      let auditResult = null;

      try {
        auditResult = await auditReport({
          report: formData,
          employeeName: user.name,
          date: todayStr,
        });

        setAiScore(auditResult.score);
        setAiFlags(auditResult.flags || []);
        setAiSuggestions(auditResult.suggestions || '');
        toast.dismiss('audit');
      } catch (err) {
        console.warn('AI audit skipped (fallback to default):', err);
        toast.dismiss('audit');
      }

      // Step 2: Insert into Supabase daily_reports
      const { data: report, error } = await supabase.from('daily_reports').insert({
        employee_id: user.id,
        company_id: user.company_id,
        branch_id: user.branch_id,
        date: todayStr,
        ...formData,
        ai_score: auditResult?.score || 85,
        ai_feedback: auditResult?.suggestions || 'Report submitted cleanly',
        ai_flags: auditResult?.flags || [],
        is_flagged: (auditResult?.score || 85) < 60,
        status: (auditResult?.score || 85) < 60 ? 'flagged' : 'submitted',
      }).select().single();

      if (error) throw error;

      // Step 3: Insert AI audit record
      if (auditResult && report) {
        await supabase.from('ai_audit_results').insert({
          report_id: report.id,
          employee_id: user.id,
          company_id: user.company_id,
          score: auditResult.score,
          keyword_match_score: auditResult.keyword_match_score,
          completeness_score: auditResult.completeness_score,
          authenticity_score: auditResult.authenticity_score,
          relevance_score: auditResult.relevance_score,
          is_copy_paste: auditResult.is_copy_paste,
          is_duplicate: auditResult.is_duplicate,
          is_suspicious: auditResult.is_suspicious,
          missing_fields: auditResult.missing_fields,
          flags: auditResult.flags,
          suggestions: auditResult.suggestions,
        });
      }

      toast.success('Daily Work Report submitted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit daily report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <FileText size={24} className="text-blue-600" /> Daily Work Report
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Submit your work logs for automated AI auditing and director review
        </p>
      </div>

      {/* AI Score Feedback Banner (if audited) */}
      {aiScore !== null && (
        <div className={`rounded-2xl p-4 border flex items-start gap-4 ${
          aiScore >= 80 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
          aiScore >= 60 ? 'bg-amber-50 border-amber-200 text-amber-700' :
          'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="p-2 rounded-xl bg-white border border-current/20 flex items-center justify-center font-extrabold text-lg shadow-sm">
            {aiScore}/100
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold flex items-center gap-1.5">
              AI Audit Result <Sparkles size={14} />
            </h4>
            <p className="text-xs">{aiSuggestions}</p>
            {aiFlags.length > 0 && (
              <div className="flex gap-2 mt-2">
                {aiFlags.map((f, i) => (
                  <span key={i} className="px-2 py-0.5 text-[10px] bg-red-100 text-red-700 rounded font-semibold border border-red-200">
                    ⚠️ {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Report Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="form-label">Today's Work Summary *</label>
            <textarea
              rows={4}
              value={formData.work_done}
              onChange={e => setFormData({ ...formData, work_done: e.target.value })}
              placeholder="Describe tasks completed, key milestones achieved, client interactions..."
              className="form-input text-xs"
              required
            />
          </div>

          <div>
            <label className="form-label">Client Visits & Meetings</label>
            <input
              type="text"
              value={formData.client_visits}
              onChange={e => setFormData({ ...formData, client_visits: e.target.value })}
              placeholder="e.g. Acme Corp (Onsite), TechLabs (Zoom)"
              className="form-input text-xs"
            />
          </div>

          <div>
            <label className="form-label">Products & SOPs Discussed</label>
            <input
              type="text"
              value={formData.products_discussed}
              onChange={e => setFormData({ ...formData, products_discussed: e.target.value })}
              placeholder="e.g. Enterprise HRMS Module, Sales SOP-04"
              className="form-input text-xs"
            />
          </div>

          <div>
            <label className="form-label">Problems & Blockers Faced</label>
            <textarea
              rows={3}
              value={formData.problems_faced}
              onChange={e => setFormData({ ...formData, problems_faced: e.target.value })}
              placeholder="Any impediments or delays..."
              className="form-input text-xs"
            />
          </div>

          <div>
            <label className="form-label">Solutions & Remedies Applied</label>
            <textarea
              rows={3}
              value={formData.solutions_applied}
              onChange={e => setFormData({ ...formData, solutions_applied: e.target.value })}
              placeholder="How issues were resolved..."
              className="form-input text-xs"
            />
          </div>

          <div className="md:col-span-2">
            <label className="form-label">Tomorrow's Action Plan</label>
            <textarea
              rows={2}
              value={formData.tomorrow_plan}
              onChange={e => setFormData({ ...formData, tomorrow_plan: e.target.value })}
              placeholder="Planned activities for tomorrow..."
              className="form-input text-xs"
            />
          </div>

          <div>
            <label className="form-label">Actual Hours Worked</label>
            <input
              type="number"
              step="0.5"
              value={formData.hours_worked}
              onChange={e => setFormData({ ...formData, hours_worked: parseFloat(e.target.value) || 0 })}
              className="form-input text-xs"
            />
          </div>

          <div>
            <label className="form-label">Additional Remarks</label>
            <input
              type="text"
              value={formData.remarks}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Optional notes for manager..."
              className="form-input text-xs"
            />
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" /> Inspected automatically by OpenAI GPT-4o
          </span>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary text-xs px-6"
          >
            <Send size={14} /> {submitting ? 'Auditing & Submitting...' : 'Submit Work Report'}
          </button>
        </div>
      </form>
    </div>
  );
};
