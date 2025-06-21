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
    field: "industry",
    title: "Question 2/3: What industry is your brand in?",
    description: "This helps us understand your brand's context.",
    options: ["Technology", "Fashion", "Food & Beverage", "Wellness", "E-commerce", "Education"],
  },
  {
    field: "styleAndMood",
    title: "Question 3/3: What's the personality of your brand?",
    description: "This sets the emotional and visual tone for your brand.",
    options: [
      "Modern & Innovative",
      "Elegant & Luxurious",
      "Fun & Playful",
      "Calm & Natural",
      "Energetic & Exciting",
      "Trustworthy & Professional",
      "Friendly & Approachable",
      "Sophisticated & Minimalist",
    ],
  },
];


const quizFormSchema = z.object({
  brandName: z.string().min(2, { message: "Please enter a brand name of at least 2 characters." }),
  industry: z.string({ required_error: "Please select an industry." }),
  customIndustry: z.string().optional(),
  styleAndMood: z.string({ required_error: "Please select an option." }),
  customStyleAndMood: z.string().optional(),
}).partial(); 

export function BrandForm({ onSubmit, isLoading }: BrandFormProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<z.infer<typeof quizFormSchema>>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      brandName: '',
    },
  });

  const handleNext = async () => {
    let fieldsToValidate: (keyof z.infer<typeof quizFormSchema>)[];
    switch (currentStep) {
      case 0:
        fieldsToValidate = ['brandName'];
        break;
      case 1:
        fieldsToValidate = ['industry'];
        break;
      case 2:
        fieldsToValidate = ['styleAndMood'];
        break;
      default:
        fieldsToValidate = [];
        break;
    }
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };
  
  const handleFinalSubmit = (data: z.infer<typeof quizFormSchema>) => {
    const industry = data.industry === 'other' 
        ? data.customIndustry || 'General' 
        : data.industry || 'General';
    
    const [style, mood] = (data.styleAndMood === 'other' 
        ? data.customStyleAndMood || 'Creative & Professional' 
        : data.styleAndMood || 'Creative & Professional').split(' & ');
        
    onSubmit({
      brandName: data.brandName || "My Awesome Brand",
      industry: industry.trim(),
      stylePreferences: style.trim(),
      desiredMood: mood ? mood.trim() : 'Professional',
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
                    name="industry"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="flex items-center gap-2"><Factory className="h-4 w-4 text-muted-foreground" /> Industry</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-2 gap-4"
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
                        {form.watch('industry') === 'other' && (
                           <FormField
                              control={form.control}
                              name="customIndustry"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Your industry..." {...field} />
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
                    name="styleAndMood"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="flex items-center gap-2"><Smile className="h-4 w-4 text-muted-foreground" /> Style & Mood</FormLabel>
                         <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-2 gap-4"
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
                        {form.watch('styleAndMood') === 'other' && (
                           <FormField
                              control={form.control}
                              name="customStyleAndMood"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="e.g., Corporate & Trustworthy" {...field} />
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
