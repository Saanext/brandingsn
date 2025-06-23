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
import { Badge } from '@/components/ui/badge';
import { Palette, Type, Gem, Mic2, Check, X } from 'lucide-react';
import type { GenerateBrandGuidelinesOutput } from '@/ai/flows/generate-brand-guidelines';

interface BrandGuidelinesDisplayProps {
  guidelines: GenerateBrandGuidelinesOutput;
}

export function BrandGuidelinesDisplay({
  guidelines,
}: BrandGuidelinesDisplayProps) {
  const { brandVoice } = guidelines;

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
                Brand Voice & Tone
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm space-y-6 pt-2">
                <p className="text-base">{brandVoice.summary}</p>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Voice Attributes</h4>
                  <div className="flex flex-wrap gap-2">
                    {brandVoice.attributes.map((attr) => (
                      <Badge key={attr} variant="secondary">{attr}</Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Do's</h4>
                    <ul className="space-y-2">
                      {brandVoice.dos.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                   <div>
                    <h4 className="font-semibold text-foreground mb-3">Don'ts</h4>
                     <ul className="space-y-2">
                      {brandVoice.donts.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <X className="h-4 w-4 mt-1 text-red-500 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Contextual Tone</h4>
                  <div className="space-y-3">
                    {brandVoice.contextualTone.map((item, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-md border">
                        <p className="font-semibold text-foreground">{item.context}</p>
                        <p>{item.tone}</p>
                      </div>
                    ))}
                  </div>
                </div>

            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
