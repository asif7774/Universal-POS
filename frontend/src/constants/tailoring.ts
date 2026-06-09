import { JobStatus } from 'types/tailoring';

export const STAGES: JobStatus[] = ['Pending', 'Cutting', 'Stitching', 'Finishing', 'Quality Check', 'Ready', 'Delivered'];

export const STATUS_COLOR: Record<JobStatus, string> = {
  Pending: '#94A3B8', Cutting: '#3B82F6', Stitching: '#8B5CF6',
  Finishing: '#F59E0B', 'Quality Check': '#F97316', Ready: '#10B981', Delivered: '#6B7280',
};

export const TYPE_BADGE: Record<string, string> = {
  Alteration: 'badge-navy', 'New Stitch': 'badge-gold', Repair: 'badge-gray', Rush: 'badge-red',
  Hemming: 'badge-navy', Pressing: 'badge-gray', 'Custom Stitch': 'badge-gold',
};

export const fmt = (n: number | string | null | undefined) => `$${parseFloat((n as string) ?? '0').toFixed(2)}`;
export const fmtDate = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A';
export const isOverdue = (d: string | null | undefined, status: JobStatus) =>
  d && new Date(d) < new Date() && !['Delivered', 'Ready'].includes(status);
