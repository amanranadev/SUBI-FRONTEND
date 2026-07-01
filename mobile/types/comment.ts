export interface Comment {
  id: string;
  content: string;
  transaction_task_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    picture?: string;
  };
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}
