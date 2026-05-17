'use client'
import { useFormContext } from 'react-hook-form'
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'

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
  { value: 'min', label: 'Numeric — Higher is Better (Min)' },
  { value: 'max', label: 'Numeric — Lower is Better (Max)' },
  { value: 'timeline', label: 'Timeline (Date-based)' },
  { value: 'zero', label: 'Zero-based (0 = Success)' },
]

interface GoalRowProps {
  index: number
  onRemove: () => void
  canRemove: boolean
  isShared?: boolean
}

export default function GoalRow({ index, onRemove, canRemove, isShared = false }: GoalRowProps) {
  const form = useFormContext()

  return (
    <div
      style={{
        background: isShared ? '#f0fdf9' : 'white',
        border: isShared ? '1.5px solid #0d9488' : '1px solid #c9ebe4',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        position: 'relative',
        transition: 'box-shadow 0.2s',
      }}
    >
      {/* Goal number badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
              color: 'white',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {index + 1}
          </div>
          <span style={{ color: '#0f4c3a', fontWeight: 600, fontSize: '14px', fontFamily: 'Georgia, serif' }}>
            Goal {index + 1}
            {isShared && (
              <span
                style={{
                  marginLeft: '8px',
                  background: '#ccfbf1',
                  color: '#0d9488',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '20px',
                }}
              >
                SHARED
              </span>
            )}
          </span>
        </div>

        {canRemove && !isShared && (
          <button
            type="button"
            onClick={onRemove}
            style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: '#e11d48',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {/* Thrust Area */}
        <FormField
          control={form.control}
          name={`goals.${index}.thrustArea`}
          render={({ field }) => (
            <FormItem>
              <FormLabel style={{ color: '#0f4c3a', fontWeight: 600, fontSize: '13px' }}>Thrust Area</FormLabel>
              <FormControl>
                <select
                  {...field}
                  disabled={isShared}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: '1px solid #c9ebe4',
                    color: '#0f4c3a',
                    fontSize: '13px',
                    background: isShared ? '#f0fdf9' : 'white',
                    outline: 'none',
                    cursor: isShared ? 'not-allowed' : 'pointer',
                  }}
                >
                  <option value="">Select thrust area</option>
                  {THRUST_AREAS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* UoM */}
        <FormField
          control={form.control}
          name={`goals.${index}.uom`}
          render={({ field }) => (
            <FormItem>
              <FormLabel style={{ color: '#0f4c3a', fontWeight: 600, fontSize: '13px' }}>Unit of Measurement</FormLabel>
              <FormControl>
                <select
                  {...field}
                  disabled={isShared}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: '1px solid #c9ebe4',
                    color: '#0f4c3a',
                    fontSize: '13px',
                    background: isShared ? '#f0fdf9' : 'white',
                    outline: 'none',
                    cursor: isShared ? 'not-allowed' : 'pointer',
                  }}
                >
                  <option value="">Select UoM</option>
                  {UOM_OPTIONS.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Goal Title */}
        <FormField
          control={form.control}
          name={`goals.${index}.title`}
          render={({ field }) => (
            <FormItem style={{ gridColumn: '1 / -1' }}>
              <FormLabel style={{ color: '#0f4c3a', fontWeight: 600, fontSize: '13px' }}>Goal Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isShared}
                  placeholder="e.g. Increase quarterly revenue by 20%"
                  style={{
                    borderColor: '#c9ebe4',
                    color: '#0f4c3a',
                    background: isShared ? '#f0fdf9' : 'white',
                    cursor: isShared ? 'not-allowed' : 'text',
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name={`goals.${index}.description`}
          render={({ field }) => (
            <FormItem style={{ gridColumn: '1 / -1' }}>
              <FormLabel style={{ color: '#0f4c3a', fontWeight: 600, fontSize: '13px' }}>Description</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  disabled={isShared}
                  placeholder="Describe how this goal will be measured and achieved..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: '1px solid #c9ebe4',
                    color: '#0f4c3a',
                    fontSize: '13px',
                    background: isShared ? '#f0fdf9' : 'white',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    cursor: isShared ? 'not-allowed' : 'text',
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Target */}
        <FormField
          control={form.control}
          name={`goals.${index}.target`}
          render={({ field }) => (
            <FormItem>
              <FormLabel style={{ color: '#0f4c3a', fontWeight: 600, fontSize: '13px' }}>
                Target {form.watch(`goals.${index}.uom`) === 'timeline' ? '(Deadline)' : '(Numeric)'}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isShared}
                  type={form.watch(`goals.${index}.uom`) === 'timeline' ? 'date' : 'number'}
                  placeholder={form.watch(`goals.${index}.uom`) === 'timeline' ? '' : 'e.g. 100'}
                  style={{
                    borderColor: '#c9ebe4',
                    color: '#0f4c3a',
                    background: isShared ? '#f0fdf9' : 'white',
                    cursor: isShared ? 'not-allowed' : 'text',
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Weightage */}
        <FormField
          control={form.control}
          name={`goals.${index}.weightage`}
          render={({ field }) => (
            <FormItem>
              <FormLabel style={{ color: '#0f4c3a', fontWeight: 600, fontSize: '13px' }}>Weightage (%)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={10}
                  max={100}
                  placeholder="Min 10%"
                  style={{ borderColor: '#c9ebe4', color: '#0f4c3a' }}
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