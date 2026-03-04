import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Genkit instance configured with the Google AI plugin.
 * This instance is used to define flows, prompts, and schemas.
 */
export const ai = genkit({
  plugins: [googleAI()],
});
