'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { Factory, Palette, Users, Heart, Sparkles, Loader2, ArrowRight, ArrowLeft, Wand2, Tag } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateBrandNames } from '@/ai/flows/generate-brand-names';

const quizFormSchema = z.object({
  brandName: z.string().min(2, { message: 'Brand name must be at least 2 characters.' }),
  industry: z.string().min(3, { message: 'Please describe your industry.' }),
  keywords: z.string().min(1, { message: 'Please select a personality.' }),
  targetAudience: z.string().min(3, { message: 'Please describe your target audience.' }),
  coreMessage: z.string().min(3, { message: 'Please describe your core message.' }),
});

export type BrandFormValues = z.infer<typeof quizFormSchema>;

interface BrandFormProps {
  onSubmit: (data: BrandFormValues) => void;
  isLoading: boolean;
}

const personalityOptions = [
  'Elegant & Sophisticated',
  'Bold & Energetic',
  'Minimal & Modern',
  'Playful & Creative',
  'Trustworthy & Professional',
  'Friendly & Accessible',
  'Natural & Grounded',
  'Innovative & Tech-Forward',
];

const quizSteps = [
  {
    field: "industry",
    icon: Factory,
    title: "Step 1: What industry are you in?",
    description: "This helps us understand your brand's context and competition.",
    placeholder: "e.g., Sustainable consumer electronics, High-fashion apparel, Artisan coffee"
  },
  {
    field: "keywords",
    icon: Sparkles,
    title: "Step 2: Define Your Brand's Style",
    description: "Select the keyword that best captures the essence and personality you're aiming for.",
    placeholder: "Select a brand style"
  },
  {
    field: "targetAudience",
    icon: Users,
    title: "Step 3: Who is your ideal customer?",
    description: "A brief description helps tailor the visuals to the right people.",
    placeholder: "e.g., Young professionals, families, eco-conscious shoppers"
  },
  {
    field: "coreMessage",
    icon: Heart,
    title: "Step 4: What are your brand's core values?",
    description: "What is the main idea or mission you want to convey to your audience?",
    placeholder: "e.g., Connecting people, simplifying life, promoting sustainability"
  },
    {
    field: "brandName",
    icon: Palette,
    title: "Step 5: What's your brand's name?",
    description: "This will be the centerpiece of your new brand identity. Struggling? We can help suggest some names!",
    placeholder: "e.g., Nova Robotics"
  },
];

export function BrandForm({ onSubmit, isLoading }: BrandFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      brandName: '',
      industry: '',
      keywords: '',
      targetAudience: '',
      coreMessage: '',
    },
    mode: 'onTouched',
  });

  const handleNext = async () => {
    const fieldToValidate = quizSteps[currentStep].field as keyof BrandFormValues;
    const isValid = await form.trigger(fieldToValidate);

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };
  
  const handleFinalSubmit = (data: BrandFormValues) => {
    onSubmit(data);
  };

  const handleSuggestNames = async () => {
    const values = form.getValues();
    const { industry, keywords, targetAudience, coreMessage } = values;

    setIsSuggesting(true);
    setNameSuggestions([]);
    try {
        const result = await generateBrandNames({
            industry,
            keywords,
            targetAudience,
            coreMessage
        });
        setNameSuggestions(result.names);
    } catch (error) {
        console.error("Failed to suggest names:", error);
    } finally {
        setIsSuggesting(false);
    }
  };

  const currentQuestion = quizSteps[currentStep];
  const Icon = currentQuestion.icon;

  return (
    <Card className="w-full max-w-2xl animate-in fade-in duration-500 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <Progress value={((currentStep + 1) / quizSteps.length) * 100} className="mb-4" />
        <CardTitle className="font-headline text-2xl md:text-3xl">{currentQuestion.title}</CardTitle>
        <CardDescription>{currentQuestion.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="space-y-8">
            <div key={currentQuestion.field}>
              <FormField
                control={form.control}
                name={currentQuestion.field as keyof BrandFormValues}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-muted-foreground">
                      <Icon className="h-4 w-4" /> 
                      Your Answer
                    </FormLabel>
                    <FormControl>
                      {currentQuestion.field === 'brandName' ? (
                        <Input placeholder={currentQuestion.placeholder} {...field} />
                      ) : currentQuestion.field === 'keywords' ? (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={currentQuestion.placeholder} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {personalityOptions.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Textarea placeholder={currentQuestion.placeholder} {...field} className="min-h-[100px]" />
                      )}
                    </FormControl>
                    {currentQuestion.field === 'brandName' && (
                      <div className="space-y-4 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSuggestNames}
                          disabled={isSuggesting}
                          className="w-full sm:w-auto"
                        >
                          {isSuggesting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                          )}
                          Suggest Names
                        </Button>
                        {nameSuggestions.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Here are a few suggestions:</p>
                            <div className="flex flex-wrap gap-2">
                              {nameSuggestions.map((name) => (
                                <Button
                                  key={name}
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => form.setValue('brandName', name, { shouldValidate: true })}
                                >
                                  {name}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center pt-8 gap-4">
              <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 0 || isLoading} className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>

              {currentStep < quizSteps.length - 1 ? (
                 <Button type="button" onClick={handleNext} disabled={isLoading} className="w-full sm:w-auto">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Conjuring...
                    </>
                  ) : (
                    'Generate Color Palettes'
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
