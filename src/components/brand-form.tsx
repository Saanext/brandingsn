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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Factory, Palette, Smile, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

// This is the output type, which remains consistent for the parent component.
const formSchema = z.object({
  brandName: z.string().min(2, { message: 'Brand name must be at least 2 characters.' }),
  industry: z.string().min(3, { message: 'Industry is required.' }),
  stylePreferences: z.string().min(3, { message: 'Style preferences are required.' }),
  desiredMood: z.string().min(3, { message: 'Desired mood is required.' }),
});

export type BrandFormValues = z.infer<typeof formSchema>;

interface BrandFormProps {
  onSubmit: (data: BrandFormValues) => void;
  isLoading: boolean;
}

const quizSteps = [
  {
    field: "brandName",
    title: "Question 1/3: What's your brand's name?",
    description: "This will be the centerpiece of your new brand identity.",
  },
  {
    field: "industryAndStyle",
    title: "Question 2/3: Describe your industry & style",
    description: "This helps us understand the context and visual language of your brand.",
    options: [
      "Technology - Modern and Innovative",
      "Fashion - Elegant and Luxurious",
      "Food & Beverage - Fun and Playful",
      "Wellness - Calm and Natural",
    ],
  },
  {
    field: "desiredMood",
    title: "Question 3/3: What mood should your brand evoke?",
    description: "The mood sets the emotional tone for your brand's colors and design.",
    options: [
      "Energetic and Exciting",
      "Trustworthy and Professional",
      "Friendly and Approachable",
      "Sophisticated and Minimalist",
    ],
  },
];

// Internal schema for the multi-step quiz form
const quizFormSchema = z.object({
  brandName: z.string().min(2, { message: "Please enter a brand name of at least 2 characters." }),
  industryAndStyle: z.string({ required_error: "Please select an option." }),
  customIndustryAndStyle: z.string().optional(),
  desiredMood: z.string({ required_error: "Please select an option." }),
  customDesiredMood: z.string().optional(),
}).partial(); // Make all fields optional initially

export function BrandForm({ onSubmit, isLoading }: BrandFormProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<z.infer<typeof quizFormSchema>>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      brandName: '',
    },
  });

  const handleNext = async () => {
    const fields: (keyof z.infer<typeof quizFormSchema>)[] = currentStep === 0 ? ['brandName'] : ['industryAndStyle'];
    const isValid = await form.trigger(fields);
    
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };
  
  const handleFinalSubmit = (data: z.infer<typeof quizFormSchema>) => {
    const [industry, stylePreferences] = (data.industryAndStyle === 'other' 
        ? data.customIndustryAndStyle || 'General - Creative' 
        : data.industryAndStyle || 'General - Creative').split(' - ');
    
    const desiredMood = data.desiredMood === 'other'
        ? data.customDesiredMood || "Professional"
        : data.desiredMood || "Professional";
        
    onSubmit({
      brandName: data.brandName || "My Awesome Brand",
      industry: industry.trim(),
      stylePreferences: stylePreferences ? stylePreferences.trim() : 'Creative',
      desiredMood: desiredMood.trim(),
    });
  };

  const currentQuestion = quizSteps[currentStep];

  return (
    <Card className="w-full max-w-2xl shadow-xl animate-in fade-in duration-500">
      <CardHeader>
        <Progress value={((currentStep + 1) / quizSteps.length) * 100} className="mb-4" />
        <CardTitle className="font-headline text-3xl">{currentQuestion.title}</CardTitle>
        <CardDescription>{currentQuestion.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="space-y-8">
            <div className="min-h-[220px]">
              {currentStep === 0 && (
                 <FormField
                  control={form.control}
                  name="brandName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Palette className="h-4 w-4 text-muted-foreground" /> Brand Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Nova Robotics" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {currentStep === 1 && (
                 <FormField
                    control={form.control}
                    name="industryAndStyle"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="flex items-center gap-2"><Factory className="h-4 w-4 text-muted-foreground" /> Industry & Style</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-1"
                          >
                            {quizSteps[1].options?.map(option => (
                              <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={option} />
                                </FormControl>
                                <FormLabel className="font-normal">{option}</FormLabel>
                              </FormItem>
                            ))}
                             <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="other" />
                                </FormControl>
                                <FormLabel className="font-normal">Other...</FormLabel>
                              </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        {form.watch('industryAndStyle') === 'other' && (
                           <FormField
                              control={form.control}
                              name="customIndustryAndStyle"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Textarea placeholder="Describe your industry and style (e.g. Healthcare - Trustworthy)" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                        )}
                      </FormItem>
                    )}
                  />
              )}
              {currentStep === 2 && (
                <FormField
                    control={form.control}
                    name="desiredMood"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="flex items-center gap-2"><Smile className="h-4 w-4 text-muted-foreground" /> Desired Mood</FormLabel>
                         <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-1"
                          >
                            {quizSteps[2].options?.map(option => (
                              <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={option} />
                                </FormControl>
                                <FormLabel className="font-normal">{option}</FormLabel>
                              </FormItem>
                            ))}
                             <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="other" />
                                </FormControl>
                                <FormLabel className="font-normal">Other...</FormLabel>
                              </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        {form.watch('desiredMood') === 'other' && (
                           <FormField
                              control={form.control}
                              name="customDesiredMood"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Textarea placeholder="e.g., Calm and trustworthy" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                        )}
                      </FormItem>
                    )}
                  />
              )}
            </div>

            <div className="flex justify-between items-center">
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
                    'Generate Brand Kit'
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
