'use client'
import { TablePagination } from '@/components/TablePagination'
import { TableSortLabel } from '@/components/TableSortLabel'
import { trpc } from '@/utils/trpc'
import { Add } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  IconButton,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface PersonalTableRowProps {
  project: {
    id: string
    name: string
    updatedBy: {
      email: string
    }
    updatedAt: string
    sharedWith: {
      id: string
      name: string
      lastName: string
      avatarUrl: string
    }[]
  }
}

function PersonalTableRow({ project }: PersonalTableRowProps) {
  const [openDialog, setOpenDialog] = useState<boolean>(false)

  function handleOpenDialog() {
    setOpenDialog(true)
  }

  function handleCloseDialog() {
    setOpenDialog(false)
  }

  async function handleRemoveFile() {
    console.log('removeFile')
  }

  return (
    <>
      <TableRow>
        <TableCell component="th" scope="row" align="left">
          {project.id}
        </TableCell>
        <TableCell component="th" scope="row" align="left">
          {project.name}
        </TableCell>

        <TableCell component="th" scope="row" align="left">
          {project.updatedBy.email}
        </TableCell>

        <TableCell component="th" scope="row" align="left">
          {formatDistanceToNow(project.updatedAt, {
            locale: ptBR,
            addSuffix: true,
          })}
        </TableCell>
        <TableCell
          component="th"
          scope="row"
          align="center"
          sx={{ maxWidth: '400px' }}
        >
          <Box component={AvatarGroup} display="flex" justifyContent="center">
            {project.sharedWith.slice(0, 3).map((user) => (
              <Avatar
                key={user.id}
                alt={`${user.name} ${user.lastName}`}
                src={user.avatarUrl ?? ''}
                sx={{
                  width: '1.5rem',
                  height: '1.5rem',
                  fontSize: '0.875rem',
                }}
              />
            ))}

            <Avatar
              sx={(theme) => ({
                bgcolor: theme.palette.primary.main,
                width: '1.5rem',
                height: '1.5rem',
                fontSize: '0.875rem',
              })}
            >
              <IconButton
                onClick={handleOpenDialog}
                sx={(theme) => ({
                  color: theme.palette.primary.contrastText,
                })}
              >
                <Add />
              </IconButton>
            </Avatar>
          </Box>
        </TableCell>
        <TableCell component="th" scope="row" align="right">
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={handleRemoveFile}
          >
            Remover
          </Button>
        </TableCell>
      </TableRow>
    </>
  )
}

function PersonalTableRowSkeleton() {
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
      <TableCell
        component="th"
        scope="row"
        align="center"
        sx={{ maxWidth: '400px' }}
      >
        <Box component={AvatarGroup} display="flex" justifyContent="center">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              variant="circular"
              width="1.5rem"
              height="1.5rem"
            />
          ))}
        </Box>
      </TableCell>
      <TableCell component="th" scope="row" align="right">
        <Box display="flex" justifyContent="right">
          <Skeleton variant="rounded" width={75} height={32} />
        </Box>
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
    trpc.projects.findPersonalProjects.queryOptions({
      page,
      perPage,
      sortBy,
      orderBy,
    }),
  )

  return (
    <TableContainer>
      <Table sx={{ width: '100%' }} size="small">
        <TableHead>
          <TableRow>
            <TableCell align="left" sx={{ minWidth: 260 }}>
              ID
            </TableCell>
            <TableCell align="left">
              <TableSortLabel label="name" defaultLabel="name">
                Name
              </TableSortLabel>
            </TableCell>
            <TableCell align="left">Updated by</TableCell>

            <TableCell align="left" sx={{ minWidth: 200 }}>
              <TableSortLabel label="updatedAt" defaultLabel="updatedAt">
                Updated at
              </TableSortLabel>
            </TableCell>
            <TableCell align="center" sx={{ minWidth: 200 }}>
              Shared with
            </TableCell>
            <TableCell sx={{ width: 200 }} align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {isPending
            ? Array.from({ length: perPage }).map((_, index) => (
                <PersonalTableRowSkeleton key={index} />
              ))
            : data?.projects.map((project) => (
                <PersonalTableRow key={project.id} project={project} />
              ))}
        </TableBody>
      </Table>
      <TablePagination disabled={isPending} totalCount={data?.totalCount} />
    </TableContainer>
  )
}
