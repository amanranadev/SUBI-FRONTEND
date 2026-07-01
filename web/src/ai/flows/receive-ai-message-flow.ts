'use server';
/**
 * @fileOverview A Genkit flow for the SUBI AI assistant to receive a user message and respond.
 *
 * - receiveAIMessage - A function that handles processing a user message and generating an AI response.
 * - ReceiveAIMessageInput - The input type for the receiveAIMessage function.
 * - ReceiveAIMessageOutput - The return type for the receiveAIMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReceiveAIMessageInputSchema = z.object({
  message: z.string().describe("The user's message to the AI assistant.")
});
export type ReceiveAIMessageInput = z.infer<typeof ReceiveAIMessageInputSchema>;

const ReceiveAIMessageOutputSchema = z.object({
  response: z.string().describe("The AI assistant's intelligent, context-aware, and helpful textual response.")
});
export type ReceiveAIMessageOutput = z.infer<typeof ReceiveAIMessageOutputSchema>;

export async function receiveAIMessage(input: ReceiveAIMessageInput): Promise<ReceiveAIMessageOutput> {
  return receiveAIMessageFlow(input);
}

const receiveAIMessagePrompt = ai.definePrompt({
  name: 'receiveAIMessagePrompt',
  input: {schema: ReceiveAIMessageInputSchema},
  output: {schema: ReceiveAIMessageOutputSchema},
  prompt: `You are SUBI, an intelligent, context-aware, and helpful AI assistant. Your goal is to provide concise and accurate textual responses to user queries. Please respond to the following message:

User message: {{{message}}}`
});

const receiveAIMessageFlow = ai.defineFlow(
  {
    name: 'receiveAIMessageFlow',
    inputSchema: ReceiveAIMessageInputSchema,
    outputSchema: ReceiveAIMessageOutputSchema,
  },
  async (input) => {
    const {output} = await receiveAIMessagePrompt(input);
    return output!;
  }
);
