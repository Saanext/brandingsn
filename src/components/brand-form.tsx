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
import { Factory, Palette, Users, Heart, Sparkles, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

const quizFormSchema = z.object({
  brandName: z.string().min(2, { message: 'Brand name must be at least 2 characters.' }),
  industry: z.string().min(3, { message: 'Please describe your industry.' }),
  keywords: z.string().min(3, { message: 'Please provide at least one keyword.' }),
  targetAudience: z.string().min(3, { message: 'Please describe your target audience.' }),
  coreMessage: z.string().min(3, { message: 'Please describe your core message.' }),
});

export type BrandFormValues = z.infer<typeof quizFormSchema>;

interface BrandFormProps {
  onSubmit: (data: BrandFormValues) => void;
  isLoading: boolean;
}

const quizSteps = [
  {
    field: "brandName",
    icon: Palette,
    title: "Step 1: Brand Name",
    description: "What's your brand's name? This will be the centerpiece of your new brand identity.",
    placeholder: "e.g., Nova Robotics"
  },
  {
    field: "industry",
    icon: Factory,
    title: "Step 2: Industry",
    description: "What industry is your brand in? This helps us understand your brand's context.",
    placeholder: "e.g., Sustainable consumer electronics, High-fashion apparel, Artisan coffee"
  },
  {
    field: "keywords",
    icon: Sparkles,
    title: "Step 3: Style & Personality",
    description: "List 3-5 keywords that describe your brand's desired feel.",
    placeholder: "e.g., Minimal, Modern, Playful, Luxurious, Rustic"
  },
  {
    field: "targetAudience",
    icon: Users,
    title: "Step 4: Target Audience",
    description: "Who are you trying to reach? A brief description helps tailor the visuals.",
    placeholder: "e.g., Young professionals, families, eco-conscious shoppers"
  },
  {
    field: "coreMessage",
    icon: Heart,
    title: "Step 5: Core Message",
    description: "What's the main idea or value you want to convey to your audience?",
    placeholder: "e.g., Connecting people, simplifying life, promoting sustainability"
  },
];

export function BrandForm({ onSubmit, isLoading }: BrandFormProps) {
  const [currentStep, setCurrentStep] = useState(0);

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

  const currentQuestion = quizSteps[currentStep];
  const Icon = currentQuestion.icon;

  return (
    <Card className="w-full max-w-2xl animate-in fade-in duration-500 border-2">
      <CardHeader>
        <Progress value={((currentStep + 1) / quizSteps.length) * 100} className="mb-4" />
        <CardTitle className="font-headline text-3xl">{currentQuestion.title}</CardTitle>
        <CardDescription>{currentQuestion.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="space-y-8">
            <div>
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
                      {currentStep === 0 ? (
                        <Input placeholder={currentQuestion.placeholder} {...field} />
                      ) : (
                        <Textarea placeholder={currentQuestion.placeholder} {...field} className="min-h-[100px]" />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between items-center pt-8">
              <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 0 || isLoading}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>

              {currentStep < quizSteps.length - 1 ? (
                 <Button type="button" onClick={handleNext} disabled={isLoading}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
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
