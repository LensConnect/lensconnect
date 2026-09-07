import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, Output } from 'ai'; // 🌟 Import Output stably
import { z } from 'zod';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const searchFilterSchema = z.object({
  searchQuery: z.string(),
  location: z.string(),
  selectedSpecialties: z.array(z.string()),
  minPrice: z.number().nullable(),
  maxPrice: z.number().nullable(),
  sortBy: z.string(),
});

export type ParsedSearchFilters = z.infer<typeof searchFilterSchema>;

export async function parseNaturalLanguageQuery(promptText: string): Promise<ParsedSearchFilters> {
  const fallbackFilters: ParsedSearchFilters = {
    searchQuery: promptText,
    location: '',
    selectedSpecialties: [],
    minPrice: null,
    maxPrice: null,
    sortBy: 'price_low', // Safe fallback sorting metric
  };

  try {
    const aiResponse = await generateText({
      model: openrouter('meta-llama/llama-3.3-70b-instruct'),
      system: `You are a query parsing engine for a photographer database. 
      Read user searches and extract filters into structured JSON.
      Valid Specialties list: ["Events", "Portraits", "Products", "Real Estate", "Fashion", "Family", "Weddings", "Commercial", "Sports"]
      
      Rules:
      1. Map keywords to valid specialties (e.g., 'marriage' -> 'Weddings').
      2. Extract price thresholds and locations.
     
      3. For 'sortBy', choose: 'price_asc' or 'price_desc'.
      4. If location is not found, return empty string.
      5. Make use of natural language for search.
      6. Any figure with (e.g '300k' => 300000, '50k' => 50000).
      7. Don't return anything else but the JSON object.
      `,

      prompt: `Parse this user search query: "${promptText}"`,
      // 🌟 Stable Vercel AI SDK Structured Data Formatting:
      output: Output.object({
        schema: searchFilterSchema,
      }),
    });

    // Stably extract the generated object natively
    if (aiResponse.output) {
      return aiResponse.output as ParsedSearchFilters;
    }

    return fallbackFilters;
  } catch (error) {
    console.error("AI Generation or parsing failed, returning fallback filters.", error);
    return fallbackFilters;
  }
}
