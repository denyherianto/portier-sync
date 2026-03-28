'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, Plus, Check, Trash2 } from 'lucide-react'
import { useIntegrationsQuery } from '@/api/queries/integrations'
import { useCreateIntegrationMutation, useDeleteIntegrationMutation } from '@/api/mutations/integrations'
import { useIntegrationCatalogQuery } from '@/api/queries/integration-catalog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/utils/styles'
import { formatRelativeTime } from '@/utils/date'
import type { IntegrationStatus, IntegrationCatalog } from '@/types'

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

const statusConfig: Record<IntegrationStatus, { label: string; className: string }> = {
  NOT_SYNCED: { label: 'Not Synced', className: 'bg-gray-50 text-gray-600 border-gray-200' },
  SYNCED:     { label: 'Synced',     className: 'bg-green-50 text-green-700 border-green-200' },
  CONFLICT:   { label: 'Conflict',   className: 'bg-amber-50 text-amber-700 border-amber-200' },
  SYNCING:    { label: 'Syncing',    className: 'bg-blue-50 text-blue-700 border-blue-200' },
  ERROR:      { label: 'Error',      className: 'bg-red-50 text-red-700 border-red-200' },
}

function StatusBadge({ status }: { status: IntegrationStatus }) {
  const { label, className } = statusConfig[status]
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border', className)}>
      {label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Color presets
// ---------------------------------------------------------------------------

const COLOR_PRESETS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#64748b', '#78716c',
]

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ---------------------------------------------------------------------------
// Add Integration modal
// ---------------------------------------------------------------------------

const CUSTOM_ID = '__custom__'

interface AddIntegrationDialogProps {
  open: boolean
  onClose: () => void
}

function AddIntegrationDialog({ open, onClose }: AddIntegrationDialogProps) {
  const { data: catalog = [], isPending: catalogLoading } = useIntegrationCatalogQuery()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  // custom-only fields
  const [customName, setCustomName] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [customSlugTouched, setCustomSlugTouched] = useState(false)
  const [customColor, setCustomColor] = useState(COLOR_PRESETS[0])

  const { mutate: createIntegration, isPending } = useCreateIntegrationMutation()

  const isCustom = selectedId === CUSTOM_ID
  const selectedCatalog: IntegrationCatalog | undefined = catalog.find(c => c.id === selectedId)

  function handleCustomNameChange(value: string) {
    setCustomName(value)
    if (!customSlugTouched) setCustomSlug(slugify(value))
  }

  function handleClose() {
    setSelectedId(null)
    setCustomName('')
    setCustomSlug('')
    setCustomSlugTouched(false)
    setCustomColor(COLOR_PRESETS[0])
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId) return

    if (isCustom) {
      if (!customName.trim() || !customSlug.trim()) return
      createIntegration(
        { name: customName.trim(), slug: customSlug.trim(), color: customColor },
        { onSuccess: handleClose }
      )
    } else if (selectedCatalog) {
      createIntegration(
        { name: selectedCatalog.name, slug: selectedCatalog.id, color: selectedCatalog.color },
        { onSuccess: handleClose }
      )
    }
  }

  const canSubmit = !!selectedId &&
    (isCustom ? !!customName.trim() && !!customSlug.trim() : true)

  // All catalog options + custom at the bottom
  const options = [...catalog, { id: CUSTOM_ID, name: 'Custom', color: '#6b7280', isCustom: true }]

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Integration</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-1">

          {/* Catalog picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Integration</label>
            {catalogLoading ? (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {options.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedId(option.id)}
                    className={cn(
                      'relative flex flex-col items-center gap-2 px-3 py-3 rounded-lg border text-center transition-all',
                      selectedId === option.id
                        ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    )}
                  >
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-semibold text-white shrink-0"
                      style={{ backgroundColor: option.color }}
                    >
                      {option.name[0]}
                    </div>
                    <span className="text-xs font-medium text-gray-700 leading-tight">{option.name}</span>
                    {selectedId === option.id && (
                      <Check className="absolute top-1.5 right-1.5 size-3 text-gray-900" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom fields — only when Custom is selected */}
          {isCustom && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  placeholder="e.g. My Integration"
                  value={customName}
                  onChange={e => handleCustomNameChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 placeholder:text-gray-400 text-gray-900 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Slug</label>
                <input
                  type="text"
                  placeholder="e.g. my-integration"
                  value={customSlug}
                  onChange={e => { setCustomSlug(e.target.value); setCustomSlugTouched(true) }}
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 placeholder:text-gray-400 text-gray-900 transition-all font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Color</label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-base font-medium text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: customColor }}
                  >
                    {customName ? customName[0].toUpperCase() : 'C'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_PRESETS.map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setCustomColor(preset)}
                        className={cn(
                          'size-6 rounded-md transition-all',
                          customColor === preset && 'ring-2 ring-offset-1 ring-gray-900'
                        )}
                        style={{ backgroundColor: preset }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}


          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !canSubmit}
              className="text-sm font-medium bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Adding…' : 'Add Integration'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Status filter options
// ---------------------------------------------------------------------------

const statusOptions: Array<{ value: IntegrationStatus | 'all'; label: string }> = [
  { value: 'all',        label: 'All Status' },
  { value: 'NOT_SYNCED', label: 'Not Synced' },
  { value: 'SYNCED',     label: 'Synced' },
  { value: 'CONFLICT',   label: 'Conflict' },
  { value: 'SYNCING',    label: 'Syncing' },
  { value: 'ERROR',      label: 'Error' },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function IntegrationsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<IntegrationStatus | 'all'>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  const { data: integrations, isPending, isError, error } = useIntegrationsQuery()
  const { mutate: deleteIntegration } = useDeleteIntegrationMutation()

  const filtered = useMemo(() => {
    if (!integrations) return []
    return integrations.filter(integration => {
      const matchesSearch = integration.name.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || integration.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [integrations, search, statusFilter])

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 flex flex-col">

      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Integrations</h1>
          <p className="text-base text-gray-500 mt-1.5">Manage and monitor your connected integrations</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="bg-black hover:bg-black/80 cursor-pointer text-white px-3 py-2 rounded-lg text-base font-medium shadow-sm transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <Plus strokeWidth={1.5} className="w-5 h-5" />
          Add Integration
        </button>
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search strokeWidth={1.5} className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search integrations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow shadow-sm"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setFilterOpen(v => !v)}
            className={cn(
              'bg-white border border-gray-200 px-3 py-2 rounded-lg text-base font-medium shadow-sm transition-all flex items-center gap-2.5 whitespace-nowrap',
              filterOpen || statusFilter !== 'all'
                ? 'bg-gray-100 border-gray-300 text-gray-900'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <SlidersHorizontal strokeWidth={1.5} className="w-4 h-4 text-gray-500" />
            {statusOptions.find(o => o.value === statusFilter)?.label ?? 'All Status'}
          </button>

          {filterOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => { setStatusFilter(option.value); setFilterOpen(false) }}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm transition-colors',
                    statusFilter === option.value
                      ? 'text-gray-900 bg-gray-50 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Data List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">

        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 bg-gray-50/50">
          <div className="col-span-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Integration</div>
          <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-widest">Status</div>
          <div className="col-span-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Last Synced</div>
          <div className="col-span-1" />
        </div>

        {/* Loading */}
        {isPending && (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                <div className="col-span-4 flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <div className="col-span-3"><Skeleton className="h-6 w-16 rounded-full" /></div>
                <div className="col-span-4"><Skeleton className="h-4 w-24" /></div>
                <div className="col-span-1" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="px-6 py-8 text-base text-red-600">
            {error.message || 'Failed to load integrations'}
          </div>
        )}

        {/* Empty */}
        {!isPending && !isError && filtered.length === 0 && (
          <div className="px-6 py-16 text-center text-base text-gray-400">
            {integrations?.length === 0
              ? 'No integrations configured'
              : 'No integrations match your search'}
          </div>
        )}

        {/* Rows */}
        {!isPending && !isError && filtered.length > 0 && (
          <div className="divide-y divide-gray-100">
            {filtered.map(integration => (
              <div
                key={integration.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/80 transition-colors group"
              >
                <div className="md:col-span-4 flex items-center gap-4">
                  <Link href={`/integrations/${integration.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg text-white flex items-center justify-center text-lg font-medium shadow-sm shrink-0"
                      style={{ backgroundColor: integration.color }}
                    >
                      {integration.name[0]}
                    </div>
                    <span className="text-base font-medium text-gray-900 hover:underline underline-offset-2">{integration.name}</span>
                  </Link>
                </div>

                <div className="md:col-span-3 flex items-center justify-between md:justify-start">
                  <span className="text-xs font-semibold text-gray-500 md:hidden uppercase tracking-widest">Status</span>
                  <StatusBadge status={integration.status} />
                </div>

                <div className="md:col-span-4 flex items-center justify-between md:justify-start text-base text-gray-500 group-hover:text-gray-700 transition-colors">
                  <span className="text-xs font-semibold text-gray-500 md:hidden uppercase tracking-widest">Last Synced</span>
                  {formatRelativeTime(integration.lastSynced)}
                </div>

                <div className="md:col-span-1 flex justify-end">
                  <button
                    onClick={() => deleteIntegration(integration.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    aria-label={`Delete ${integration.name}`}
                  >
                    <Trash2 strokeWidth={1.5} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddIntegrationDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </main>
  )
}
