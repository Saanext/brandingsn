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
      competitors: z.string(),
      avoid: z.string(),
    })
    .describe('The initial brand information from the quiz.'),
});
export type GenerateBrandGuidelinesInput = z.infer<
  typeof GenerateBrandGuidelinesInputSchema
>;

const BrandVoiceSchema = z.object({
  summary: z.string().describe("A summary of the brand's overall voice and personality."),
  attributes: z.array(z.string()).length(4).describe("An array of 4 adjectives that describe the brand voice (e.g., 'Confident', 'Witty', 'Caring')."),
  dos: z.array(z.string()).min(3).describe("A list of 'Do' examples for writing in the brand voice."),
  donts: z.array(z.string()).min(3).describe("A list of 'Don't' examples for writing in the brand voice."),
  contextualTone: z.array(z.object({
    context: z.string().describe("The communication context (e.g., 'Social Media Post', 'Customer Support Email')."),
    tone: z.string().describe("The recommended tone for that specific context."),
  })).min(2).describe("Examples of how to adapt the tone for different contexts while maintaining the core voice."),
});


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
  brandVoice: BrandVoiceSchema.describe(
      "A detailed description of the brand's recommended tone and voice, including attributes, examples, and contextual advice."
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
  prompt: `You are a branding expert. Based on the provided brand information, generate a set of basic brand guidelines.

Brand Information:
- Brand Name: {{{brandName}}}
- Industry: {{{brandInfo.industry}}}
- Personality Keywords: {{{brandInfo.keywords}}}
- Target Audience: {{{brandInfo.targetAudience}}}
- Core Message: {{{brandInfo.coreMessage}}}
- Competitors: {{{brandInfo.competitors}}}
- Things to Avoid: {{{brandInfo.avoid}}}

Selected Assets:
- Color Palette Name: {{{palette.paletteName}}}
- Palette Description: {{{palette.description}}}
- Colors: {{{palette.colors}}}
- Headline Font: {{{fonts.headlineFont}}}
- Body Font: {{{fonts.bodyFont}}}

Generate the following guidelines:

1.  **Color Usage:** Briefly explain the role of the primary, accent, and background colors. Give simple advice on achieving good contrast.
2.  **Logo Usage:** Provide two or three simple, actionable rules for using the logo. For example: "Always leave a clear space around the logo." and "Don't stretch or distort the logo."
3.  **Typography Usage:** Describe the intended use for the headline font and the body font.
4.  **Brand Voice:** Create a comprehensive brand voice and tone harmonization guide. This guide should be structured to help maintain a consistent brand personality across all communications.
    - **Summary:** Write a 2-3 sentence summary describing the overall brand voice.
    - **Attributes:** Provide exactly 4 key adjectives that define the voice's character (e.g., 'Professional', 'Witty', 'Empathetic').
    - **Do's and Don'ts:** List at least 3 concrete "Do" examples and 3 "Don't" examples of the voice in action.
    - **Contextual Tone:** Provide at least 2 examples of how the tone should adapt for different contexts while maintaining the core voice (e.g., one for a social media post and one for a customer support email).
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
