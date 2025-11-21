'use client';

import * as React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface Tip {
  title: string;
  description: string | string[];
  image: string;
}

interface TipsProps {
  tips: Tip[];
  className?: string;
}

export function Tips({ tips, className }: TipsProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  if (!tips || tips.length === 0) {
    return null;
  }

  const currentTip = tips[currentIndex];

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? tips.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === tips.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={cn('relative w-full h-full', className)}>
      {/* Background Image with smooth transition */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-500 ease-in-out"
        style={{
          backgroundImage: `url(${currentTip.image})`,
        }}
      >
        {/* Optional overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Frosted Glass Card at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
        <div className="relative rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 md:p-8 max-w-4xl mx-auto">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-3 md:mb-4 transition-opacity duration-300">
            {currentTip.title}
          </h3>

          <div className="flex items-end justify-between gap-4">
            <div className="flex-1 space-y-2 text-white/90 text-sm md:text-base lg:text-lg transition-opacity duration-300">
              {Array.isArray(currentTip.description) ? (
                currentTip.description.map((line, i) => <p key={i}>{line}</p>)
              ) : (
                <p>{currentTip.description}</p>
              )}
            </div>

            {/* Navigation Arrows */}
            <div className="flex gap-2 shrink-0">
              <Button
                onClick={goToPrev}
                className="size-10 rounded-full bg-white/20 hover:bg-white/30 border-white/30 text-white"
                variant="ghost"
                size="icon"
              >
                <ArrowLeft className="size-5" />
                <span className="sr-only">Previous tip</span>
              </Button>
              <Button
                onClick={goToNext}
                className="size-10 rounded-full bg-white/20 hover:bg-white/30 border-white/30 text-white"
                variant="ghost"
                size="icon"
              >
                <ArrowRight className="size-5" />
                <span className="sr-only">Next tip</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
