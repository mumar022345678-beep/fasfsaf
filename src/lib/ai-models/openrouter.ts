import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is not configured');
}

// Initialize OpenRouter provider
// The baseURL points to OpenRouter's API endpoint
export const openrouter = createOpenRouter({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Define the models you'll be using with their OpenRouter identifiers
export const OPENROUTER_MODELS = {
  // Fast dev & testing / Cost-effective for simple tasks and titles
  // Using Llama 3.1 8B as 3.2 3B might not be directly available or stable on OpenRouter
  LITE_MODEL: "meta-llama/llama-3.1-8b-instruct",
  
  // Balanced speed & power
  BALANCED_MISTRAL_7B: "mistralai/mistral-7b-instruct-v0.2",
  BALANCED_MISTRAL_NEMO: "mistralai/mistral-nemo",
  
  // Heavy, detailed tasks
  HEAVY_QWEN2_72B: "qwen/qwen2-72b-instruct",
  
  // Multimodal vision tasks (Note: This requires specific handling for image inputs,
  // which is beyond the scope of this initial text-based chat integration.
  // It's included for future reference but won't be actively used in text chat for now.)
  // Using Llama 3.1 405B as 11B might not be directly available or stable on OpenRouter
  MULTIMODAL_LLAMA_VISION: "meta-llama/llama-3.1-405b-instruct-vision", 
};

// --- Future-proofing: Commented out integrations for other providers ---

// Example for OpenAI (ChatGPT) direct integration using @ai-sdk/openai
/*
if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not configured. OpenAI models will not be available.');
}
export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export const OPENAI_MODELS = {
  GPT_4O: "gpt-4o",
  GPT_3_5_TURBO: "gpt-3.5-turbo",
};
*/

// Example for Google Gemini direct integration using @ai-sdk/google
/*
if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not configured. Gemini models will not be available.');
}
export const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});
export const GEMINI_MODELS = {
  GEMINI_1_5_FLASH: "gemini-1.5-flash",
  GEMINI_1_5_PRO: "gemini-1.5-pro",
};
*/
