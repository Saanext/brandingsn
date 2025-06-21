'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateColorPalette, type GenerateColorPaletteOutput } from '@/ai/flows/generate-color-palette';
import { visualizeLogo, type VisualizeLogoOutput } from '@/ai/flows/visualize-logo';
import { previewWebsiteTheme, type PreviewWebsiteThemeOutput } from '@/ai/flows/preview-website-theme';
import { createSocialMediaMockup, type CreateSocialMediaMockupOutput } from '@/ai/flows/create-social-media-mockup';

import { BrandForm, type BrandFormValues } from '@/components/brand-form';
import { ColorPaletteDisplay } from '@/components/color-palette-display';
import { AssetPreview } from '@/components/asset-preview';
import { BrandIcon } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface BrandKit {
  palette: GenerateColorPaletteOutput;
  logo: VisualizeLogoOutput;
  theme: PreviewWebsiteThemeOutput;
  social: CreateSocialMediaMockupOutput;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const { toast } = useToast();

  const handleGenerate = async (data: BrandFormValues) => {
    setIsLoading(true);
    setError(null);
    setBrandKit(null);

    try {
      const paletteData = await generateColorPalette(data);

      if (!paletteData.colors || paletteData.colors.length < 5) {
        throw new Error('AI failed to generate a valid color palette.');
      }
      
      const [logoResult, themeResult] = await Promise.all([
        visualizeLogo({
          brandName: data.brandName,
          industry: data.industry,
          colorPalette: paletteData.colors,
        }),
        previewWebsiteTheme({
          brandName: data.brandName,
          primaryColor: paletteData.colors[0],
          backgroundColor: paletteData.colors[4], // Assuming the last color is suitable for background
          accentColor: paletteData.colors[1],
          headlineFont: 'Inter',
          bodyFont: 'Inter',
        }),
      ]);

      const socialResult = await createSocialMediaMockup({
        brandName: data.brandName,
        logoDataUri: logoResult.logoDataUri,
        primaryColor: paletteData.colors[0],
        accentColor: paletteData.colors[1],
      });

      setBrandKit({
        palette: paletteData,
        logo: logoResult,
        theme: themeResult,
        social: socialResult,
      });

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Generation failed: ${errorMessage}`);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with the AI generation. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const LoadingState = () => (
    <div className="mt-12 w-full max-w-7xl animate-pulse">
      <div className="text-center mb-12">
        <h2 className="font-headline text-4xl md:text-5xl">Generating your Brand Kit...</h2>
        <p className="text-muted-foreground font-body text-lg">The genie is hard at work. This may take a moment.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-full" />
          <div className="flex flex-col gap-4 pt-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        </div>
        <div className="lg:col-span-1 space-y-8">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-40 bg-card">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex items-center gap-4">
                <BrandIcon className="h-16 w-16 text-primary" />
                <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl tracking-tighter">
                  Brand Genie
                </h1>
              </div>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl font-body">
                Unleash your brand's potential. Generate a complete brand kit in seconds with the power of AI.
              </p>
            </div>
          </div>
        </section>

        <section id="generator" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6 flex flex-col items-center">
            <BrandForm onSubmit={handleGenerate} isLoading={isLoading} />

            {isLoading && <LoadingState />}
            
            {error && !isLoading && (
              <Alert variant="destructive" className="mt-8 max-w-2xl">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Generation Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {brandKit && !isLoading && (
              <div className="mt-12 w-full max-w-7xl animate-in fade-in duration-500">
                <div className="text-center mb-12">
                   <h2 className="font-headline text-4xl md:text-5xl">Your Brand Kit is Ready!</h2>
                   <p className="text-muted-foreground font-body text-lg">Here is the brand identity we've generated for you.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="lg:col-span-1 flex flex-col gap-8">
                     <ColorPaletteDisplay {...brandKit.palette} />
                     <AssetPreview
                        title="Social Media Mockup"
                        description="An example of your branding on social media."
                        src={brandKit.social.mockupDataUri}
                        fileName="social-media-mockup.png"
                      />
                  </div>
                  <div className="lg:col-span-1 flex flex-col gap-8">
                      <AssetPreview
                        title="Logo Visualization"
                        description="A sample logo concept with your brand colors."
                        src={brandKit.logo.logoDataUri}
                        fileName="logo.png"
                      />
                      <AssetPreview
                        title="Website Theme Preview"
                        description="A preview of a website hero section."
                        src={brandKit.theme.websiteThemePreview}
                        fileName="website-theme-preview.png"
                      />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Brand Genie. All rights reserved.</p>
      </footer>
    </div>
  );
}
