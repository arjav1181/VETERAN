export interface Project {
  id: string;
  repositoryId: string | null;
  organizationId: string | null;
  userId: string | null;
  name: string;
  body: string | null;
  bodyHtml: string | null;
  number: number;
  state: 'open' | 'closed';
  isTemplate: boolean;
  columnCount: number;
  cardCount: number;
  icon: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectColumn {
  id: string;
  projectId: string;
  name: string;
  position: number;
  cardCount: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCard {
  id: string;
  columnId: string;
  projectId: string;
  position: number;
  contentId: string | null;
  contentType: 'issue' | 'pull_request' | 'note' | null;
  note: string | null;
  isArchived: boolean;
  archivedAt: string | null;
  creatorId: string;
  creatorUsername: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectView {
  id: string;
  projectId: string;
  name: string;
  layout: 'board' | 'table' | 'timeline';
  groupBy: string | null;
  sortBy: string | null;
  sortDirection: 'asc' | 'desc';
  filterQuery: string | null;
  visibleFields: string[];
  createdAt: string;
  updatedAt: string;
}
