import React, { useState } from 'react';
import {
  CardStatus,
  UserRole,
  AuditLogEntry,
  VerificationRecord,
} from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  History,
  Send,
  Lock,
  Unlock,
  X,
  FileCheck,
  AlertCircle,
} from 'lucide-react';

interface AuditAndWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: CardStatus;
  onUpdateStatus: (newStatus: CardStatus) => void;
  userRole: UserRole;
  onUpdateUserRole: (newRole: UserRole) => void;
  auditLogs: AuditLogEntry[];
  onAddAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  record: VerificationRecord;
  onUpdateRecord: (record: VerificationRecord) => void;
}

export const AuditAndWorkflowModal: React.FC<AuditAndWorkflowModalProps> = ({
  isOpen,
  onClose,
  status,
  onUpdateStatus,
  userRole,
  onUpdateUserRole,
  auditLogs,
  onAddAuditLog,
  record,
  onUpdateRecord,
}) => {
  const [note, setNote] = useState('');
  const [activeTab, setActiveTab] = useState<'workflow' | 'audit'>('workflow');

  if (!isOpen) return null;

  const handleAction = (newStatus: CardStatus, actionName: string, detailMsg: string) => {
    onUpdateStatus(newStatus);
    onUpdateRecord({
      ...record,
      status: newStatus,
      approvedBy:
        newStatus === 'approved'
          ? `${userRole === 'admin' ? 'Prof. Dr. Registrar (Admin)' : 'Department Staff'}`
          : record.approvedBy,
      approvalDate:
        newStatus === 'approved'
          ? new Date().toISOString().replace('T', ' ').slice(0, 19)
          : record.approvalDate,
    });

    onAddAuditLog({
      user:
        userRole === 'admin'
          ? 'Prof. Dr. Registrar (Admin)'
          : userRole === 'staff'
          ? 'Department Academic Staff'
          : 'Student Applicant',
      role: userRole,
      action: actionName,
      details: note ? `${detailMsg} - Note: ${note}` : detailMsg,
    });
    setNote('');
  };

  const isAllowedToApprove = userRole === 'admin';
  const isAllowedToSubmit = userRole === 'staff' || userRole === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-500/40">
                  Governance &amp; Governance Rules
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Admin Approval Workflow &amp; Audit Trail
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Switcher Toolbar */}
        <div className="bg-slate-100 p-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-600" />
            <span className="font-bold text-slate-800">Current Active Role:</span>
          </div>

          <div className="inline-flex p-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => onUpdateUserRole('student')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                userRole === 'student'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student (Cardholder)
            </button>
            <button
              type="button"
              onClick={() => onUpdateUserRole('staff')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                userRole === 'staff'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Staff / Operator
            </button>
            <button
              type="button"
              onClick={() => onUpdateUserRole('admin')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                userRole === 'admin'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Institutional Admin (Registrar)
            </button>
          </div>
        </div>

        {/* Tab Navigation: Workflow vs Audit History */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 text-xs px-4">
          <button
            type="button"
            onClick={() => setActiveTab('workflow')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'workflow'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Approval Lifecycle &amp; Status</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit History Log ({auditLogs.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'workflow' ? (
            <div className="space-y-4">
              {/* Current Status Banner */}
              <div className="p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white shadow-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Current Issuance State
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : status === 'pending_approval'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : status === 'draft'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {status === 'approved'
                        ? 'Approved & Issued'
                        : status === 'pending_approval'
                        ? 'Pending Admin Review'
                        : status === 'draft'
                        ? 'Draft (Editable)'
                        : status === 'suspended'
                        ? 'Suspended'
                        : 'Expired'}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Database ID: {record.databaseId}
                    </span>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-500">
                  <div>Approved By: <span className="font-semibold text-slate-800">{record.approvedBy}</span></div>
                  <div>Date: <span className="font-mono text-slate-700">{record.approvalDate}</span></div>
                </div>
              </div>

              {/* Action Buttons based on Role */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs">
                    Workflow Actions Available to {userRole.toUpperCase()}
                  </h4>
                  {userRole === 'student' && (
                    <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> View-only Permissions
                    </span>
                  )}
                </div>

                {/* Optional Note input */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Reviewer Note / Decision Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Identity verified via biometric record and TU central database..."
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Workflow Buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {isAllowedToSubmit && status === 'draft' && (
                    <button
                      type="button"
                      onClick={() =>
                        handleAction(
                          'pending_approval',
                          'Submitted for Official Approval',
                          'Card details locked and forwarded to Registrar desk'
                        )
                      }
                      className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Submit for Admin Approval
                    </button>
                  )}

                  {isAllowedToApprove && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          handleAction(
                            'approved',
                            'Official Card Issuance Approved',
                            'Registrar seal applied, credential marked active in university ledger'
                          )
                        }
                        className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve &amp; Issue Card
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleAction(
                            'draft',
                            'Revision Requested / Returned to Draft',
                            'Returned for photo or detail corrections'
                          )
                        }
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        Request Revision (Reset to Draft)
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleAction(
                            'suspended',
                            'Card Revoked / Suspended',
                            'Credential invalidated in central database'
                          )
                        }
                        className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Suspend Card
                      </button>
                    </>
                  )}

                  {userRole === 'student' && (
                    <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-blue-800 text-[11px]">
                      As a student/cardholder, you have viewing and request privileges. For card issuance or official changes, please contact your department administration.
                    </div>
                  )}
                </div>
              </div>

              {/* Roles & Permissions Matrix Info */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                  Role-Based Security Matrix (RBAC)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10.5px]">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="font-bold text-slate-800 block">Student</span>
                    <span className="text-slate-500">Preview, flip front/back, request changes, verify QR.</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="font-bold text-slate-800 block">Department Staff</span>
                    <span className="text-slate-500">Edit fields, crop photos, modify library rules, submit for approval.</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="font-bold text-slate-800 block">Institutional Admin</span>
                    <span className="text-slate-500">Full control, approve issuance, revoke, edit university seals.</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Audit Log History */
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-slate-600 mb-2">
                <span className="font-bold text-slate-900">Immutable Institutional Activity Ledger</span>
                <span className="text-[11px] font-mono">{auditLogs.length} verified events logged</span>
              </div>

              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            log.role === 'admin'
                              ? 'bg-indigo-600'
                              : log.role === 'staff'
                              ? 'bg-blue-600'
                              : 'bg-emerald-600'
                          }`}
                        />
                        <span className="font-bold text-slate-900 text-xs">{log.action}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.timestamp}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-800">{log.user}</span>
                      <span className="text-slate-400">•</span>
                      <span className="uppercase text-[9.5px] font-bold px-1.5 py-0.2 bg-slate-100 rounded text-slate-600 border border-slate-200">
                        {log.role}
                      </span>
                    </div>

                    {log.details && (
                      <p className="mt-1 text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100">
                        {log.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer transition-colors"
          >
            Close Governance Panel
          </button>
        </div>
      </div>
    </div>
  );
};
