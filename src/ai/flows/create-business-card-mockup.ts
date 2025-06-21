'use server';
/**
 * @fileOverview Generates a business card mockup.
 *
 * - createBusinessCardMockup - A function that handles the business card mockup generation process.
 * - CreateBusinessCardMockupInput - The input type for the createBusinessCardMockup function.
 * - CreateBusinessCardMockupOutput - The return type for the createBusinessCardMockup function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateBusinessCardMockupInputSchema = z.object({
  brandName: z.string().describe('The name of the brand.'),
  logoDataUri: z
    .string()
    .describe(
      "A logo image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  primaryColor: z.string().describe('The primary color of the brand (hex code).'),
  accentColor: z.string().describe('The accent color of the brand (hex code).'),
  backgroundColor: z.string().describe('The background color of the brand (hex code).'),
  headlineFont: z.string().describe('The font for headlines.'),
  bodyFont: z.string().describe('The font for body text.'),
});
export type CreateBusinessCardMockupInput = z.infer<typeof CreateBusinessCardMockupInputSchema>;

const CreateBusinessCardMockupOutputSchema = z.object({
  mockupDataUri: z
    .string()
    .describe(
      'A business card mockup image as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type CreateBusinessCardMockupOutput = z.infer<typeof CreateBusinessCardMockupOutputSchema>;

export async function createBusinessCardMockup(
  input: CreateBusinessCardMockupInput
): Promise<CreateBusinessCardMockupOutput> {
  return createBusinessCardMockupFlow(input);
}

const createBusinessCardMockupFlow = ai.defineFlow(
  {
    name: 'createBusinessCardMockupFlow',
    inputSchema: CreateBusinessCardMockupInputSchema,
    outputSchema: CreateBusinessCardMockupOutputSchema,
  },
  async (input) => {
    const prompt = `Create a mockup of a professional, modern business card for the brand "${input.brandName}".
    The business card should feature the provided logo.
    It should also include placeholder contact information:
    - Name: Jane Doe
    - Title: Creative Director
    - Phone: (555) 123-4567
    - Email: jane.doe@${input.brandName.toLowerCase().replace(/\s+/g, '')}.com
    - Website: www.${input.brandName.toLowerCase().replace(/\s+/g, '')}.com

    Use the following brand guidelines:
    - Primary Color: ${input.primaryColor}
    - Accent Color: ${input.accentColor}
    - Background Color: ${input.backgroundColor}
    - Headline Font: ${input.headlineFont} (for the name and title)
    - Body Font: ${input.bodyFont} (for contact details)

    The design should be clean, professional, and visually appealing. Ensure good contrast and readability. Output the generated image as a data URI.`;

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {media: {url: input.logoDataUri}},
        {text: prompt},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('No business card mockup was generated');
    }

    return {mockupDataUri: media.url};
  }
);
