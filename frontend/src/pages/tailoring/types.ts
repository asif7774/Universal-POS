export type JobStatus = 'Pending' | 'Cutting' | 'Stitching' | 'Finishing' | 'Quality Check' | 'Ready' | 'Delivered';

export interface TailoringJob {
  id: string;
  jobNo: string;
  customerName: string;
  phone: string;
  garment: string;
  type: 'Alteration' | 'New Stitch' | 'Repair' | 'Rush';
  assignedToName: string;
  status: JobStatus;
  dueDate: string;
  price: number;
  description: string;
  notes?: string;
}
