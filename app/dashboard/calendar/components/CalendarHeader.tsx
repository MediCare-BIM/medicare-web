'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

export function CalendarHeader() {
  return (
    <div className="space-y-3 p-4">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Calendar</h1>
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-background p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center space-x-1 border rounded-md p-1">
            <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
              JAN
            </span>
            <span className="px-2 py-1 text-sm font-medium text-gray-700">
              10
            </span>
          </div>
          <div className="flex flex-col text-sm text-gray-600">
            <span className="font-medium">ianuarie 2025 Săptămână 1</span>
            <span>1 Ian, 2025 - 31 Ian, 2025</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto md:justify-end justify-center">
          <div className="relative flex-grow max-w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Caută programare"
              className="pl-9 pr-3 py-2 border rounded-md w-full"
            />
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="px-3 py-2 text-sm">
              Astăzi
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            className="flex items-center space-x-1 px-3 py-2 text-sm"
          >
            <span>Săptămână</span>
            <ChevronLeft className="h-4 w-4 rotate-90" />
          </Button>
          <Button className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 text-sm">
            <span>+ Adaugă programare</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
