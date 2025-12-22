'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar as CalendarIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDebouncedCallback } from 'use-debounce';
import { getPeriodString } from '../lib/utils';
import {
  addMonths,
  addWeeks,
  addDays,
  subMonths,
  subWeeks,
  subDays,
} from 'date-fns';
import { useState } from 'react';
import { AddAppointmentDialog } from './dialogs/AddAppointmentDialog';

export type View = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';

interface CalendarHeaderProps {
  view: View;
  date: Date;
  onDateChange: (date: Date) => void;
  onViewChange: (view: View) => void;
  onSearch: (query: string) => void;
}

export function CalendarHeader({
  view,
  date,
  onDateChange,
  onViewChange,
  onSearch,
}: CalendarHeaderProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const handleSearch = useDebouncedCallback((query: string) => {
    onSearch(query);
  }, 300);

  const handlePrev = () => {
    let newDate;
    if (view === 'dayGridMonth') {
      newDate = subMonths(date, 1);
    } else if (view === 'timeGridWeek') {
      newDate = subWeeks(date, 1);
    } else {
      newDate = subDays(date, 1);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    let newDate;
    if (view === 'dayGridMonth') {
      newDate = addMonths(date, 1);
    } else if (view === 'timeGridWeek') {
      newDate = addWeeks(date, 1);
    } else {
      newDate = addDays(date, 1);
    }
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  return (
    <>
      <div className="space-y-3 p-4">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Calendar</h1>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-background p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={handleNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-lg font-semibold text-gray-700">
              {getPeriodString(date, view)}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto md:justify-end justify-center">
            <div className="relative flex-grow max-w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search appointments..."
                className="pl-9 pr-3 py-2 border rounded-md w-full"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="px-3 py-2 text-sm"
              onClick={handleToday}
            >
              Today
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center space-x-1 px-3 py-2 text-sm"
                >
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {view === 'dayGridMonth'
                      ? 'Month'
                      : view === 'timeGridWeek'
                      ? 'Week'
                      : 'Day'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onViewChange('timeGridWeek')}>
                  Week
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewChange('dayGridMonth')}>
                  Month
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewChange('timeGridDay')}>
                  Day
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 text-sm"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <span>+ Add Appointment</span>
            </Button>
          </div>
        </div>
      </div>
      <AddAppointmentDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      />
    </>
  );
}
