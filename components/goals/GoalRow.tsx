'use client'

import { useFormContext } from 'react-hook-form'
import {
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'
import { FormValues } from './GoalSheetForm'

const THRUST_AREAS = [
  'Revenue Growth',
  'Cost Optimisation',
  'Customer Satisfaction',
  'People Development',
  'Process Improvement',
  'Safety & Compliance',
  'Innovation',
  'Digital Transformation',
]

const UOM_OPTIONS = [
  {
    value: 'numeric_min',
    label: 'Numeric — Higher is Better (Min)',
  },
  {
    value: 'numeric_max',
    label: 'Numeric — Lower is Better (Max)',
  },
  {
    value: 'timeline',
    label: 'Timeline (Date-based)',
  },
  {
    value: 'zero-based',
    label: 'Zero-based (0 = Success)',
  },
]

interface GoalRowProps {
  index: number
  onRemove: () => void
  canRemove: boolean
  isShared?: boolean
}

export default function GoalRow({
  index,
  onRemove,
  canRemove,
  isShared = false,
}: GoalRowProps) {
  const form = useFormContext<FormValues>()

  return (
    <div
      style={{
        background: isShared ? '#f0fdf9' : 'white',
        border: isShared
          ? '1.5px solid #0d9488'
          : '1px solid #c9ebe4',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <h3>Goal {index + 1}</h3>

        {canRemove && !isShared && (
          <button type="button" onClick={onRemove}>
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
        }}
      >
        {/* THRUST AREA */}
        <FormField
          control={form.control}
          name={`goals.${index}.thrustArea`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thrust Area</FormLabel>

              <FormControl>
                <select {...field}>
                  <option value="">Select thrust area</option>

                  {THRUST_AREAS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* UOM */}
        <FormField
          control={form.control}
          name={`goals.${index}.uom`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit of Measurement</FormLabel>

              <FormControl>
                <select {...field}>
                  {UOM_OPTIONS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* TITLE */}
        <FormField
          control={form.control}
          name={`goals.${index}.title`}
          render={({ field }) => (
            <FormItem style={{ gridColumn: '1 / -1' }}>
              <FormLabel>Goal Title</FormLabel>

              <FormControl>
                <Input {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* DESCRIPTION */}
        <FormField
          control={form.control}
          name={`goals.${index}.description`}
          render={({ field }) => (
            <FormItem style={{ gridColumn: '1 / -1' }}>
              <FormLabel>Description</FormLabel>

              <FormControl>
                <textarea {...field} rows={3} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* TARGET */}
        <FormField
          control={form.control}
          name={`goals.${index}.target`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target</FormLabel>

              <FormControl>
                <Input
                  {...field}
                  type={
                    form.watch(`goals.${index}.uom`) === 'timeline'
                      ? 'date'
                      : 'number'
                  }
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* WEIGHTAGE */}
        <FormField
          control={form.control}
          name={`goals.${index}.weightage`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weightage</FormLabel>

              <FormControl>
                <Input
                  type="number"
                  min={10}
                  max={100}
                  value={field.value}
                  onChange={(e) =>
                    field.onChange(e.target.valueAsNumber)
                  }
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}