'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useToast } from '@/hooks/use-toast';
import { generateColorPalette, type GenerateColorPaletteOutput, type GenerateColorPaletteInput } from '@/ai/flows/generate-color-palette';
import { visualizeLogo, type VisualizeLogoOutput } from '@/ai/flows/visualize-logo';
import { createBusinessCardMockup, type CreateBusinessCardMockupOutput } from '@/ai/flows/create-business-card-mockup';
import { createSocialMediaMockup, type CreateSocialMediaMockupOutput } from '@/ai/flows/create-social-media-mockup';
import { generateBrandGuidelines, type GenerateBrandGuidelinesOutput } from '@/ai/flows/generate-brand-guidelines';
import { generateBrandNames } from '@/ai/flows/generate-brand-names';
import { previewWebsiteTheme, type PreviewWebsiteThemeOutput } from '@/ai/flows/preview-website-theme';


import { BrandForm, type BrandFormValues } from '@/components/brand-form';
import { ColorPaletteDisplay } from '@/components/color-palette-display';
import { AssetPreview } from '@/components/asset-preview';
import { BrandGuidelinesDisplay } from '@/components/brand-guidelines-display';
import { BrandIcon } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Terminal, Wand2, Palette, Paintbrush, Loader2, ArrowRight, ArrowLeft, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BackgroundAnimation } from '@/components/background-animation';


type Palette = GenerateColorPaletteOutput['palettes'][0];

interface BrandKit {
  palette: Palette;
  logo: VisualizeLogoOutput;
  businessCard: CreateBusinessCardMockupOutput;
  social: CreateSocialMediaMockupOutput;
  guidelines: GenerateBrandGuidelinesOutput;
}

const fontOptions = [
  { value: 'inter', label: 'Inter' },
  { value: 'playfair', label: 'Playfair Display' },
  { value: 'oswald', label: 'Oswald' },
  { value: 'lato', label: 'Lato' },
];

const themeConfigSchema = z.object({
  primaryColor: z.string(),
  accentColor: z.string(),
  backgroundColor: z.string(),
  headlineFont: z.string(),
  bodyFont: z.string(),
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


const PaletteSelection = ({ palettes, onSelect, onBack }: { palettes: Palette[], onSelect: (palette: Palette) => void, onBack: () => void }) => (
  <div className="w-full max-w-7xl animate-in fade-in duration-500">
    <div className="text-center mb-12">
      <h2 className="font-headline text-3xl md:text-5xl">Choose Your Color Story</h2>
      <p className="text-muted-foreground font-body md:text-lg max-w-3xl mx-auto">Your brand profile has inspired these unique color palettes. Select one to continue building your brand identity.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {palettes.map((palette) => (
        <Card key={palette.paletteName} className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-hidden bg-card/80 backdrop-blur-sm" onClick={() => onSelect(palette)}>
          <CardContent className="p-0">
            <div className="h-40 w-full overflow-hidden">
              <div className="flex h-full w-full transition-transform duration-300 ease-in-out group-hover:scale-105">
                <div className="w-3/5" style={{ backgroundColor: palette.colors[0] }} />
                <div className="w-2/5 grid grid-cols-2 grid-rows-2">
                  <div style={{ backgroundColor: palette.colors[1] }} />
                  <div style={{ backgroundColor: palette.colors[2] }} />
                  <div style={{ backgroundColor: palette.colors[3] }} />
                  <div style={{ backgroundColor: palette.colors[4] }} />
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-headline text-2xl mb-2">{palette.paletteName}</h3>
              <p className="text-muted-foreground font-body">{palette.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
     <div className="text-center mt-12">
       <Button variant="outline" onClick={onBack}>
         <ArrowLeft className="mr-2 h-4 w-4" /> Back to Brand Details
      </Button>
    </div>
  </div>
);


const ThemeConfigForm = ({ palette, onSubmit, isLoading, onBack, onPreview, isPreviewing, websitePreview }: { 
  palette: Palette, 
  onSubmit: (data: ThemeConfigFormValues) => void, 
  isLoading: boolean, 
  onBack: () => void,
  onPreview: (data: ThemeConfigFormValues) => void,
  isPreviewing: boolean,
  websitePreview: PreviewWebsiteThemeOutput | null 
}) => {
  const form = useForm<ThemeConfigFormValues>({
    resolver: zodResolver(themeConfigSchema),
  });

  useEffect(() => {
    form.reset({
      primaryColor: palette.colors[0],
      accentColor: palette.colors[1],
      backgroundColor: palette.colors[4],
      headlineFont: 'inter',
      bodyFont: 'inter',
    });
  }, [palette, form]);
  
  const primaryColor = form.watch('primaryColor');
  const accentColor = form.watch('accentColor');
  const backgroundColor = form.watch('backgroundColor');
  const headlineFont = form.watch('headlineFont');
  const bodyFont = form.watch('bodyFont');

  useEffect(() => {
    if (primaryColor) {
      document.documentElement.style.setProperty('--primary', hexToHsl(primaryColor));
    }
    if (accentColor) {
      document.documentElement.style.setProperty('--accent', hexToHsl(accentColor));
    }
    if (headlineFont) {
      document.documentElement.style.setProperty('--font-headline', `var(--font-${headlineFont})`);
    }
    if (bodyFont) {
      document.documentElement.style.setProperty('--font-body', `var(--font-${bodyFont})`);
    }
  }, [primaryColor, accentColor, headlineFont, bodyFont]);


  const ColorSelectField = ({ name, label }: { name: keyof ThemeConfigFormValues, label: string }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
  
  const FontSelectField = ({ name, label }: { name: keyof ThemeConfigFormValues, label: string }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
            <FormControl>
              <SelectTrigger className={cn(
                field.value === 'playfair' && 'font-playfair',
                field.value === 'oswald' && 'font-oswald',
                field.value === 'lato' && 'font-lato',
                field.value === 'inter' && 'font-inter',
              )}>
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {fontOptions.map(font => (
                <SelectItem key={font.value} value={font.value} className={cn(
                  font.value === 'playfair' && 'font-playfair',
                  font.value === 'oswald' && 'font-oswald',
                  font.value === 'lato' && 'font-lato',
                  font.value === 'inter' && 'font-inter',
                )}>
                  {font.label}
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
        <h2 className="font-headline text-3xl md:text-5xl">Fine-tune Your Assets</h2>
        <p className="text-muted-foreground font-body md:text-lg max-w-3xl mx-auto">Assign color roles and choose fonts. Preview your website theme in real-time before generating the final assets.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
            <ColorPaletteDisplay {...palette} />
            {isPreviewing && (
                <Card className="flex items-center justify-center aspect-video bg-card/80 backdrop-blur-sm animate-pulse">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </Card>
            )}
            {websitePreview && !isPreviewing && (
                <AssetPreview
                    title="Website Theme Preview"
                    description="A sample hero section to preview your theme."
                    src={websitePreview.websiteThemePreview}
                    fileName="website-preview.png"
                />
            )}
        </div>
        <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-headline text-2xl md:text-3xl">Configure Assets</CardTitle>
            <CardDescription>Specify how colors and fonts should be used.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-4">
                  <p className="text-sm font-medium">Color Roles</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ColorSelectField name="primaryColor" label="Primary Color" />
                    <ColorSelectField name="accentColor" label="Accent Color" />
                    <ColorSelectField name="backgroundColor" label="Background Color" />
                  </div>
                </div>
                 <div className="space-y-4">
                  <p className="text-sm font-medium">Typography</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FontSelectField name="headlineFont" label="Headline Font" />
                    <FontSelectField name="bodyFont" label="Body Font" />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-8">
                   <Button type="button" variant="outline" onClick={onBack} disabled={isLoading || isPreviewing}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Palettes
                  </Button>
                  <div className="flex items-center gap-4">
                    <Button type="button" variant="secondary" onClick={() => onPreview(form.getValues())} disabled={isLoading || isPreviewing}>
                        {isPreviewing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Previewing...
                            </>
                        ) : (
                            <>
                                <Eye className="mr-2 h-4 w-4" /> Preview Theme
                            </>
                        )}
                    </Button>
                    <Button type="submit" disabled={isLoading || isPreviewing} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          Generate Assets <ArrowRight className="ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
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
  const [websitePreview, setWebsitePreview] = useState<PreviewWebsiteThemeOutput | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const { toast } = useToast();

  const handleGeneratePalettes = async (data: BrandFormValues) => {
    setIsLoading(true);
    setLoadingMessage('Generating color palettes...');
    setError(null);
    setBrandKit(null);
    setBrandInfo(data);

    try {
      const paletteData = await generateColorPalette(data);
      if (!paletteData.palettes || paletteData.palettes.length < 6) {
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
    setStep(3);
  };

  const handlePreviewWebsite = async (config: ThemeConfigFormValues) => {
    if (!brandInfo) return;

    setIsPreviewing(true);
    setWebsitePreview(null);
    setError(null);

    const headlineFontLabel = fontOptions.find(f => f.value === config.headlineFont)?.label || 'Inter';
    const bodyFontLabel = fontOptions.find(f => f.value === config.bodyFont)?.label || 'Inter';

    try {
      const result = await previewWebsiteTheme({
        brandName: brandInfo.brandName,
        primaryColor: config.primaryColor,
        backgroundColor: config.backgroundColor,
        accentColor: config.accentColor,
        headlineFont: headlineFontLabel,
        bodyFont: bodyFontLabel,
      });
      setWebsitePreview(result);
    } catch (e) {
      handleError(e, 'website preview generation');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleGenerateAssets = async (config: ThemeConfigFormValues) => {
    if (!brandInfo || !selectedPalette) return;
    setIsLoading(true);
    setLoadingMessage('Generating your brand assets...');
    setError(null);

    try {
      const headlineFontLabel = fontOptions.find(f => f.value === config.headlineFont)?.label || 'Inter';
      const bodyFontLabel = fontOptions.find(f => f.value === config.bodyFont)?.label || 'Inter';

      const logoResult = await visualizeLogo({
        brandName: brandInfo.brandName,
        industry: brandInfo.industry,
        colorPalette: selectedPalette.colors,
        keywords: brandInfo.keywords,
        competitors: brandInfo.competitors,
        avoid: brandInfo.avoid,
      });

      const [socialResult, businessCardResult, guidelinesResult] = await Promise.all([
        createSocialMediaMockup({
          brandName: brandInfo.brandName,
          logoDataUri: logoResult.logoDataUri,
          primaryColor: config.primaryColor,
          accentColor: config.accentColor,
        }),
        createBusinessCardMockup({
          brandName: brandInfo.brandName,
          logoDataUri: logoResult.logoDataUri,
          primaryColor: config.primaryColor,
          backgroundColor: config.backgroundColor,
          accentColor: config.accentColor,
          headlineFont: headlineFontLabel,
          bodyFont: bodyFontLabel,
        }),
        generateBrandGuidelines({
            brandName: brandInfo.brandName,
            palette: selectedPalette,
            fonts: {
                headlineFont: headlineFontLabel,
                bodyFont: bodyFontLabel,
            },
            brandInfo: {
                industry: brandInfo.industry,
                keywords: brandInfo.keywords,
                targetAudience: brandInfo.targetAudience,
                coreMessage: brandInfo.coreMessage,
                competitors: brandInfo.competitors,
                avoid: brandInfo.avoid,
            }
        })
      ]);

      setBrandKit({
        palette: selectedPalette,
        logo: logoResult,
        social: socialResult,
        businessCard: businessCardResult,
        guidelines: guidelinesResult,
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

  const handleReset = () => {
    setStep(1);
    setBrandKit(null);
    setPalettes(null);
    setSelectedPalette(null);
    setBrandInfo(null);
    setWebsitePreview(null);
    // Reset styles to default dark theme
    document.documentElement.style.setProperty('--primary', '0 0% 98%');
    document.documentElement.style.setProperty('--accent', '0 0% 98%');
    document.documentElement.style.setProperty('--font-headline', 'var(--font-inter)');
    document.documentElement.style.setProperty('--font-body', 'var(--font-inter)');
  };

  const LoadingState = () => (
    <div className="mt-12 w-full max-w-4xl text-center animate-pulse">
      <h2 className="font-headline text-3xl md:text-5xl">{loadingMessage}</h2>
      <p className="text-muted-foreground font-body text-lg">Please wait a moment.</p>
      <Loader2 className="mx-auto mt-8 h-12 w-12 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
       <BackgroundAnimation />
       <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <a href="#" className="flex items-center space-x-2">
              <BrandIcon className="h-6 w-6" />
              <span className="inline-block font-bold">Brand Genie</span>
            </a>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-20 lg:py-28">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex items-center gap-2 md:gap-4">
                <BrandIcon className="h-12 w-12 md:h-16 md:w-16 text-primary" />
                <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl tracking-tight">
                  Brand Genie
                </h1>
              </div>
              <p className="mx-auto max-w-[700px] text-muted-foreground text-base md:text-xl font-body pt-2">
                Struggling with a name? Our AI can generate creative and relevant brand name ideas. Our assistant will then guide you through a quick quiz to generate a complete brand kit.
              </p>
            </div>

            <div id="generator" className="mt-16 flex flex-col items-center">
              {step === 1 && <BrandForm onSubmit={handleGeneratePalettes} isLoading={isLoading} />}
              {step === 2 && palettes && <PaletteSelection palettes={palettes} onSelect={handleSelectPalette} onBack={() => setStep(1)} />}
              {step === 3 && selectedPalette && <ThemeConfigForm 
                  palette={selectedPalette} 
                  onSubmit={handleGenerateAssets} 
                  isLoading={isLoading} 
                  onBack={() => {
                    setStep(2);
                    setWebsitePreview(null);
                  }}
                  onPreview={handlePreviewWebsite}
                  isPreviewing={isPreviewing}
                  websitePreview={websitePreview}
                />}

              {isLoading && <LoadingState />}

              {error && !isLoading && (
                <Alert variant="destructive" className="mt-8 max-w-2xl bg-destructive/20 backdrop-blur-sm">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Generation Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {step === 4 && brandKit && !isLoading && (
                <div className="mt-12 w-full max-w-7xl animate-in fade-in duration-500">
                  <div className="text-center mb-12">
                     <h2 className="font-headline text-3xl md:text-5xl">Your Brand Kit is Ready!</h2>
                     <p className="text-muted-foreground font-body md:text-lg max-w-3xl mx-auto">Congratulations on your new brand! Your complete brand kit is ready. Download each asset and start building your identity.</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="lg:col-span-1 flex flex-col gap-8">
                       <BrandGuidelinesDisplay guidelines={brandKit.guidelines} />
                       <AssetPreview
                          title="Business Card Mockup"
                          description="A professional business card design, ready for print. Download the design to send to a printer."
                          src={brandKit.businessCard.mockupDataUri}
                          fileName="business-card-mockup.png"
                        />
                    </div>
                    <div className="lg:col-span-1 flex flex-col gap-8">
                        <AssetPreview
                          title="Logo Visualization"
                          description="A unique logo concept generated for your brand. Download and use it as your official logo."
                          src={brandKit.logo.logoDataUri}
                          fileName="logo.png"
                        />
                        <AssetPreview
                          title="Social Media Mockup"
                          description="An example post to show how your brand looks on social media. Download it for inspiration."
                          src={brandKit.social.mockupDataUri}
                          fileName="social-media-mockup.png"
                        />
                    </div>
                  </div>
                   <div className="text-center mt-12 flex flex-col sm:flex-row justify-center gap-4">
                      <Button variant="outline" onClick={() => setStep(3)} className="w-full sm:w-auto">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Config
                      </Button>
                      <Button className="w-full sm:w-auto" onClick={handleReset}>
                        Start Over
                      </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Brand Genie. All rights reserved.</p>
          <nav className="ml-auto flex gap-4 sm:gap-6">
             <a href="#" className="text-xs hover:underline underline-offset-4">Terms of Service</a>
             <a href="#" className="text-xs hover:underline underline-offset-4">Privacy</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
