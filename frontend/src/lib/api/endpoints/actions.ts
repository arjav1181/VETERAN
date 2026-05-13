import { api } from '../client';
const apiGet = api.get.bind(api);
const apiPost = api.post.bind(api);
import type { CIPipeline, CIJob, CIJobLog, CIWorkflow, CIArtifact } from '@/types';

export interface PipelineListParams {
  page?: number;
  perPage?: number;
  status?: string;
  branch?: string;
  actor?: string;
  event?: string;
}

export const actionsApi = {
  listWorkflows: (owner: string, repo: string) =>
    apiGet<CIWorkflow[]>(`/repos/${owner}/${repo}/actions/workflows`),

  getWorkflow: (owner: string, repo: string, workflowId: string) =>
    apiGet<CIWorkflow>(`/repos/${owner}/${repo}/actions/workflows/${workflowId}`),

  listPipelines: (owner: string, repo: string, params?: PipelineListParams) =>
    apiGet<CIPipeline[]>(`/repos/${owner}/${repo}/actions/runs`, { params }),

  getPipeline: (owner: string, repo: string, runId: string) =>
    apiGet<CIPipeline>(`/repos/${owner}/${repo}/actions/runs/${runId}`),

  listJobs: (owner: string, repo: string, runId: string) =>
    apiGet<CIJob[]>(`/repos/${owner}/${repo}/actions/runs/${runId}/jobs`),

  getJob: (owner: string, repo: string, runId: string, jobId: string) =>
    apiGet<CIJob>(`/repos/${owner}/${repo}/actions/runs/${runId}/jobs/${jobId}`),

  getLog: (owner: string, repo: string, runId: string, jobId: string) =>
    apiGet<CIJobLog>(`/repos/${owner}/${repo}/actions/runs/${runId}/jobs/${jobId}/logs`),

  listArtifacts: (owner: string, repo: string, runId: string) =>
    apiGet<CIArtifact[]>(`/repos/${owner}/${repo}/actions/runs/${runId}/artifacts`),

  rerun: (owner: string, repo: string, runId: string) =>
    apiPost<void>(`/repos/${owner}/${repo}/actions/runs/${runId}/rerun`),

  cancel: (owner: string, repo: string, runId: string) =>
    apiPost<void>(`/repos/${owner}/${repo}/actions/runs/${runId}/cancel`),

  deleteRun: (owner: string, repo: string, runId: string) =>
    apiPost<void>(`/repos/${owner}/${repo}/actions/runs/${runId}/delete`),
};
