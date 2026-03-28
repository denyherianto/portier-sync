'use client'

import { use, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Database,
  Info,
  PencilLine,
  RefreshCw,
  Server,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { toast } from 'sonner'
import { useResolveSyncHistoryMutation } from '@/api/mutations/sync-histories'
import { useIntegrationQuery } from '@/api/queries/integrations'
import { useSyncHistoriesQuery } from '@/api/queries/sync-histories'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getUnresolvedConflictChanges,
  hasBlockingConflict,
  isConflictChange,
} from '@/lib/syncHistory'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { SyncHistory, SyncHistoryChange } from '@/types'

// ---------------------------------------------------------------------------
// Resolution types
// ---------------------------------------------------------------------------

type ResolutionMode = 'local' | 'incoming' | 'manual' | null

interface ResolutionSelection {
  mode: ResolutionMode
  manualValue: string
}

function createEmptySelections(changes: SyncHistoryChange[]) {
  return Object.fromEntries(
    changes.map((change) => [change.id, { mode: null, manualValue: '' }])
  ) as Record<string, ResolutionSelection>
}

function createBulkSelections(
  changes: SyncHistoryChange[],
  mode: Exclude<ResolutionMode, null | 'manual'>
) {
  return Object.fromEntries(
    changes.map((change) => [change.id, { mode, manualValue: '' }])
  ) as Record<string, ResolutionSelection>
}

function isSelectionReady(selection?: ResolutionSelection) {
  if (!selection?.mode) return false
  if (selection.mode === 'manual') return selection.manualValue.trim().length > 0
  return true
}

function getSelectionValue(change: SyncHistoryChange, selection?: ResolutionSelection) {
  if (!selection?.mode) return ''
  if (selection.mode === 'manual') return selection.manualValue.trim()
  return selection.mode === 'local' ? (change.currentValue ?? '') : (change.newValue ?? '')
}

function getPersistedMode(change: SyncHistoryChange): ResolutionMode {
  if (!isConflictChange(change) || change.chosenValue === null || change.chosenValue === undefined) return null
  if (change.chosenValue === (change.currentValue ?? '')) return 'local'
  if (change.chosenValue === (change.newValue ?? '')) return 'incoming'
  return 'manual'
}

function formatFieldValue(value: string | null | undefined) {
  if (value === null || value === undefined || value.trim().length === 0) return 'Empty value'
  return value
}

function getSeverityLabel(count: number) {
  if (count >= 3) return 'High Severity'
  if (count === 2) return 'Medium Severity'
  return 'Needs Review'
}

function getSeverityTooltip(count: number) {
  if (count >= 3) return `${count} conflicting fields detected. Manual review is required for each before syncing can resume.`
  if (count === 2) return `${count} conflicting fields detected. Review both fields to determine which value to keep.`
  return '1 conflicting field detected. Review the field and choose the correct value to proceed.'
}

// ---------------------------------------------------------------------------
// Resolution option card
// ---------------------------------------------------------------------------

interface ResolutionOptionCardProps {
  active: boolean
  dimmed?: boolean
  readOnly?: boolean
  side: 'local' | 'incoming'
  title: string
  meta: string
  value: string | null | undefined
  onClick: () => void
}

function ResolutionOptionCard({ active, dimmed, readOnly, side, title, meta, value, onClick }: ResolutionOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={readOnly}
      className={cn(
        'relative rounded-lg border bg-white p-3 text-left shadow-sm transition-all focus-visible:ring-2',
        active && side === 'local' && 'border-2 border-blue-500 bg-blue-50/30 ring-4 ring-blue-500/10',
        active && side === 'incoming' && 'border-2 border-green-500 bg-green-50/30 ring-4 ring-green-500/10',
        !active && 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
        dimmed && 'opacity-50',
        readOnly && 'cursor-default hover:border-gray-200 hover:bg-white'
      )}
    >
      <span className="block text-sm font-medium text-gray-900">{formatFieldValue(value)}</span>
      <span className="mt-1 block text-xs text-gray-500">{title}</span>
      <span className="mt-0.5 block text-[11px] text-gray-400">{meta}</span>
      {active && (
        <span className={cn(
          'absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full text-white shadow-sm',
          side === 'local' ? 'bg-blue-500' : 'bg-green-500'
        )}>
          <Check className="size-3" strokeWidth={3} />
        </span>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Conflict Resolver section
// ---------------------------------------------------------------------------

interface ConflictResolverProps {
  integrationId: string
  history: SyncHistory
}

function ConflictResolver({ integrationId, history }: ConflictResolverProps) {
  const router = useRouter()

  const reviewableUpdates = useMemo(
    () => (history.changes ?? []).filter((c) => c.changeType === 'UPDATE'),
    [history]
  )
  const unresolvedConflicts = useMemo(() => getUnresolvedConflictChanges(history), [history])
  const conflictUpdates = useMemo(() => reviewableUpdates.filter(isConflictChange), [reviewableUpdates])
  const cleanUpdates = useMemo(() => reviewableUpdates.filter((c) => !isConflictChange(c)), [reviewableUpdates])

  const [selections, setSelections] = useState<Record<string, ResolutionSelection>>(() => {
    const init: Record<string, ResolutionSelection> = {}
    for (const c of reviewableUpdates) {
      init[c.id] = isConflictChange(c)
        ? { mode: null, manualValue: '' }
        : { mode: 'incoming', manualValue: '' }
    }
    return init
  })

  const { mutate: resolveConflicts, isPending: isResolving } = useResolveSyncHistoryMutation(
    integrationId,
    history.id
  )

  const selectedCount = unresolvedConflicts.filter((c) => isSelectionReady(selections[c.id])).length
  const allResolved = unresolvedConflicts.length > 0 && selectedCount === unresolvedConflicts.length

  function updateSelection(changeId: string, patch: Partial<ResolutionSelection>) {
    setSelections((prev) => ({
      ...prev,
      [changeId]: { ...(prev[changeId] ?? { mode: null, manualValue: '' }), ...patch },
    }))
  }

  function getDisplayMode(change: SyncHistoryChange) {
    const pending = selections[change.id]?.mode
    return pending ?? getPersistedMode(change)
  }

  function getManualValue(change: SyncHistoryChange) {
    if (selections[change.id]?.mode === 'manual') return selections[change.id]?.manualValue ?? ''
    if (getPersistedMode(change) === 'manual') return change.chosenValue ?? ''
    return ''
  }

  function handleResolve() {
    if (!allResolved) return
    resolveConflicts(
      {
        resolutions: reviewableUpdates
          .filter((c) => isSelectionReady(selections[c.id]))
          .map((c) => ({
            changeId: c.id,
            chosenValue: getSelectionValue(c, selections[c.id]),
          })),
      },
      {
        onSuccess: () => {
          toast.success('Conflicts resolved')
          router.push(`/integrations/${integrationId}`)
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to resolve conflicts')
        },
      }
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Severity + actions row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/10 cursor-default">
                  {getSeverityLabel(unresolvedConflicts.length)}
                  <Info className="size-3 opacity-60" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-64 text-center">
                {getSeverityTooltip(unresolvedConflicts.length)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span>Last synced: {formatRelativeTime(history.syncedAt)}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setSelections(prev => ({ ...prev, ...createBulkSelections(unresolvedConflicts, 'local') }))}
            className="border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
          >
            Accept All Local
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setSelections(prev => ({ ...prev, ...createBulkSelections(unresolvedConflicts, 'incoming') }))}
            className="border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
          >
            Accept All External
          </Button>
        </div>
      </div>

      {/* Conflict table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_2fr_2fr_2.5rem] items-center gap-4 border-b border-gray-100 bg-gray-50/50 px-6 py-3">
          <div className="text-xs font-semibold uppercase tracking-widest text-gray-500">Field</div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
            <Database className="size-4" />
            Local (Current)
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
            <Server className="size-4" />
            Incoming Payload
          </div>
          <div className="text-right text-xs font-semibold uppercase tracking-widest text-gray-500">Action</div>
        </div>

        <div>
          {[
            { group: conflictUpdates, label: 'Conflicting Fields', isClean: false },
            { group: cleanUpdates, label: 'Non-conflicting Fields', isClean: true },
          ].map(({ group, label, isClean }) => group.length === 0 ? null : (
            <div key={label}>
              <div className="px-6 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</span>
              </div>
              {group.map((change) => {
            const isPendingConflict = unresolvedConflicts.some((item) => item.id === change.id)
            const displayMode = getDisplayMode(change)
            const manualValue = getManualValue(change)

            return (
              <div
                key={change.id}
                className={cn(
                  'border-b border-gray-100 px-6 py-4 transition-colors',
                  isPendingConflict && 'bg-amber-50/30'
                )}
              >
                <div className="grid grid-cols-[1fr_2fr_2fr_2.5rem] gap-4 items-start">
                  <div className="pt-3 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-gray-900">{change.fieldName}</span>
                      {isPendingConflict && <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        'text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border',
                        change.changeType === 'UPDATE' && 'bg-blue-50 text-blue-600 border-blue-200',
                        change.changeType === 'CREATE' && 'bg-green-50 text-green-600 border-green-200',
                        change.changeType === 'DELETE' && 'bg-red-50 text-red-600 border-red-200',
                      )}>
                        {change.changeType}
                      </span>
                      {isClean && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">
                          auto-apply
                        </span>
                      )}
                    </div>
                  </div>

                  <ResolutionOptionCard
                    side="local"
                    active={displayMode === 'local'}
                    dimmed={displayMode !== null && displayMode !== 'local'}
                    readOnly={isClean}
                    title="Local value"
                    meta="Current stored value"
                    value={change.currentValue}
                    onClick={() => updateSelection(change.id, { mode: 'local' })}
                  />

                  <ResolutionOptionCard
                    side="incoming"
                    active={displayMode === 'incoming'}
                    dimmed={displayMode !== null && displayMode !== 'incoming'}
                    readOnly={isClean}
                    title="Incoming value"
                    meta="Latest sync payload"
                    value={change.newValue}
                    onClick={() => updateSelection(change.id, { mode: 'incoming' })}
                  />

                  <div className="flex justify-end pt-3">
                    {!isClean && (
                      <button
                        type="button"
                        onClick={() => updateSelection(change.id, { mode: 'manual' })}
                        className="p-1 text-gray-400 transition-colors hover:text-gray-900"
                        title="Edit manually"
                      >
                        <PencilLine className="size-4" />
                      </button>
                    )}
                  </div>
                </div>

                {displayMode === 'manual' && (
                  <div className="mt-4 grid grid-cols-[1fr_2fr_2fr_2.5rem] gap-4">
                    <div />
                    <div className="col-span-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
                      <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500">
                        Manual Value
                      </label>
                      <input
                        type="text"
                        value={manualValue}
                        onChange={(e) =>
                          updateSelection(change.id, { mode: 'manual', manualValue: e.target.value })
                        }
                        placeholder="Enter a custom value"
                        className="mt-3 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-900/10"
                      />
                    </div>
                    <div />
                  </div>
                )}
              </div>
            )
          })}
            </div>
          ))}
        </div>
      </div>


      {/* Resolve button */}
      <div className="flex justify-end">
        <Button
          onClick={handleResolve}
          disabled={!allResolved || isResolving}
          className="bg-black text-white hover:bg-gray-800 disabled:bg-slate-200 disabled:text-slate-500"
        >
          {isResolving
            ? 'Resolving…'
            : `Resolve Conflicts${selectedCount > 0 ? ` (${selectedCount}/${unresolvedConflicts.length})` : ''}`}
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ResolveConflictsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data: integration, isPending: integrationLoading } = useIntegrationQuery(id)
  const { data: histories = [], isPending: historiesLoading } = useSyncHistoriesQuery(id)

  const latestHistory = histories[0]
  const latestConflictHistory = hasBlockingConflict(latestHistory) ? latestHistory : null
  const unresolvedConflicts = useMemo(
    () => getUnresolvedConflictChanges(latestConflictHistory),
    [latestConflictHistory]
  )

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 flex flex-col gap-8">

      {/* Back + header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/integrations/${id}`}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {integrationLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <Skeleton className="h-7 w-40" />
            </div>
          ) : integration ? (
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-semibold text-white shadow-sm shrink-0"
                style={{ backgroundColor: integration.color }}
              >
                {integration.name[0]}
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{integration.name}</h1>
                <p className="text-sm text-gray-500 font-mono">Resolve Conflicts</p>
              </div>
            </div>
          ) : (
            <p className="text-red-600 text-sm">Integration not found</p>
          )}
        </div>

        <div className="flex flex-col items-stretch sm:items-end gap-2">
          <p className="text-sm font-medium text-amber-700">
            Resolve the latest conflict before starting another sync.
          </p>
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="outline"
              className="border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-500"
              disabled
            >
              <RefreshCw className="size-4" />
              Sync Now
            </Button>
            <Link
              href={`/integrations/${id}`}
              className={cn(buttonVariants({ variant: 'outline' }), 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50')}
            >
              Skip for now
            </Link>
          </div>
        </div>
      </div>

      {/* Body */}
      {historiesLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-72 rounded-lg" />
          <Skeleton className="h-[420px] w-full rounded-lg" />
        </div>
      ) : !latestConflictHistory || unresolvedConflicts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-6 py-16 text-center">
          <CheckCircle2 className="mx-auto size-10 text-green-500 mb-3" />
          <p className="text-base font-medium text-gray-900">No active conflicts</p>
          <p className="text-sm text-gray-500 mt-1">
            The latest sync is no longer blocked. Return to the integration to run another sync.
          </p>
          <Link
            href={`/integrations/${id}`}
              className={cn(buttonVariants({ size: 'lg' }), 'mt-6 inline-flex bg-black text-white hover:bg-gray-800')}
          >
            Back to Integration
          </Link>
        </div>
      ) : (
            <ConflictResolver
          key={latestConflictHistory.id}
          integrationId={id}
          history={latestConflictHistory}
        />
      )}
    </main>
  )
}
