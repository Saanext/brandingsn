import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface AssetPreviewProps {
  title: string;
  description: string;
  src: string;
  fileName: string;
}

export function AssetPreview({ title, description, src, fileName }: AssetPreviewProps) {
  return (
    <Card className="flex flex-col h-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center bg-muted/30 rounded-lg m-2 md:m-6 mt-0 p-2 md:p-4">
        {src ? (
          <Image
            src={src}
            alt={title}
            width={400}
            height={300}
            className="rounded-md object-contain max-h-[400px]"
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 rounded-md animate-pulse" />
        )}
      </CardContent>
      <CardFooter>
        <a href={src} download={fileName} className="w-full">
          <Button variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}
