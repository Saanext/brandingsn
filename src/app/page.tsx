'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useToast } from '@/hooks/use-toast';
import { generateColorPalette, type GenerateColorPaletteOutput, type GenerateColorPaletteInput } from '@/ai/flows/generate-color-palette';
import { visualizeLogo, type VisualizeLogoOutput } from '@/ai/flows/visualize-logo';
import { previewWebsiteTheme, type PreviewWebsiteThemeOutput } from '@/ai/flows/preview-website-theme';
import { createSocialMediaMockup, type CreateSocialMediaMockupOutput } from '@/ai/flows/create-social-media-mockup';

import { BrandForm, type BrandFormValues } from '@/components/brand-form';
import { ColorPaletteDisplay } from '@/components/color-palette-display';
import { AssetPreview } from '@/components/asset-preview';
import { BrandIcon } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Terminal, Wand2, Palette, Paintbrush, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';


type Palette = GenerateColorPaletteOutput['palettes'][0];

interface BrandKit {
  palette: Palette;
  logo: VisualizeLogoOutput;
  theme: PreviewWebsiteThemeOutput;
  social: CreateSocialMediaMockupOutput;
}

const themeConfigSchema = z.object({
  primaryColor: z.string(),
  accentColor: z.string(),
  backgroundColor: z.string(),
  logoDescription: z.string().optional(),
});
type ThemeConfigFormValues = z.infer<typeof themeConfigSchema>;


function hexToHsl(H: string): string {
  let r = 0, g = 0, b = 0;
  if (H.length === 7) {
    r = parseInt(H.substring(1, 3), 16);
    g = parseInt(H.substring(3, 5), 16);
    b = parseInt(H.substring(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  return `${h} ${s}% ${l}%`;
}


const PaletteSelection = ({ palettes, onSelect }: { palettes: Palette[], onSelect: (palette: Palette) => void }) => (
  <div className="w-full max-w-7xl animate-in fade-in duration-500">
    <div className="text-center mb-12">
      <h2 className="font-headline text-4xl md:text-5xl">Choose Your Palette</h2>
      <p className="text-muted-foreground font-body text-lg">Select a color palette to apply to your brand.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {palettes.map((palette) => (
        <Card key={palette.paletteName} className="cursor-pointer hover:shadow-2xl hover:border-primary transition-all duration-300" onClick={() => onSelect(palette)}>
          <CardHeader>
            <CardTitle>{palette.paletteName}</CardTitle>
            <CardDescription>{palette.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {palette.colors.map(color => (
                <div key={color} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: color }} />
                  <span className="font-mono text-sm">{color}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const ThemeConfigForm = ({ palette, onSubmit, isLoading }: { palette: Palette, onSubmit: (data: ThemeConfigFormValues) => void, isLoading: boolean }) => {
  const form = useForm<ThemeConfigFormValues>({
    resolver: zodResolver(themeConfigSchema),
    defaultValues: {
      primaryColor: palette.colors[0],
      accentColor: palette.colors[1],
      backgroundColor: palette.colors[4],
      logoDescription: '',
    },
  });

  const ColorSelectField = ({ name, label }: { name: keyof ThemeConfigFormValues, label: string }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-sm border" style={{ backgroundColor: field.value }} />
                  <SelectValue />
                </div>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {palette.colors.map(color => (
                <SelectItem key={color} value={color}>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-sm border" style={{ backgroundColor: color }} />
                    {color}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
  
  return (
    <div className="w-full max-w-7xl mt-12 animate-in fade-in duration-500">
       <div className="text-center mb-12">
        <h2 className="font-headline text-4xl md:text-5xl">Fine-tune Your Assets</h2>
        <p className="text-muted-foreground font-body text-lg">Assign color roles and describe your ideal logo.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <ColorPaletteDisplay {...palette} />
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Configure Assets</CardTitle>
            <CardDescription>Specify how colors should be used in your brand assets.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ColorSelectField name="primaryColor" label="Primary Color" />
                  <ColorSelectField name="accentColor" label="Accent Color" />
                  <ColorSelectField name="backgroundColor" label="Background Color" />
                </div>
                <FormField
                  control={form.control}
                  name="logoDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., A minimalist line art logo, an abstract geometric shape..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full text-lg py-6 font-headline bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Conjuring Assets...
                    </>
                  ) : (
                    <>
                      Generate Final Assets <ArrowRight className="ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


export default function Home() {
  const [step, setStep] = useState(1); // 1: brand form, 2: palette select, 3: theme config, 4: results
  const [brandInfo, setBrandInfo] = useState<BrandFormValues | null>(null);
  const [palettes, setPalettes] = useState<Palette[] | null>(null);
  const [selectedPalette, setSelectedPalette] = useState<Palette | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const { toast } = useToast();

  const updateTheme = (p: Palette) => {
    if (typeof window !== 'undefined') {
      document.documentElement.style.setProperty('--primary', hexToHsl(p.colors[0]));
      document.documentElement.style.setProperty('--accent', hexToHsl(p.colors[1]));
      document.documentElement.style.setProperty('--background', hexToHsl(p.colors[4]));
    }
  };
  
  const handleGeneratePalettes = async (data: BrandFormValues) => {
    setIsLoading(true);
    setLoadingMessage('Generating color palettes...');
    setError(null);
    setBrandKit(null);
    setBrandInfo(data);

    try {
      const paletteData = await generateColorPalette(data);
      if (!paletteData.palettes || paletteData.palettes.length < 4) {
        throw new Error('AI failed to generate enough color palettes.');
      }
      setPalettes(paletteData.palettes);
      setStep(2);
    } catch (e) {
      handleError(e, 'palette generation');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectPalette = (palette: Palette) => {
    setSelectedPalette(palette);
    updateTheme(palette);
    setStep(3);
  };

  const handleGenerateAssets = async (config: ThemeConfigFormValues) => {
    if (!brandInfo || !selectedPalette) return;
    setIsLoading(true);
    setLoadingMessage('Generating your brand assets...');
    setError(null);

    try {
      const [logoResult, themeResult] = await Promise.all([
        visualizeLogo({
          ...brandInfo,
          colorPalette: selectedPalette.colors,
          logoDescription: config.logoDescription,
        }),
        previewWebsiteTheme({
          brandName: brandInfo.brandName,
          primaryColor: config.primaryColor,
          backgroundColor: config.backgroundColor,
          accentColor: config.accentColor,
          headlineFont: 'Inter',
          bodyFont: 'Inter',
        }),
      ]);

      const socialResult = await createSocialMediaMockup({
        brandName: brandInfo.brandName,
        logoDataUri: logoResult.logoDataUri,
        primaryColor: config.primaryColor,
        accentColor: config.accentColor,
      });

      setBrandKit({
        palette: selectedPalette,
        logo: logoResult,
        theme: themeResult,
        social: socialResult,
      });
      setStep(4);

    } catch (e) {
      handleError(e, 'asset generation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (e: any, stage: string) => {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    setError(`Generation failed during ${stage}: ${errorMessage}`);
    toast({
      variant: 'destructive',
      title: 'Uh oh! Something went wrong.',
      description: `There was a problem with the AI ${stage}. Please try again.`,
    });
  }

  const LoadingState = () => (
    <div className="mt-12 w-full max-w-4xl text-center animate-pulse">
      <h2 className="font-headline text-4xl md:text-5xl">{loadingMessage}</h2>
      <p className="text-muted-foreground font-body text-lg">The genie is hard at work. This may take a moment.</p>
      <Loader2 className="mx-auto mt-8 h-12 w-12 animate-spin text-primary" />
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
            
            {step === 1 && <BrandForm onSubmit={handleGeneratePalettes} isLoading={isLoading} />}
            {step === 2 && palettes && <PaletteSelection palettes={palettes} onSelect={handleSelectPalette} />}
            {step === 3 && selectedPalette && <ThemeConfigForm palette={selectedPalette} onSubmit={handleGenerateAssets} isLoading={isLoading} />}
            
            {isLoading && <LoadingState />}
            
            {error && !isLoading && (
              <Alert variant="destructive" className="mt-8 max-w-2xl">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Generation Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 4 && brandKit && !isLoading && (
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
                 <div className="text-center mt-12">
                   <Button onClick={() => {
                     setStep(1);
                     setBrandKit(null);
                     setPalettes(null);
                     setSelectedPalette(null);
                     setBrandInfo(null);
                   }}>Start Over</Button>
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
