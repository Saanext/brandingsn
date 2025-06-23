'use server';
/**
 * @fileOverview Generates brand name suggestions.
 *
 * - generateBrandNames - A function that handles the brand name generation process.
 * - GenerateBrandNamesInput - The input type for the generateBrandNames function.
 * - GenerateBrandNamesOutput - The return type for the generateBrandNames function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBrandNamesInputSchema = z.object({
  industry: z.string().describe('The industry the brand operates in.'),
  keywords: z
    .string()
    .describe("Keywords that describe the brand's style and personality."),
  targetAudience: z.string().describe("The brand's target audience."),
  coreMessage: z.string().describe('The core message or values of the brand.'),
  competitors: z
    .string()
    .describe('A list of competitors to differentiate from.'),
  avoid: z
    .string()
    .describe('Things to avoid in the branding (words, styles, etc.).'),
});
export type GenerateBrandNamesInput = z.infer<typeof GenerateBrandNamesInputSchema>;

const GenerateBrandNamesOutputSchema = z.object({
  names: z
    .array(z.string())
    .length(5)
    .describe('An array of 5 creative and relevant brand name ideas.'),
});
export type GenerateBrandNamesOutput = z.infer<typeof GenerateBrandNamesOutputSchema>;

export async function generateBrandNames(
  input: GenerateBrandNamesInput
): Promise<GenerateBrandNamesOutput> {
  return generateBrandNamesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBrandNamesPrompt',
  input: {schema: GenerateBrandNamesInputSchema},
  output: {schema: GenerateBrandNamesOutputSchema},
  prompt: `You are a branding expert specializing in creating catchy and memorable brand names.
  Based on the following brand information, generate 5 creative and relevant brand name ideas.
  The names should be unique, easy to pronounce, and suitable for the target audience.

  Brand Information:
  - Industry: {{{industry}}}
  - Personality Keywords: {{{keywords}}}
  - Target Audience: {{{targetAudience}}}
  - Core Message: {{{coreMessage}}}
  - Competitors to avoid sounding like: {{{competitors}}}
  - Words/styles to avoid: {{{avoid}}}

  Please provide a diverse list of names.
`,
});

const generateBrandNamesFlow = ai.defineFlow(
  {
    name: 'generateBrandNamesFlow',
    inputSchema: GenerateBrandNamesInputSchema,
    outputSchema: GenerateBrandNamesOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate brand names.');
    }
    return output;
  }
);
