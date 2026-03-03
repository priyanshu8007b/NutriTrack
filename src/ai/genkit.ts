import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Genkit instance configured with the Google AI plugin.
 * We use 'googleai/gemini-1.5-flash' as the default model for efficiency and speed.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
});
