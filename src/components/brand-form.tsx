'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Factory, Palette, Smile, Loader2 } from 'lucide-react';

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

export function BrandForm({ onSubmit, isLoading }: BrandFormProps) {
  const form = useForm<BrandFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brandName: '',
      industry: '',
      stylePreferences: '',
      desiredMood: '',
    },
  });

  return (
    <Card className="w-full max-w-2xl shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Describe Your Brand</CardTitle>
        <CardDescription>Tell us about your brand to generate your new identity.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="brandName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Nova Robotics" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Factory className="h-4 w-4 text-muted-foreground" /> Industry
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Technology, E-commerce, SaaS" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stylePreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" /> Style Preferences
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Minimalist, Modern, Playful, Luxurious" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="desiredMood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Smile className="h-4 w-4 text-muted-foreground" /> Desired Mood
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Energetic and innovative, Calm and trustworthy" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full text-lg py-6 font-headline bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Conjuring...
                </>
              ) : (
                'Generate Brand Kit'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
