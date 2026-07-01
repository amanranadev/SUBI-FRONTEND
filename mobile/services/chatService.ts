import {
  ChatMessage,
  UserChat,
  CreateChatRequest,
  SendMessageRequest,
  UpdateChatRequest,
  MessageDraft,
  SendDraftResponse,
} from '../types/chat';
import apiClient from './api';

export const chatService = {
  // Chat CRUD operations
  getChats: async (): Promise<UserChat[]> => {
    const response = await apiClient.get('/user_chats');
    return response.data.data || response.data;
  },

  getChat: async (chatId: string): Promise<UserChat> => {
    const response = await apiClient.get(`/user_chats/${chatId}`);
    return response.data.data || response.data;
  },

  createChat: async (data: CreateChatRequest): Promise<UserChat> => {
    const response = await apiClient.post('/user_chats', data);
    return response.data.data || response.data;
  },

  updateChat: async (chatId: string, data: UpdateChatRequest): Promise<UserChat> => {
    const response = await apiClient.put(`/user_chats/${chatId}`, data);
    return response.data.data || response.data;
  },

  deleteChat: async (chatId: string): Promise<void> => {
    await apiClient.delete(`/user_chats/${chatId}`);
  },

  // Message operations
  sendMessage: async (chatId: string, data: SendMessageRequest): Promise<ChatMessage> => {
    const response = await apiClient.post(`/user_chats/${chatId}/messages`, data);
    return response.data.message || response.data;
  },

  // Message draft operations
  getMessageDrafts: async (): Promise<MessageDraft[]> => {
    const response = await apiClient.get('/message_drafts');
    return response.data.data || response.data;
  },

  getMessageDraft: async (draftId: string): Promise<MessageDraft> => {
    const response = await apiClient.get(`/message_drafts/${draftId}`);
    return response.data.data || response.data;
  },

  sendDraft: async (draftId: string): Promise<SendDraftResponse> => {
    const response = await apiClient.post(`/message_drafts/${draftId}/send_message`);
    return response.data;
  },

  cancelDraft: async (draftId: string): Promise<void> => {
    await apiClient.delete(`/message_drafts/${draftId}`);
  },
};
