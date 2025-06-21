'use server';
/**
 * @fileOverview Generates sample logo visualizations using a color palette.
 *
 * - visualizeLogo - A function that generates logo visualizations.
 * - VisualizeLogoInput - The input type for the visualizeLogo function.
 * - VisualizeLogoOutput - The return type for the visualizeLogo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisualizeLogoInputSchema = z.object({
  brandName: z.string().describe('The name of the brand.'),
  colorPalette: z.array(z.string()).describe('An array of hex color codes for the brand.'),
  industry: z.string().describe('The industry of the brand.'),
  logoDescription: z.string().describe('A short description of the logo style or concept.').optional(),
});
export type VisualizeLogoInput = z.infer<typeof VisualizeLogoInputSchema>;

const VisualizeLogoOutputSchema = z.object({
  logoDataUri: z
    .string()
    .describe(
      'A data URI containing the generated logo image, that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type VisualizeLogoOutput = z.infer<typeof VisualizeLogoOutputSchema>;

export async function visualizeLogo(input: VisualizeLogoInput): Promise<VisualizeLogoOutput> {
  return visualizeLogoFlow(input);
}

const visualizeLogoFlow = ai.defineFlow(
  {
    name: 'visualizeLogoFlow',
    inputSchema: VisualizeLogoInputSchema,
    outputSchema: VisualizeLogoOutputSchema,
  },
  async input => {
    const prompt = `Create a logo visualization for the brand "${input.brandName}" in the "${input.industry}" industry, using the following color palette: ${input.colorPalette.join(', ')}. ${input.logoDescription ? `The user described the logo concept as: "${input.logoDescription}".` : ''} The logo should be on a clean background, include the brand name, and reflect the brand's industry. Output the generated image as a data URI.`;

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: prompt,      
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('No logo was generated.');
    }

    return {logoDataUri: media.url};
  }
);
