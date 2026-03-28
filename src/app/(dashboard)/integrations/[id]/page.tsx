'use client'

import { use, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, Clock, ListChecks, AlertTriangle, Heart, CheckCircle, XCircle, GitMerge, Loader2 } from 'lucide-react'
import { useIntegrationQuery } from '@/api/queries/integrations'
import { useSyncHistoriesQuery } from '@/api/queries/sync-histories'
import { useSyncMutation } from '@/api/mutations/sync'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatRelativeTime } from '@/lib/utils'
import { getUnresolvedConflictChanges, hasBlockingConflict } from '@/lib/syncHistory'
import type { SyncHistory, SyncStatus } from '@/types'

// ---------------------------------------------------------------------------
// Sync status badge
// ---------------------------------------------------------------------------

const syncStatusConfig: Record<SyncStatus, { label: string; icon: React.ReactNode; className: string }> = {
  SUCCESS: { label: 'Success', icon: <CheckCircle className="w-3.5 h-3.5" />, className: 'bg-green-50 text-green-700 border-green-200' },
  CONFLICT: { label: 'Conflict', icon: <GitMerge className="w-3.5 h-3.5" />, className: 'bg-amber-50 text-amber-700 border-amber-200' },
  FAILED: { label: 'Failed', icon: <XCircle className="w-3.5 h-3.5" />, className: 'bg-red-50 text-red-700 border-red-200' },
}

function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const { label, icon, className } = syncStatusConfig[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', className)}>
      {icon}
      {label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

interface StatCardProps {
  title: string
  icon: React.ReactNode
  value: React.ReactNode
  sub: React.ReactNode
  accent?: boolean
}

function StatCard({ title, icon, value, sub, accent }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-4 flex flex-col gap-3 flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{title}</span>
        <span className={cn('text-gray-400', accent && 'bg-amber-50 text-amber-500 p-1.5 rounded-lg')}>{icon}</span>
      </div>
      <div className={cn('text-2xl font-semibold', accent ? 'text-amber-600' : 'text-gray-900')}>
        {value}
      </div>
      <div>{sub}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Derived stats from sync histories
// ---------------------------------------------------------------------------

function useStats(histories: SyncHistory[]) {
  return useMemo(() => {
    const lastSuccess = histories.find(h => h.status === 'SUCCESS')
    const activeConflicts = histories.filter(h => h.status === 'CONFLICT').length
    const total = histories.length
    const successCount = histories.filter(h => h.status === 'SUCCESS').length
    const health = total > 0 ? ((successCount / total) * 100).toFixed(1) : '—'

    const pendingUpdates = histories
      .flatMap(h => h.changes ?? [])
      .filter(c => c.newValue && !c.chosenValue)
      .length

    return { lastSuccess, activeConflicts, health, pendingUpdates }
  }, [histories])
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function IntegrationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data: integration, isPending: integrationLoading } = useIntegrationQuery(id)
  const { data: histories = [], isPending: historiesLoading } = useSyncHistoriesQuery(id)
  const { mutate: triggerSync, isPending: syncing } = useSyncMutation(id)

  const { lastSuccess, activeConflicts, health, pendingUpdates } = useStats(histories)
  const latestHistory = histories[0]
  const syncBlocked = hasBlockingConflict(latestHistory)

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 flex flex-col gap-8">

      {/* Back + header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/integrations"
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
              <h1 className="text-2xl font-semibold text-gray-900">{integration.name}</h1>
            </div>
          ) : (
            <p className="text-red-600 text-sm">Integration not found</p>
          )}
        </div>

        <div className="flex flex-col items-stretch sm:items-end gap-2">
          {syncBlocked && (
            <p className="text-sm font-medium text-amber-700">
              Resolve the latest conflict before starting another sync.
            </p>
          )}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            {syncBlocked && (
              <Link
                href={`/integrations/${id}/resolve-conflicts`}
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'bg-amber-500 text-white hover:bg-amber-600'
                )}
              >
                Resolve Conflicts
              </Link>
            )}
            <Button
              onClick={() => triggerSync()}
              disabled={syncing || syncBlocked}
              size="lg"
              className="bg-black text-white hover:bg-gray-800 disabled:bg-slate-200 disabled:text-slate-500"
            >
              {syncing
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <RefreshCw strokeWidth={1.5} className="w-4 h-4" />
              }
              {syncing ? 'Syncing…' : 'Sync Now'}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {historiesLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="flex-1 h-32 rounded-lg" />
          ))
        ) : (
          <>
            <StatCard
              title="Last Successful Sync"
              icon={<Clock className="w-4 h-4" />}
              value={lastSuccess ? formatRelativeTime(lastSuccess.syncedAt) : 'Never'}
              sub={
                lastSuccess
                  ? <span className="flex items-center gap-1.5 text-sm text-green-600"><CheckCircle className="w-3.5 h-3.5" /> System stable</span>
                  : <span className="text-sm text-gray-400">No syncs yet</span>
              }
            />
            <StatCard
              title="Pending Updates"
              icon={<ListChecks className="w-4 h-4" />}
              value={pendingUpdates}
              sub={<span className="text-sm text-gray-500">Auto-resolvable changes</span>}
            />
            <StatCard
              title="Active Conflicts"
              icon={<AlertTriangle className="w-4 h-4" />}
              value={activeConflicts}
              sub={
                activeConflicts > 0
                  ? <span className="text-sm text-amber-600 font-medium">Require manual review</span>
                  : <span className="text-sm text-gray-400">No conflicts</span>
              }
              accent={activeConflicts > 0}
            />
            <StatCard
              title="Integration Health"
              icon={<Heart className="w-4 h-4" />}
              value={health === '—' ? '—' : `${health}%`}
              sub={
                <span className="flex items-center gap-1.5 text-sm text-green-600">
                  <svg viewBox="0 0 40 16" className="w-8 h-4 stroke-green-500 fill-none stroke-2">
                    <polyline points="0,12 8,8 16,10 24,4 32,6 40,2" />
                  </svg>
                  Last 7d uptime
                </span>
              }
            />
          </>
        )}
      </div>

      {/* Sync history table */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Sync History</h2>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 bg-gray-50/50">
            <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-widest">Status</div>
            <div className="col-span-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Synced At</div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-widest">Changes</div>
            <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-widest">Conflicts</div>
          </div>

          {historiesLoading && (
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                  <div className="col-span-3"><Skeleton className="h-6 w-20 rounded-full" /></div>
                  <div className="col-span-4"><Skeleton className="h-4 w-36" /></div>
                  <div className="col-span-2"><Skeleton className="h-4 w-8" /></div>
                  <div className="col-span-3"><Skeleton className="h-4 w-8" /></div>
                </div>
              ))}
            </div>
          )}

          {!historiesLoading && histories.length === 0 && (
            <div className="px-6 py-16 text-center text-base text-gray-400">
              No sync history yet. Click <span className="font-medium text-gray-600">Sync Now</span> to run the first sync.
            </div>
          )}

          {!historiesLoading && histories.length > 0 && (
            <div className="divide-y divide-gray-100">
              {histories.map(h => {
                const conflictCount = getUnresolvedConflictChanges(h).length
                return (
                  <div key={h.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/80 transition-colors">
                    <div className="md:col-span-3">
                      <SyncStatusBadge status={h.status} />
                    </div>
                    <div className="md:col-span-4 text-sm text-gray-600">
                      {new Date(h.syncedAt).toLocaleString()}
                    </div>
                    <div className="md:col-span-2 text-sm text-gray-600">
                      {(h.changes ?? []).length}
                    </div>
                    <div className="md:col-span-3 text-sm">
                      {conflictCount > 0
                        ? <span className="text-amber-600 font-medium">{conflictCount} conflict{conflictCount > 1 ? 's' : ''}</span>
                        : <span className="text-gray-400">—</span>
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
