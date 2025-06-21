'use server';
/**
 * @fileOverview Generates basic brand guidelines.
 *
 * - generateBrandGuidelines - A function that handles the brand guidelines generation process.
 * - GenerateBrandGuidelinesInput - The input type for the generateBrandGuidelines function.
 * - GenerateBrandGuidelinesOutput - The return type for the generateBrandGuidelines function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBrandGuidelinesInputSchema = z.object({
  brandName: z.string().describe('The name of the brand.'),
  palette: z
    .object({
      paletteName: z.string(),
      description: z.string(),
      colors: z.array(z.string()),
    })
    .describe('The selected color palette.'),
  fonts: z
    .object({
      headlineFont: z.string().describe('The font for headlines.'),
      bodyFont: z.string().describe('The font for body text.'),
    })
    .describe('The selected fonts.'),
  brandInfo: z
    .object({
      industry: z.string(),
      keywords: z.string(),
      targetAudience: z.string(),
      coreMessage: z.string(),
    })
    .describe('The initial brand information from the quiz.'),
});
export type GenerateBrandGuidelinesInput = z.infer<
  typeof GenerateBrandGuidelinesInputSchema
>;

const GenerateBrandGuidelinesOutputSchema = z.object({
  colorUsage: z
    .string()
    .describe(
      "Guidelines for using the brand's primary, accent, and background colors."
    ),
  logoUsage: z
    .string()
    .describe(
      'Simple rules for applying the logo, like clear space and minimum size.'
    ),
  typographyUsage: z
    .string()
    .describe(
      'Details on how and when to use the headline and body fonts.'
    ),
  brandVoice: z
    .string()
    .describe(
      "A short description of the brand's recommended tone and voice."
    ),
});
export type GenerateBrandGuidelinesOutput = z.infer<
  typeof GenerateBrandGuidelinesOutputSchema
>;

export async function generateBrandGuidelines(
  input: GenerateBrandGuidelinesInput
): Promise<GenerateBrandGuidelinesOutput> {
  return generateBrandGuidelinesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBrandGuidelinesPrompt',
  input: {schema: GenerateBrandGuidelinesInputSchema},
  output: {schema: GenerateBrandGuidelinesOutputSchema},
  prompt: `You are a branding expert. Based on the provided brand information, generate a set of basic brand guidelines. Keep the guidelines concise, clear, and easy to understand for a non-designer.

Brand Information:
- Brand Name: {{{brandName}}}
- Industry: {{{brandInfo.industry}}}
- Personality Keywords: {{{brandInfo.keywords}}}
- Target Audience: {{{brandInfo.targetAudience}}}
- Core Message: {{{brandInfo.coreMessage}}}

Selected Assets:
- Color Palette Name: {{{palette.paletteName}}}
- Palette Description: {{{palette.description}}}
- Colors: {{{palette.colors}}}
- Headline Font: {{{fonts.headlineFont}}}
- Body Font: {{{fonts.bodyFont}}}

Generate the following guidelines:

1.  **Color Usage:** Briefly explain the role of the primary, accent, and background colors selected by the user. Give simple advice on achieving good contrast.
2.  **Logo Usage:** Provide two or three simple, actionable rules for using the logo. For example: "Always leave a clear space around the logo, at least the height of the main letterform." and "Don't stretch or distort the logo."
3.  **Typography Usage:** Describe the intended use for the headline font (e.g., for major titles and impact) and the body font (e.g., for paragraphs and longer text to ensure readability).
4.  **Brand Voice:** Based on the brand information, write 2-3 sentences describing the recommended tone of voice for brand communications (e.g., "professional and trustworthy," "playful and energetic," "calm and reassuring").
`,
});

const generateBrandGuidelinesFlow = ai.defineFlow(
  {
    name: 'generateBrandGuidelinesFlow',
    inputSchema: GenerateBrandGuidelinesInputSchema,
    outputSchema: GenerateBrandGuidelinesOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate brand guidelines.');
    }
    return output;
  }
);
