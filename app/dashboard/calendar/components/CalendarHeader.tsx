'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search, Plus } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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
    if (!newView) return; // Prevent deselection
    calendarRef?.current?.getApi().changeView(newView);
    setView(newView);
  };

  const getViewValue = () => {
    switch (view) {
      case 'dayGridMonth':
        return 'month';
      case 'timeGridWeek':
        return 'week';
      case 'timeGridDay':
        return 'day';
      default:
        return 'week';
    }
  };

  const handleToggleChange = (value: string) => {
    if (!value) return;
    const viewMap: Record<string, View> = {
      month: 'dayGridMonth',
      week: 'timeGridWeek',
      day: 'timeGridDay',
    };
    handleOnViewChange(viewMap[value]);
  };

  return (
    <>
      <div className="space-y-4 p-6">
        <h1 className="text-2xl font-semibold text-gray-800">Calendar</h1>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-background p-4 rounded-lg shadow-sm border">
          {/* Left: Navigation */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
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
            <Button variant="outline" className="h-9" onClick={handleToday}>
              Today
            </Button>
            <h2 className="text-lg font-semibold text-gray-700 ml-2">
              {getPeriodString(date, view)}
            </h2>
          </div>

          {/* Center: View Switcher */}
          <div className="flex items-center gap-3">
            <ToggleGroup
              type="single"
              value={getViewValue()}
              onValueChange={handleToggleChange}
              className="border rounded-md"
            >
              <ToggleGroupItem
                value="day"
                aria-label="Day view"
                className="px-4"
              >
                Day
              </ToggleGroupItem>
              <ToggleGroupItem
                value="week"
                aria-label="Week view"
                className="px-4"
              >
                Week
              </ToggleGroupItem>
              <ToggleGroupItem
                value="month"
                aria-label="Month view"
                className="px-4"
              >
                Month
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Right: Search & Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search appointments..."
                className="pl-9 pr-3 h-9 w-[240px]"
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
            <Button onClick={() => setIsAddDialogOpen(true)}>
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
