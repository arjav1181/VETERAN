export interface Discussion {
  id: string;
  repositoryId: string;
  number: number;
  title: string;
  body: string;
  bodyHtml: string | null;
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
  isAnswered: boolean;
  isPinned: boolean;
  isLocked: boolean;
  authorId: string;
  authorUsername: string;
  authorAvatar: string | null;
  commentCount: number;
  voteCount: number;
  upvoteCount: number;
  downvoteCount: number;
  answerId: string | null;
  answerCommentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionCategory {
  id: string;
  repositoryId: string;
  name: string;
  emoji: string;
  description: string | null;
  slug: string;
  color: string;
  isDefault: boolean;
  discussionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionComment {
  id: string;
  discussionId: string;
  parentId: string | null;
  authorId: string;
  authorUsername: string;
  authorAvatar: string | null;
  authorIsCollaborator: boolean;
  body: string;
  bodyHtml: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  isMinimized: boolean;
  minimizedReason: string | null;
  isAnswer: boolean;
  voteCount: number;
  upvoteCount: number;
  downvoteCount: number;
  childCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionVote {
  id: string;
  discussionId: string | null;
  commentId: string | null;
  userId: string;
  username: string;
  vote: 'up' | 'down';
  createdAt: string;
}
