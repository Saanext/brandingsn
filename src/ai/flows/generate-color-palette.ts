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
  industry: z.string().describe('The industry the brand operates in.'),
  keywords: z
    .string()
    .describe("Keywords that describe the brand's style and personality."),
  targetAudience: z.string().describe("The brand's target audience."),
  coreMessage: z.string().describe('The core message or values of the brand.'),
});
export type GenerateColorPaletteInput = z.infer<typeof GenerateColorPaletteInputSchema>;

const PaletteSchema = z.object({
  paletteName: z.string().describe('The name of the color palette.'),
  description: z.string().describe('A description of the color palette.'),
  colors: z
    .array(z.string().regex(/^#[0-9a-fA-F]{6}$/))
    .length(5)
    .describe('An array of 5 hex color codes that represent the color palette.'),
});

const GenerateColorPaletteOutputSchema = z.object({
  palettes: z
    .array(PaletteSchema)
    .length(4)
    .describe('An array of 4 distinct color palettes.'),
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

  Based on the brand information, generate 4 distinct and diverse color palettes. Each palette should explore a different mood or direction (e.g., one professional and serious, one vibrant and energetic, one calm and minimalist, one luxurious and elegant). Each palette must have exactly 5 colors.
  For each palette, provide a unique palette name, a short description, and an array of 5 hex color codes.

  Brand Name: {{{brandName}}}
  Industry: {{{industry}}}
  Keywords for Style & Personality: {{{keywords}}}
  Target Audience: {{{targetAudience}}}
  Core Message/Values: {{{coreMessage}}}

  Return the color palettes in the following JSON format:
  {
    "palettes": [
      {
        "paletteName": "Palette Name 1",
        "description": "Description of the first color palette",
        "colors": ["#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB"]
      },
      {
        "paletteName": "Palette Name 2",
        "description": "Description of the second color palette",
        "colors": ["#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB"]
      },
      {
        "paletteName": "Palette Name 3",
        "description": "Description of the third color palette",
        "colors": ["#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB"]
      },
      {
        "paletteName": "Palette Name 4",
        "description": "Description of the fourth color palette",
        "colors": ["#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB"]
      }
    ]
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
