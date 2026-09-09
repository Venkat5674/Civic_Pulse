import React, { useState } from 'react';
import { CitizenLayout } from '../../components/layout/CitizenLayout';
import { useAuth } from '../../context/AuthContext';
import { useIssues } from '../../context/IssueContext';
import { IssueCard } from '../../components/issues/IssueCard';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { FileText, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function MyIssuesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { issues } = useIssues();
  const [statusFilter, setStatusFilter] = useState('all');

  const mySubmissions = issues.filter(
    (i) => i.userId === user?.id || i.userName === user?.name
  );

  const filtered =
    statusFilter === 'all'
      ? mySubmissions
      : mySubmissions.filter((i) => i.status === statusFilter);

  return (
    <CitizenLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">My Issue Submissions</h1>
            <p className="text-xs text-slate-500 mt-1">
              View and track all infrastructure reports submitted by you ({mySubmissions.length} total)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40"
            >
              <option value="all">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </Select>

            <Button
              onClick={() => navigate('/report')}
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              New Report
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No submissions match this filter"
            description="You don't have any reported issues matching the selected status filter."
            icon={FileText}
            actionLabel="Report New Issue"
            onAction={() => navigate('/report')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </CitizenLayout>
  );
}
