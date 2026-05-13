import { z } from 'zod';

export const createWorkflowSchema = z.object({
  name: z.string().min(1, 'Workflow name is required').max(200, 'Workflow name is too long'),
  path: z.string().min(1, 'Workflow path is required').max(500).regex(/^\.github\/workflows\/.+\.(yml|yaml)$/, 'Workflow path must be in .github/workflows/ and end with .yml or .yaml'),
  content: z.string().min(1, 'Workflow content is required'),
  isActive: z.boolean().optional().default(true),
});

export const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const dispatchWorkflowSchema = z.object({
  ref: z.string().min(1, 'Branch or tag reference is required'),
  inputs: z.record(z.string(), z.string()).optional().default({}),
});

export const cancelPipelineSchema = z.object({
  force: z.boolean().optional().default(false),
});

export const rerunPipelineSchema = z.object({
  fromFailed: z.boolean().optional().default(false),
});

export const createRunnerSchema = z.object({
  name: z.string().min(1, 'Runner name is required').max(100),
  labels: z.array(z.string()).optional().default([]),
  machineType: z.string().optional(),
  image: z.string().optional(),
});

export const updateRunnerSchema = z.object({
  labels: z.array(z.string()).optional(),
});
