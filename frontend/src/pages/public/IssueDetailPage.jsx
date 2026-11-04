import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ThumbsUp, MessageSquare, Calendar, User, Shield, Share2, ArrowLeft, Image as ImageIcon, AlertTriangle, XCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';

import { AppShell } from '../../components/layout/AppShell';
import { StatusBadge } from '../../components/issues/StatusBadge';
import { SeverityBadge } from '../../components/issues/SeverityBadge';
import { PriorityIndicator } from '../../components/issues/PriorityIndicator';
import { StatusTimeline } from '../../components/issues/StatusTimeline';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { Avatar } from '../../components/ui/Avatar';
import { IssueMap } from '../../components/maps/IssueMap';

import { issueService } from '../../services/issueService';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

export function IssueDetailPage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmCount, setConfirmCount] = useState(0);

  // Comment Form state
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Admin Controls state
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Image Lightbox Modal state
  const [selectedImage, setSelectedImage] = useState(null);

  // Citizen Issue Withdrawal state
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('Reported by mistake');
  const [customWithdrawReason, setCustomWithdrawReason] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await issueService.getIssueById(id);
        setIssue(data);
        setConfirmed(data.userConfirmed || false);
        setConfirmCount(data.confirmationsCount || 0);
        setNewStatus(data.status);
      } catch (err) {
        toast.error('Failed to load issue details');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleConfirmToggle = async () => {
    if (!user) {
      toast.error('Please log in as a citizen to confirm this issue report.');
      return;
    }

    try {
      if (confirmed) {
        await issueService.unconfirmIssue(issue.id, user);
        setConfirmed(false);
        setConfirmCount((prev) => Math.max(0, prev - 1));
        toast.info('Confirmation removed');
      } else {
        await issueService.confirmIssue(issue.id, user);
        setConfirmed(true);
        setConfirmCount((prev) => prev + 1);
        toast.success('Confirmed! Your support boosts priority.');
      }
    } catch (err) {
      toast.error('Failed to toggle confirmation');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const newCmt = await issueService.addComment(issue.id, commentText, user);
      setIssue((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), newCmt],
      }));
      setCommentText('');
      toast.success('Comment added successfully.');
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAdminStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      const updated = await adminService.updateIssueStatus(issue.id, newStatus, statusNote, user);
      setIssue(updated);
      setStatusNote('');
      toast.success(`Issue status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleWithdrawIssue = async () => {
    setWithdrawing(true);
    try {
      const finalReason =
        withdrawReason === 'Other'
          ? (customWithdrawReason.trim() || 'Report withdrawn by citizen')
          : withdrawReason;
      const updated = await issueService.cancelIssue(issue.id, finalReason);
      setIssue(updated);
      setNewStatus('CANCELLED');
      setWithdrawModalOpen(false);
      toast.success('Your report has been successfully withdrawn/cancelled.');
    } catch (err) {
      toast.error(err.message || 'Failed to withdraw issue report');
    } finally {
      setWithdrawing(false);
    }
  };

  const isOwner = Boolean(
    user &&
    (user.id === issue?.userId ||
      user.id === issue?.user?.id ||
      (user.email && issue?.user?.email && user.email === issue.user.email))
  );
  const canWithdraw = Boolean(
    (isOwner || isAdmin) &&
    issue &&
    issue.status !== 'CANCELLED' &&
    issue.status !== 'RESOLVED'
  );

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
          <CardSkeleton />
        </div>
      </AppShell>
    );
  }

  if (!issue) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="text-2xl font-bold">Report Not Found</h2>
          <p className="text-slate-500">The requested civic report does not exist or has been removed.</p>
          <Link to="/explore">
            <Button variant="outline">Back to Explore</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Top Banner Navigation */}
      <div className="bg-white/80 dark:bg-[#120d25]/90 backdrop-blur-md border-b border-purple-200/80 dark:border-purple-900/40 py-4 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/explore" className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-800 dark:text-purple-300 hover:text-violet-600 dark:hover:text-violet-400">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Issues</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Report URL copied to clipboard!');
              }}
              variant="ghost"
              size="sm"
              leftIcon={<Share2 className="w-3.5 h-3.5" />}
            >
              Share Report
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Issue Header Title Card */}
        <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card space-y-4 transition-colors">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={issue.status} size="lg" />
            <SeverityBadge severity={issue.severity} size="lg" />
            <PriorityIndicator score={issue.priorityScore} />
            <span className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-950/80 px-3 py-1 rounded-full border border-violet-200 dark:border-violet-800">
              {issue.categoryName}
            </span>
            {issue.assignedDepartment && (
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                🏛️ {issue.assignedDepartment}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-purple-950 dark:text-white leading-tight">
            {issue.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-purple-700/80 dark:text-purple-300/80 pt-2 border-t border-purple-100 dark:border-purple-900/30">
            <div className="flex items-center gap-2">
              <Avatar name={issue.userName} size="sm" />
              <span className="font-semibold text-purple-950 dark:text-purple-100">{issue.userName}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Reported {format(new Date(issue.createdAt), 'MMM d, yyyy • h:mm a')}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-medium text-purple-900 dark:text-purple-200">{issue.address}</span>
            </div>
          </div>
        </div>

        {/* Withdrawn / Cancelled Banner */}
        {issue.status === 'CANCELLED' && (
          <div className="bg-slate-100/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3 text-slate-800 dark:text-slate-200 shadow-sm">
            <XCircle className="w-5 h-5 text-slate-500 shrink-0" />
            <div>
              <p className="text-sm font-bold">This issue report has been withdrawn / cancelled.</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The citizen noted that this issue was submitted by mistake or has already been addressed. No further municipal dispatch will be scheduled.
              </p>
            </div>
          </div>
        )}

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Description, Evidence Gallery, Comments */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {issue.images && issue.images.length > 0 && (
              <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <span>Photo Evidence ({issue.images.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {issue.images.map((img) => (
                    <div
                      key={img.id}
                      onClick={() => setSelectedImage(img.imageUrl)}
                      className="group relative h-40 rounded-xl overflow-hidden bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 cursor-pointer"
                    >
                      <img
                        src={img.imageUrl}
                        alt="Evidence"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                      />
                      <div className="absolute inset-0 bg-purple-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                        Click to enlarge
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Issue Description</h3>
              <p className="text-purple-950 dark:text-purple-100 text-sm leading-relaxed whitespace-pre-line">
                {issue.description}
              </p>
            </div>

            {/* Interactive Map Location View */}
            <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Report Location</span>
              </h3>
              <IssueMap issues={[issue]} center={[issue.latitude, issue.longitude]} zoom={15} height="320px" />
              <p className="text-xs text-purple-700/70 dark:text-purple-300/70 font-mono">{issue.address}</p>
            </div>

            {/* Comments Section */}
            <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card space-y-6">
              <h3 className="text-base font-bold text-purple-950 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <span>Discussion & Official Updates ({(issue.comments || []).length})</span>
              </h3>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="space-y-3 bg-purple-50/60 dark:bg-purple-950/40 p-4 rounded-xl border border-purple-200/80 dark:border-purple-800/50">
                <Textarea
                  placeholder={
                    user
                      ? 'Add a public comment or update...'
                      : 'Please log in as a citizen or admin to join the discussion...'
                  }
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={!user || submittingComment}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button type="submit" isDisabled={!user || !commentText.trim()} isLoading={submittingComment} size="sm">
                    Post Comment
                  </Button>
                </div>
              </form>

              {/* Comment List */}
              <div className="space-y-4">
                {(issue.comments || []).length === 0 ? (
                  <p className="text-xs text-purple-700/60 dark:text-purple-400/60 italic text-center py-4">No comments posted yet.</p>
                ) : (
                  issue.comments.map((cmt) => (
                    <div key={cmt.id} className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar name={cmt.userName} size="sm" />
                          <span className="text-xs font-bold text-purple-950 dark:text-purple-100">{cmt.userName}</span>
                          <span className="text-[10px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-950/80 px-2 py-0.5 rounded border border-violet-200/50 dark:border-violet-800/50">
                            {cmt.userRole}
                          </span>
                        </div>
                        <span className="text-[11px] text-purple-500 dark:text-purple-400">
                          {cmt.createdAt ? formatDistanceToNow(new Date(cmt.createdAt), { addSuffix: true }) : ''}
                        </span>
                      </div>
                      <p className="text-xs text-purple-900 dark:text-purple-200 leading-relaxed pl-8">{cmt.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Actions, Confirmations & Status Timeline */}
          <div className="space-y-6">
            {/* Citizen Confirmation CTA Box */}
            <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Citizen Confirmation</h3>
              <p className="text-xs text-purple-800/70 dark:text-purple-300/70 leading-relaxed">
                Experiencing this issue too? Confirming boosts the priority score and moves it up the municipal repair queue!
              </p>

              <div className="flex items-center justify-between bg-purple-50/60 dark:bg-purple-950/40 p-3.5 rounded-xl border border-purple-200/80 dark:border-purple-800/50">
                <span className="text-2xl font-extrabold text-purple-950 dark:text-white">{confirmCount}</span>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Confirmations</span>
              </div>

              <Button
                onClick={handleConfirmToggle}
                className="w-full"
                variant={confirmed ? 'outline' : 'primary'}
                leftIcon={<ThumbsUp className={`w-4 h-4 ${confirmed ? 'fill-violet-600 text-violet-600 dark:fill-violet-400 dark:text-violet-400' : ''}`} />}
              >
                {confirmed ? 'Confirmed (Click to Remove)' : 'Confirm This Report'}
              </Button>
            </div>

            {/* Citizen Withdraw / Cancel Option */}
            {canWithdraw && (
              <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 rounded-2xl border border-rose-200/70 dark:border-rose-900/40 shadow-card space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>Withdraw Report</span>
                </h3>
                <p className="text-xs text-purple-800/70 dark:text-purple-300/70 leading-relaxed">
                  Submitted this issue by mistake or has it already been resolved? You can withdraw or cancel your submission.
                </p>
                <Button
                  onClick={() => setWithdrawModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="w-full text-rose-600 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:border-rose-800"
                  leftIcon={<XCircle className="w-4 h-4 text-rose-500" />}
                >
                  Withdraw / Cancel Report
                </Button>
              </div>
            )}

            {/* Admin Management Widget (Visible if Admin) */}
            {isAdmin && (
              <div className="bg-amber-50/80 dark:bg-amber-950/40 p-6 rounded-2xl border border-amber-300 dark:border-amber-800/60 shadow-card space-y-4">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
                  <Shield className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>Admin Control Console</span>
                </div>

                <form onSubmit={handleAdminStatusUpdate} className="space-y-3">
                  <Select
                    label="Change Status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="UNDER_REVIEW">UNDER REVIEW</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </Select>

                  <Textarea
                    label="Audit Note / Action Reason"
                    placeholder="Enter reason or dispatch details..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    rows={2}
                  />

                  <Button type="submit" isLoading={updatingStatus} variant="secondary" size="sm" className="w-full">
                    Update Status & Log Audit
                  </Button>
                </form>
              </div>
            )}

            {/* Status History Timeline */}
            <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Status History Audit</h3>
              <StatusTimeline history={issue.statusHistory} />
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      <Modal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)} title="Photo Evidence Preview">
        {selectedImage && (
          <div className="max-h-[80vh] overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center">
            <img src={selectedImage} alt="Full Size Evidence" className="max-h-[75vh] w-auto object-contain" />
          </div>
        )}
      </Modal>

      {/* Withdraw Report Confirmation Modal */}
      <Modal
        isOpen={withdrawModalOpen}
        onClose={() => !withdrawing && setWithdrawModalOpen(false)}
        title="Withdraw Issue Report"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Are you sure you want to withdraw this issue? This will change the status to <strong>Withdrawn / Cancelled</strong> and alert municipal authorities not to dispatch personnel.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-900 dark:text-purple-200 mb-1">
              Reason for Withdrawal
            </label>
            <Select
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
              className="w-full"
            >
              <option value="Reported by mistake">Reported by mistake / wrong location</option>
              <option value="Already fixed / no longer an issue">Already fixed / no longer an issue</option>
              <option value="Duplicate of another report">Duplicate of another report</option>
              <option value="Other">Other (specify below)</option>
            </Select>
          </div>

          {withdrawReason === 'Other' && (
            <div>
              <label className="block text-xs font-bold text-purple-900 dark:text-purple-200 mb-1">
                Additional Details
              </label>
              <Textarea
                placeholder="Please explain why you are withdrawing this report..."
                value={customWithdrawReason}
                onChange={(e) => setCustomWithdrawReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-purple-100 dark:border-purple-900/40">
            <Button
              variant="ghost"
              onClick={() => setWithdrawModalOpen(false)}
              disabled={withdrawing}
              size="sm"
            >
              Keep Report
            </Button>
            <Button
              variant="danger"
              onClick={handleWithdrawIssue}
              isLoading={withdrawing}
              size="sm"
            >
              Confirm Withdrawal
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
