export interface WikiPage {
  id: string;
  repositoryId: string;
  title: string;
  slug: string;
  content: string;
  contentHtml: string | null;
  format: 'markdown' | 'asciidoc' | 'rst';
  revisionCount: number;
  authorId: string;
  authorUsername: string;
  authorAvatar: string | null;
  lastEditorId: string | null;
  lastEditorUsername: string | null;
  lastEditedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface WikiRevision {
  id: string;
  pageId: string;
  number: number;
  title: string;
  content: string;
  contentHtml: string | null;
  format: 'markdown' | 'asciidoc' | 'rst';
  message: string | null;
  authorId: string;
  authorUsername: string;
  authorAvatar: string | null;
  sha: string;
  previousSha: string | null;
  createdAt: string;
}

export interface WikiSidebar {
  id: string;
  repositoryId: string;
  content: string;
  contentHtml: string | null;
  updatedAt: string;
}

export interface WikiFooter {
  id: string;
  repositoryId: string;
  content: string;
  contentHtml: string | null;
  updatedAt: string;
}
