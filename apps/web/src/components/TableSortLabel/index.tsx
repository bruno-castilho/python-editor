'use client'

import { TableSortLabel as TableSortLabelMUI } from '@mui/material'
import type { Route } from 'next'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'

interface TableSortLabelProps {
  label: string
  defaultLabel: string
  children: ReactNode
}

export function TableSortLabel({
  label,
  defaultLabel,
  children,
}: TableSortLabelProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const orderBy = (searchParams.get('orderBy') as 'asc' | 'desc') ?? 'asc'

  const sortBy = searchParams.get('sortBy') ?? defaultLabel

  function handleChangeOrder() {
    const params = new URLSearchParams(searchParams.toString())

    params.set('orderBy', orderBy === 'asc' ? 'desc' : 'asc')
    params.set('sortBy', label)

    router.push(`${pathname}?${params.toString()}` as Route)
  }

  return (
    <TableSortLabelMUI
      active={sortBy === label}
      direction={sortBy === label ? orderBy : 'asc'}
      onClick={handleChangeOrder}
    >
      {children}
    </TableSortLabelMUI>
  )
}
