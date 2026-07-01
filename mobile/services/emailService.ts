import apiClient from "./api";

interface Draft {
    id: string;
    recipient_name: string;
    recipient_email: string;
    recipient_phone: string | null;
    message_type: "email" | "sms" | "call";
    subject: string;
    body: string;
    status: "sent" | "draft" | "failed";
    recipient_type: "buyer" | "seller" | "agent";
    contact_id: string | null;
    transaction_id: string | null;
    created_at: string;
    expires_at: string;
}

export interface SendEmailResponse {
    draft: Draft;
    message: string;
}

export const emailService = {
    sendEmail: async (id: string): Promise<SendEmailResponse> => {
        try {
            const response = await apiClient.post<SendEmailResponse>(`/message_drafts/${id}/send_message`);
            return response.data;
        } catch (error) {
            console.error("Error sending email:", error);
            throw error;
        }
    }
}