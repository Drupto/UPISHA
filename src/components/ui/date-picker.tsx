"use client"

import * as React from "react"
import { format, parse } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export const DATE_FORMAT = "dd MMM yyyy"
export const ISO_DATE_FORMAT = "yyyy-MM-dd"
export const DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm"

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  withTime?: boolean
  /** Store value as ISO yyyy-MM-dd (for type="date" compatibility) instead of dd MMM yyyy */
  isoValue?: boolean
  disabled?: boolean
  required?: boolean
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  withTime = false,
  isoValue = false,
  disabled = false,
  required = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Parse the stored value (dd MMM yyyy display, ISO for datetime/isoValue)
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    if (withTime) {
      const d = new Date(value)
      return isNaN(d.getTime()) ? undefined : d
    }
    // Try ISO yyyy-MM-dd first, then dd MMM yyyy
    let d = parse(value, ISO_DATE_FORMAT, new Date())
    if (isNaN(d.getTime())) {
      d = parse(value, DATE_FORMAT, new Date())
    }
    if (isNaN(d.getTime())) {
      // Fall back to raw Date parsing
      const raw = new Date(value)
      return isNaN(raw.getTime()) ? undefined : raw
    }
    return d
  }, [value, withTime])

  const displayedValue = React.useMemo(() => {
    if (!selectedDate) return ""
    if (withTime) return format(selectedDate, "dd MMM yyyy, hh:mm a")
    return format(selectedDate, DATE_FORMAT)
  }, [selectedDate, withTime])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayedValue || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) return
            if (withTime && selectedDate) {
              // Preserve existing time when picking a new date
              date.setHours(selectedDate.getHours(), selectedDate.getMinutes())
            }
            if (withTime) {
              onChange(date.toISOString())
            } else {
              onChange(format(date, isoValue ? ISO_DATE_FORMAT : DATE_FORMAT))
            }
            if (!withTime) setOpen(false)
          }}
          initialFocus
        />
        {withTime && selectedDate && (
          <div className="border-t p-3">
            <div className="flex items-center gap-2">
              <input
                type="time"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                value={format(selectedDate, "HH:mm")}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(":").map(Number)
                  const updated = new Date(selectedDate)
                  updated.setHours(hours, minutes)
                  onChange(updated.toISOString())
                }}
                required={required}
                aria-label="Time"
              />
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}