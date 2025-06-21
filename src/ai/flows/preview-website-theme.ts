// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview Generates a preview of a website theme (hero section, buttons, typography) using the generated brand colors.
 *
 * - previewWebsiteTheme - A function that handles the website theme preview generation.
 * - PreviewWebsiteThemeInput - The input type for the previewWebsiteTheme function.
 * - PreviewWebsiteThemeOutput - The return type for the previewWebsiteTheme function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PreviewWebsiteThemeInputSchema = z.object({
  brandName: z.string().describe('The name of the brand.'),
  primaryColor: z.string().describe('The primary color of the brand.'),
  backgroundColor: z.string().describe('The background color of the brand.'),
  accentColor: z.string().describe('The accent color of the brand.'),
  headlineFont: z.string().describe('The font for headlines.'),
  bodyFont: z.string().describe('The font for body text.'),
});
export type PreviewWebsiteThemeInput = z.infer<
  typeof PreviewWebsiteThemeInputSchema
>;

const PreviewWebsiteThemeOutputSchema = z.object({
  websiteThemePreview: z
    .string()
    .describe(
      'A preview of a website theme (hero section, buttons, typography) as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // as a data URI'
    ),
});
export type PreviewWebsiteThemeOutput = z.infer<
  typeof PreviewWebsiteThemeOutputSchema
>;

export async function previewWebsiteTheme(
  input: PreviewWebsiteThemeInput
): Promise<PreviewWebsiteThemeOutput> {
  return previewWebsiteThemeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'previewWebsiteThemePrompt',
  input: {schema: PreviewWebsiteThemeInputSchema},
  output: {schema: PreviewWebsiteThemeOutputSchema},
  prompt: `You are a creative web designer who specializes in generating previews for website themes.

  Based on the brand information provided, generate a preview of a website theme, including the hero section, buttons, and typography, using the specified brand colors.

  Brand Name: {{{brandName}}}
  Primary Color: {{{primaryColor}}}
  Background Color: {{{backgroundColor}}}
  Accent Color: {{{accentColor}}}
  Headline Font: {{{headlineFont}}}
  Body Font: {{{bodyFont}}}

  Create a website theme preview using these colors and fonts, and provide the result as a single image.  It should have a clean and modern design.

  {{media url=websiteThemePreview}}
  `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const previewWebsiteThemeFlow = ai.defineFlow(
  {
    name: 'previewWebsiteThemeFlow',
    inputSchema: PreviewWebsiteThemeInputSchema,
    outputSchema: PreviewWebsiteThemeOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {
          text: `Create a website theme preview for ${input.brandName} using ${input.primaryColor} (primary), ${input.backgroundColor} (background), ${input.accentColor} (accent), ${input.headlineFont} (headline font), and ${input.bodyFont} (body font).`,
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    return {websiteThemePreview: media!.url!};
  }
);
