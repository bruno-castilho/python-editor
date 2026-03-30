import { TablePagination } from '@/components/TablePagination'
import { TableSortLabel } from '@/components/TableSortLabel'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'

export default function Page() {
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
              <TableSortLabel label="updated_at" defaultLabel="updated_at">
                Updated at
              </TableSortLabel>
            </TableCell>
            <TableCell align="center" sx={{ minWidth: 200 }}>
              Shared with
            </TableCell>
            <TableCell sx={{ width: 200 }} align="right" />
          </TableRow>
        </TableHead>
        <TableBody></TableBody>
      </Table>
      <TablePagination disabled={true} totalCount={0} />
    </TableContainer>
  )
}
