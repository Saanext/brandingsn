// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Generates a color palette based on brand information provided by the user.
 *
 * - generateColorPalette - A function that generates a color palette.
 * - GenerateColorPaletteInput - The input type for the generateColorPalette function.
 * - GenerateColorPaletteOutput - The return type for the generateColorPalette function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateColorPaletteInputSchema = z.object({
  brandName: z.string().describe('The name of the brand.'),
  industry: z.string().describe('The industry of the brand.'),
  stylePreferences: z.string().describe('The style preferences for the brand.'),
  desiredMood: z.string().describe('The desired mood or feeling the brand should evoke.'),
});
export type GenerateColorPaletteInput = z.infer<typeof GenerateColorPaletteInputSchema>;

const GenerateColorPaletteOutputSchema = z.object({
  paletteName: z.string().describe('The name of the color palette.'),
  description: z.string().describe('A description of the color palette.'),
  colors: z
    .array(z.string())
    .describe('An array of hex color codes that represent the color palette.'),
});
export type GenerateColorPaletteOutput = z.infer<typeof GenerateColorPaletteOutputSchema>;

export async function generateColorPalette(input: GenerateColorPaletteInput): Promise<GenerateColorPaletteOutput> {
  return generateColorPaletteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateColorPalettePrompt',
  input: {schema: GenerateColorPaletteInputSchema},
  output: {schema: GenerateColorPaletteOutputSchema},
  prompt: `You are an expert branding consultant who specializes in color palette generation.

  Based on the brand information, generate a color palette with 5 colors that reflects the brand identity.
  Return the palette name, a description of the color palette and an array of hex color codes.

  Brand Name: {{{brandName}}}
  Industry: {{{industry}}}
  Style Preferences: {{{stylePreferences}}}
  Desired Mood: {{{desiredMood}}}

  Return the color palette in the following JSON format:
  {
    "paletteName": "Palette Name",
    "description": "Description of the color palette",
    "colors": ["#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB"]
  }
`,
});

const generateColorPaletteFlow = ai.defineFlow(
  {
    name: 'generateColorPaletteFlow',
    inputSchema: GenerateColorPaletteInputSchema,
    outputSchema: GenerateColorPaletteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
