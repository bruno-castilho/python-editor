'use client'

import { TablePagination as TablePaginationMUI } from '@mui/material'
import type { Route } from 'next'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface TablePaginationProps {
  totalCount: number | undefined
  disabled: boolean
}

export function TablePagination({
  totalCount,
  disabled,
}: TablePaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const page = Number(searchParams.get('page') ?? 0)
  const rowsPerPage = Number(searchParams.get('perPage') ?? 10)

  function updateParams(newParams: Record<string, string | number>) {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(newParams).forEach(([key, value]) => {
      params.set(key, String(value))
    })

    router.replace(`${pathname}?${params.toString()}` as Route)
  }

  function handleChangePage(
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) {
    updateParams({ page: newPage })
  }

  function handleChangeRowsPerPage(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    updateParams({
      perPage: parseInt(event.target.value, 10),
      page: 0,
    })
  }

  return (
    <TablePaginationMUI
      component="div"
      rowsPerPageOptions={[10, 25, 50, 100]}
      count={totalCount || 0}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      disabled={disabled}
    />
  )
}
