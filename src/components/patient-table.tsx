
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus, Trash2, Loader2, Pencil, FileText } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Patient, provinces, getCitiesByProvince } from "@/lib/patient-data"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { deletePatient } from "@/app/actions"


const ActionCell = ({ row }: { row: any }) => {
  const patient = row.original as Patient
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deletePatient(patient.examId);
    setIsDeleting(false);
    setIsAlertOpen(false);

    if (result.error) {
      toast({
        title: "Gagal Menghapus",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Data Terhapus",
        description: `Data pasien ${patient.name} telah dihapus.`,
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem>
            <Link href={`/master/${patient.examId}`} className="flex items-center w-full">
                <FileText className="mr-2 h-4 w-4" />
                Lihat Data
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href={`/master/${patient.examId}/edit`} className="flex items-center w-full">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Pasien
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
            onClick={() => setIsAlertOpen(true)}
          >
             <Trash2 className="mr-2 h-4 w-4" />
             Hapus Pasien
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data pasien secara permanen dari server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Ya, hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}


export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "examId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nomor Urut
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("examId")}</div>,
  },
  {
    accessorKey: "name",
    header: "Nama Pasien",
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
    {
    accessorKey: "examDate",
    header: "Tanggal Pemeriksaan",
    cell: ({ row }) => {
       try {
         const date = new Date(row.getValue("examDate"));
         // Check if date is valid
         if (isNaN(date.getTime())) return "-";
         return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(date);
       } catch (e) {
         return row.getValue("examDate");
       }
    },
  },
  {
    accessorKey: "province",
    header: "Provinsi",
    cell: ({ row }) => <div>{row.getValue("province")}</div>,
  },
    {
    accessorKey: "city",
    header: "Kota/Kabupaten",
    cell: ({ row }) => <div>{row.getValue("city")}</div>,
  },
  {
    accessorKey: "district",
    header: "Kecamatan",
    cell: ({ row }) => <div>{row.getValue("district")}</div>,
  },
  {
    accessorKey: "patientCategory",
    header: "Kategori Pasien",
    cell: ({ row }) => <div>{row.getValue("patientCategory")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ActionCell,
  },
]

export function PatientTable({ data }: { data: Patient[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const [provinceFilter, setProvinceFilter] = React.useState<string>("all")
  const [cityFilter, setCityFilter] = React.useState<string>("all")
  const [cities, setCities] = React.useState<string[]>([]);
  
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })
  
  React.useEffect(() => {
    table.getColumn("province")?.setFilterValue(provinceFilter === "all" ? "" : provinceFilter);
    if (provinceFilter !== 'all') {
        setCities(getCitiesByProvince(provinceFilter) || []);
    } else {
        setCities([]);
    }
    setCityFilter('all');
    table.getColumn("city")?.setFilterValue("");
  }, [provinceFilter, table]);

  React.useEffect(() => {
    table.getColumn("city")?.setFilterValue(cityFilter === "all" ? "" : cityFilter);
  }, [cityFilter, table]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
           <Input
              placeholder="Cari nama pasien..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <Select value={provinceFilter} onValueChange={setProvinceFilter}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter Provinsi" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Semua Provinsi</SelectItem>
                    {provinces.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={cityFilter} onValueChange={setCityFilter} disabled={provinceFilter === 'all'}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter Kota" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Semua Kota</SelectItem>
                    {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <div className="flex items-center gap-2">
            <Link href="/" passHref>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Data
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Kolom <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    const headerMap: Record<string, string> = {
                        examId: "Nomor Urut",
                        name: "Nama Pasien",
                        examDate: "Tanggal Pemeriksaan",
                        province: "Provinsi",
                        city: "Kota/Kabupaten",
                        district: "Kecamatan",
                        patientCategory: "Kategori Pasien"
                    }
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                       {headerMap[column.id] || column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} dari{" "}
          {table.getFilteredRowModel().rows.length} baris terpilih.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  )
}
