'use server';
/**
 * @fileOverview Generates a social media post mockup showcasing the brand colors and logo.
 *
 * - createSocialMediaMockup - A function that handles the social media mockup generation process.
 * - CreateSocialMediaMockupInput - The input type for the createSocialMediaMockup function.
 * - CreateSocialMediaMockupOutput - The return type for the createSocialMediaMockup function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateSocialMediaMockupInputSchema = z.object({
  brandName: z.string().describe('The name of the brand.'),
  logoDataUri: z
    .string()
    .describe(
      'A logo image as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  primaryColor: z.string().describe('The primary color of the brand (hex code).'),
  accentColor: z.string().describe('The accent color of the brand (hex code).'),
});
export type CreateSocialMediaMockupInput = z.infer<typeof CreateSocialMediaMockupInputSchema>;

const CreateSocialMediaMockupOutputSchema = z.object({
  mockupDataUri: z
    .string()
    .describe(
      'A social media mockup image as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type CreateSocialMediaMockupOutput = z.infer<typeof CreateSocialMediaMockupOutputSchema>;

export async function createSocialMediaMockup(
  input: CreateSocialMediaMockupInput
): Promise<CreateSocialMediaMockupOutput> {
  return createSocialMediaMockupFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createSocialMediaMockupPrompt',
  input: {schema: CreateSocialMediaMockupInputSchema},
  output: {schema: CreateSocialMediaMockupOutputSchema},
  prompt: `You are a social media marketing expert. Create a mockup of a social media post (Instagram or Facebook) showcasing the brand colors and logo.

Brand Name: {{{brandName}}}
Primary Color: {{{primaryColor}}}
Accent Color: {{{accentColor}}}
Logo: {{media url=logoDataUri}}

Make sure the mockup highlights the brand colors and incorporates the logo in a visually appealing way. The mockup should look professional and engaging.
Return the social media mockup as a data URI.
`,
});

const createSocialMediaMockupFlow = ai.defineFlow(
  {
    name: 'createSocialMediaMockupFlow',
    inputSchema: CreateSocialMediaMockupInputSchema,
    outputSchema: CreateSocialMediaMockupOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      // IMPORTANT: ONLY the googleai/gemini-2.0-flash-preview-image-generation model is able to generate images. You MUST use exactly this model to generate images.
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {media: {url: input.logoDataUri}},
        {
          text: `Create a mockup of a social media post (Instagram or Facebook) showcasing the brand colors and logo for ${input.brandName}. Use primary color ${input.primaryColor} and accent color ${input.accentColor}.`,
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
      },
    });

    if (!media || !media.url) {
      throw new Error('No mockup was generated');
    }

    return {mockupDataUri: media.url};
  }
);
