
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This is the base AI configuration.
// In server actions, we will re-initialize with the API key to ensure it's available.
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
