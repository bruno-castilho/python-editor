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
            <TableCell align="left">Created by</TableCell>
            <TableCell align="left">Updatet by</TableCell>

            <TableCell align="left" sx={{ minWidth: 200 }}>
              <TableSortLabel label="updated_at" defaultLabel="updated_at">
                Updatet at
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody></TableBody>
      </Table>
      <TablePagination disabled={true} totalCount={0} />
    </TableContainer>
  )
}
