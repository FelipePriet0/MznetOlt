'use client'

import { useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useApi } from '@/hooks/use-api'
import { oltApi } from '@/lib/api/olt'
import { Skeleton } from '@/components/shared/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowLeft, History, AlertTriangle } from 'lucide-react'

export default function OltHistoryPage() {
  const params = useParams<{ id: string }>()
  const oltId  = Number(params.id)
  const router = useRouter()

  const fetcher = useCallback(() => oltApi.history(oltId), [oltId])
  const { data, loading } = useApi(fetcher, [oltId])

  return (
    <div className="flex flex-col gap-6 p-8">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded p-1.5 text-muted-foreground hover:bg-muted transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <History className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Histórico</h1>
          <p className="text-sm text-muted-foreground">Registro de ações realizadas na OLT</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium">Ação</th>
              <th className="px-4 py-3 text-left font-medium w-56">Usuário</th>
              <th className="px-4 py-3 text-left font-medium w-44">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                </tr>
              ))
            ) : !data?.items.length ? (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <AlertTriangle className="h-6 w-6" />
                    <p className="text-sm">Nenhum registro encontrado.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.items.map(item => (
                <tr key={item.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">{item.action}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.user_email ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {new Date(item.created_at).toLocaleString('pt-BR', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {data && data.total > 0 && (
          <div className="border-t px-4 py-3 text-xs text-muted-foreground">
            {data.total} registro{data.total !== 1 ? 's' : ''} no total
          </div>
        )}
      </div>

    </div>
  )
}
