export interface Contact {
  id: string | number;
  name: string;
  email: string;
  phone: string | null;
}

export interface MessageComposedData {
  message_id: string | number;
  contact: Contact;
  message_type: "email" | "sms" | "call";
  subject: string;
  body: string;
  requires_confirmation: boolean;
}

export interface MessageComposedResponse {
  type: "message_composed";
  content: string;
  data: MessageComposedData;
  timestamp: string;
}

