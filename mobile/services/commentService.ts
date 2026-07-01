import {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "../types/comment";
import apiClient from "./api";

export const commentService = {
  getComments: async (transactionTaskId: string): Promise<Comment[]> => {
    const response = await apiClient.get(
      `/transaction_tasks/${transactionTaskId}/comments`
    );
    console.log("response.data", response.data);
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.comments)) {
      return response.data.comments;
    } else if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    console.warn("⚠️ Unexpected API response structure:", response.data);
    return [];
  },

  createComment: async (
    transactionTaskId: string,
    commentData: CreateCommentRequest
  ): Promise<Comment> => {
    const response = await apiClient.post(
      `/transaction_tasks/${transactionTaskId}/comments`,
      commentData
    );
    console.log("response.data", response.data);
    return response.data;
  },

  updateComment: async (
    transactionTaskId: string,
    commentId: string,
    updates: UpdateCommentRequest
  ): Promise<Comment> => {
    const response = await apiClient.put(
      `/transaction_tasks/${transactionTaskId}/comments/${commentId}`,
      updates
    );
    return response.data;
  },

  deleteComment: async (
    transactionTaskId: string,
    commentId: string
  ): Promise<void> => {
    await apiClient.delete(
      `/transaction_tasks/${transactionTaskId}/comments/${commentId}`
    );
  },
};
