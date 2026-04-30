'use client'
import { TablePagination } from '@/components/TablePagination'
import { TableSortLabel } from '@/components/TableSortLabel'
import { trpc } from '@/utils/trpc'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'
import {
  Link,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useSearchParams } from 'next/navigation'
import NextLink from 'next/link'

interface SharedWithMeTableRowProps {
  project: {
    id: string
    name: string
    createdBy: {
      email: string
    }
    updatedBy: {
      email: string
    }
    updatedAt: string
  }
}

function SharedWithMeTableRow({ project }: SharedWithMeTableRowProps) {
  return (
    <TableRow>
      <TableCell component="th" scope="row" align="left">
        <NextLink
          href={`/editor/${project.id}`}
          style={{ textDecoration: 'none' }}
        >
          <Link color="primary" component="span">
            {project.id}
          </Link>
        </NextLink>
      </TableCell>
      <TableCell component="th" scope="row" align="left">
        {project.name}
      </TableCell>

      <TableCell component="th" scope="row" align="left">
        {project.createdBy.email}
      </TableCell>

      <TableCell component="th" scope="row" align="left">
        {project.updatedBy.email}
      </TableCell>

      <TableCell component="th" scope="row" align="left">
        {formatDistanceToNow(project.updatedAt, {
          locale: enUS,
          addSuffix: true,
        })}
      </TableCell>
    </TableRow>
  )
}

function SharedWithMeTableRowSkeleton() {
  return (
    <TableRow>
      <TableCell component="th" scope="row" align="left">
        <Skeleton variant="text" />
      </TableCell>
      <TableCell component="th" scope="row" align="left">
        <Skeleton variant="text" />
      </TableCell>

      <TableCell component="th" scope="row" align="left">
        <Skeleton variant="text" />
      </TableCell>

      <TableCell component="th" scope="row" align="left">
        <Skeleton variant="text" />
      </TableCell>

      <TableCell component="th" scope="row" align="left">
        <Skeleton variant="text" />
      </TableCell>
    </TableRow>
  )
}

export default function Page() {
  const searchParams = useSearchParams()

  const page = Number(searchParams.get('page') ?? 0)
  const perPage = Number(searchParams.get('perPage') ?? 10)
  const rawSortBy = searchParams.get('sortBy') ?? 'updatedAt'
  const sortBy = rawSortBy === 'name' ? 'name' : 'updatedAt'
  const rawOrderBy = searchParams.get('orderBy') ?? 'desc'
  const orderBy = rawOrderBy === 'asc' ? 'asc' : 'desc'

  const { data, isPending } = useQuery(
    trpc.projects.findSharedWithMeProjects.queryOptions({
      page,
      perPage,
      sortBy,
      orderBy,
    }),
  )

  return (
    <>
      <TableContainer>
        <Table sx={{ width: '100%' }} size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left" sx={{ minWidth: 200 }}>
                ID
              </TableCell>
              <TableCell align="left" sx={{ minWidth: 200 }}>
                <TableSortLabel label="name" defaultLabel="name">
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell align="left" sx={{ minWidth: 200 }}>
                Created by
              </TableCell>
              <TableCell align="left" sx={{ minWidth: 200 }}>
                Updated by
              </TableCell>

              <TableCell align="left" sx={{ minWidth: 200 }}>
                <TableSortLabel label="updatedAt" defaultLabel="updatedAt">
                  Updated at
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isPending
              ? Array.from({ length: perPage }).map((_, index) => (
                  <SharedWithMeTableRowSkeleton key={index} />
                ))
              : (data?.projects ?? []).map((project) => (
                  <SharedWithMeTableRow key={project.id} project={project} />
                ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination disabled={isPending} totalCount={data?.totalCount} />
    </>
  )
}
