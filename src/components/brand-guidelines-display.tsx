'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Palette, Type, Gem, Mic2 } from 'lucide-react';
import type { GenerateBrandGuidelinesOutput } from '@/ai/flows/generate-brand-guidelines';

interface BrandGuidelinesDisplayProps {
  guidelines: GenerateBrandGuidelinesOutput;
}

export function BrandGuidelinesDisplay({
  guidelines,
}: BrandGuidelinesDisplayProps) {
  return (
    <Card className="flex flex-col h-full shadow-lg bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Brand Guidelines
        </CardTitle>
        <CardDescription>
          Simple rules for using your new brand assets consistently.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue="color-usage"
        >
          <AccordionItem value="color-usage">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-primary" />
                Color Usage
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm">
              <p>{guidelines.colorUsage}</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="logo-usage">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <Gem className="h-5 w-5 text-primary" />
                Logo Usage
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm">
              <p>{guidelines.logoUsage}</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="typography-usage">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <Type className="h-5 w-5 text-primary" />
                Typography
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm">
              <p>{guidelines.typographyUsage}</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="brand-voice">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <Mic2 className="h-5 w-5 text-primary" />
                Brand Voice
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm">
              <p>{guidelines.brandVoice}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
