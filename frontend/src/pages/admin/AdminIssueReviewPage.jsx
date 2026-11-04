import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  MapPin,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Layers,
  History,
  GitMerge,
  Save,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';

import { AdminLayout } from '../../components/layout/AdminLayout';
import { StatusBadge } from '../../components/issues/StatusBadge';
import { SeverityBadge } from '../../components/issues/SeverityBadge';
import { PriorityIndicator } from '../../components/issues/PriorityIndicator';
import { StatusTimeline } from '../../components/issues/StatusTimeline';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { IssueMap } from '../../components/maps/IssueMap';

import { issueService } from '../../services/issueService';
import { adminService } from '../../services/adminService';
import { findDuplicateCandidates } from '../../services/duplicateDetectionService';
import { useAuth } from '../../context/AuthContext';
import { useIssues } from '../../context/IssueContext';

export function AdminIssueReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { issues, reloadData } = useIssues();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status & Priority state
  const [status, setStatus] = useState('');
  const [priorityScore, setPriorityScore] = useState(50);
  const [note, setNote] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  // Department assignment state
  const [department, setDepartment] = useState('');
  const [savingDepartment, setSavingDepartment] = useState(false);

  // Duplicate candidate state
  const [duplicateCandidates, setDuplicateCandidates] = useState([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await issueService.getIssueById(id);
        setIssue(data);
        setStatus(data.status);
        setPriorityScore(data.priorityScore || 50);
        setDepartment(data.assignedDepartment || '');

        // Calculate duplicate candidates against other issues
        const candidates = findDuplicateCandidates(data, issues);
        setDuplicateCandidates(candidates);
      } catch (err) {
        toast.error('Failed to load report for admin review');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, issues]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setSavingStatus(true);
    try {
      const updated = await adminService.updateIssueStatus(issue.id, status, note, user);
      setIssue(updated);
      setNote('');
      reloadData();
      toast.success(`Status updated to ${status} and logged in audit history.`);
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleUpdatePriority = async () => {
    try {
      const updated = await adminService.updateIssuePriority(issue.id, priorityScore, 'Manual Priority Override', user);
      setIssue(updated);
      reloadData();
      toast.success(`Priority score updated to ${priorityScore}`);
    } catch (err) {
      toast.error('Failed to update priority score');
    }
  };

  const handleMergeDuplicate = async (primaryId, duplicateId) => {
    try {
      await adminService.mergeDuplicateIssues(primaryId, duplicateId, 'Merged via Admin Review', user);
      reloadData();
      toast.success('Duplicate report merged successfully!');
      navigate('/admin/issues');
    } catch (err) {
      toast.error('Failed to merge duplicate issues');
    }
  };

  const handleAssignDepartment = async () => {
    if (!department) {
      toast.error('Please select a municipal department to assign');
      return;
    }
    setSavingDepartment(true);
    try {
      const updated = await adminService.assignDepartment(issue.id, department, 'Assigned via Admin Review');
      setIssue(updated);
      reloadData();
      toast.success(`Assigned to ${department}`);
    } catch (err) {
      toast.error(err.message || 'Failed to assign department');
    } finally {
      setSavingDepartment(false);
    }
  };

  if (loading || !issue) {
    return (
      <AdminLayout>
        <div className="p-12 text-center text-slate-400">Loading admin report review...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="space-y-1">
            <Link to="/admin/issues" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-brand-600 mb-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Queue</span>
            </Link>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-600" />
              <span>Reviewing Report #{issue.id}</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={issue.status} size="lg" />
            <PriorityIndicator score={issue.priorityScore} />
          </div>
        </div>

        {/* 2-Column Review Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Details, Images, Map */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
                {issue.categoryName}
              </span>

              <h2 className="text-xl font-bold text-slate-900">{issue.title}</h2>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{issue.description}</p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold text-slate-900">{issue.address}</span>
              </div>
            </div>

            {/* Evidence Gallery */}
            {issue.images && issue.images.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Attached Evidence Photos</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {issue.images.map((img) => (
                    <img
                      key={img.id}
                      src={img.imageUrl}
                      alt="Evidence"
                      className="h-32 w-full object-cover rounded-xl border border-slate-200"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Leaflet Map */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Geospatial Marker</h3>
              <IssueMap issues={[issue]} center={[issue.latitude, issue.longitude]} zoom={15} height="280px" />
            </div>
          </div>

          {/* Right Column: Status & Priority Controls */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                Update Status & Log Audit
              </h3>

              <form onSubmit={handleUpdateStatus} className="space-y-3">
                <Select label="Workflow Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="OPEN">OPEN</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="REJECTED">REJECTED</option>
                </Select>

                <Textarea
                  label="Official Note / Contractor Dispatch Detail"
                  placeholder="Enter audit note for history log..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                />

                <Button type="submit" isLoading={savingStatus} variant="primary" className="w-full" leftIcon={<Save className="w-4 h-4" />}>
                  Save Status Update
                </Button>
              </form>
            </div>

            {/* Manual Priority Adjustment */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Priority Score Adjustment</h3>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={priorityScore}
                  onChange={(e) => setPriorityScore(Number(e.target.value))}
                />
                <Button onClick={handleUpdatePriority} variant="outline" size="sm">
                  Update
                </Button>
              </div>
            </div>

            {/* Department Assignment */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-violet-600" />
                  <span>Assigned Department</span>
                </h3>
                {issue.assignedDepartment && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700">
                    {issue.assignedDepartment}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <Select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="">Select Municipal Department</option>
                  <option value="Roads & Highways">Roads & Highways</option>
                  <option value="Sanitation & Waste Management">Sanitation & Waste Management</option>
                  <option value="Water Works & Drainage">Water Works & Drainage</option>
                  <option value="Electrical & Street Lighting">Electrical & Street Lighting</option>
                  <option value="Parks & Public Spaces">Parks & Public Spaces</option>
                  <option value="Traffic & Signage Division">Traffic & Signage Division</option>
                </Select>
                <Button
                  onClick={handleAssignDepartment}
                  isLoading={savingDepartment}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  Assign Department
                </Button>
              </div>
            </div>

            {/* Duplicate Candidates List */}
            {duplicateCandidates.length > 0 && (
              <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-300 shadow-card space-y-3">
                <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <GitMerge className="w-4 h-4 text-amber-700" />
                  <span>Duplicate Candidates ({duplicateCandidates.length})</span>
                </h4>

                {duplicateCandidates.map((cand) => (
                  <div key={cand.candidateIssue.id} className="p-3 bg-white rounded-xl border border-amber-200 space-y-2 text-xs">
                    <div className="flex justify-between items-center font-bold text-slate-900">
                      <span className="truncate">{cand.candidateIssue.title}</span>
                      <span className="text-amber-700">{cand.totalScore}% Match</span>
                    </div>
                    <Button
                      onClick={() => handleMergeDuplicate(issue.id, cand.candidateIssue.id)}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                    >
                      Merge This Duplicate Into Current
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Audit Log History */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-brand-600" />
            <span>Audit Trail & Historical Status Transitions</span>
          </h3>
          <StatusTimeline history={issue.statusHistory} />
        </div>
      </div>
    </AdminLayout>
  );
}
