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
import { useState } from 'react';
import { AddAppointmentDialog } from './dialogs/AddAppointmentDialog';
import { useCalendarStore, View } from '../store';
import FullCalendar from '@fullcalendar/react';

export function CalendarHeader({
  calendarRef,
}: {
  calendarRef: React.RefObject<FullCalendar | null>;
}) {
  const { view, date, setView, setDate, setSearchQuery } = useCalendarStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const handleSearch = useDebouncedCallback((query: string) => {
    setSearchQuery(query);
  }, 300);

  const handlePrev = () => {
    calendarRef?.current?.getApi().prev();
    setDate(calendarRef?.current?.getApi().getDate() || new Date());
  };

  const handleNext = () => {
    calendarRef?.current?.getApi().next();
    setDate(calendarRef?.current?.getApi().getDate() || new Date());
  };

  const handleToday = () => {
    calendarRef?.current?.getApi().today();
    setDate(calendarRef?.current?.getApi().getDate() || new Date());
  };

  const handleOnViewChange = (newView: View) => {
    calendarRef?.current?.getApi().changeView(newView);
    setView(newView);
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
                <DropdownMenuItem
                  onClick={() => handleOnViewChange('timeGridWeek')}
                >
                  Week
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleOnViewChange('dayGridMonth')}
                >
                  Month
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleOnViewChange('timeGridDay')}
                >
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
