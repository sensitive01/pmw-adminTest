'use client'

// React Imports
import React from 'react';
import { Fragment } from 'react';
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility'
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close'
import Checkbox from '@mui/material/Checkbox';
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFacetedMinMaxValues,
    getPaginationRowModel,
    getSortedRowModel
} from '@tanstack/react-table'
import axios from 'axios'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Status color mapping for vendor status
export const statusChipColor = {
    approved: { color: 'success' },
    pending: { color: 'warning' },
    rejected: { color: 'error' },
    suspended: { color: '#666CFF' }
};

const fuzzyFilter = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value)

    addMeta({
        itemRank
    })

    return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
    const [value, setValue] = useState(initialValue)

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value)
        }, debounce)

        return () => clearTimeout(timeout)
    }, [value, debounce, onChange])

    return (
        <TextField
            {...props}
            value={value}
            onChange={e => setValue(e.target.value)}
            size="small"
        />
    );
};

const columnHelper = createColumnHelper()

// Vendor Settlement History Modal Component
const VendorSettlementHistoryModal = ({ open, handleClose, vendorId }) => {
    const [settlementHistory, setSettlementHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });

    const fetchSettlementHistory = async () => {
        if (!vendorId || !open) return;

        setLoading(true);
        setError(null);
        setSettlementHistory([]);

        try {
            const response = await fetch(`${API_URL}/vendor/fetchsettlement/${vendorId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result && result.message && Array.isArray(result.data)) {
                setSettlementHistory(result.data);
            } else {
                setError('Received unexpected data format from server');
            }
        } catch (err) {
            console.error("Failed to fetch settlement history:", err);
            setError(err.message || "Failed to fetch settlement history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettlementHistory();
    }, [vendorId, open]);

    const formatCurrency = (value) => {
        if (value === null || value === undefined || isNaN(value)) return '₹0.00';
        return `₹${parseFloat(value).toFixed(2)}`;
    };

    const columns = [
        {
            field: 'serialNo',
            headerName: 'S.No',
            width: 80,
            renderCell: (params) => (
                params.api.getRowIndexRelativeToVisibleRows(params.id) + 1
            ),
        },
        {
            field: '_id',
            headerName: 'settlement ID',
            width: 220,
            renderCell: (params) => (
                <Typography variant="body2" style={{ color: '#666' }}>
                    {params.value}
                </Typography>
            ),
        },
        {
            field: 'parkingamout',
            headerName: 'Parking Amount',
            width: 150,
            renderCell: (params) => formatCurrency(params.value),
        },
        {
            field: 'platformfee',
            headerName: 'Platform Fee',
            width: 150,
            renderCell: (params) => formatCurrency(params.value),
        },
        {
            field: 'gst',
            headerName: 'GST',
            width: 120,
            renderCell: (params) => formatCurrency(params.value),
        },
        {
            field: 'tds',
            headerName: 'TDS',
            width: 120,
            renderCell: (params) => {
                const tdsValue = Array.isArray(params.value) ? params.value[0] : '0.00';
                return formatCurrency(tdsValue);
            },
        },
        {
            field: 'payableammout',
            headerName: 'Payable Amount',
            width: 150,
            renderCell: (params) => formatCurrency(params.value),
        },
        {
            field: 'date',
            headerName: 'Date',
            width: 120,
        },
        {
            field: 'time',
            headerName: 'Time',
            width: 120,
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 150,
            renderCell: (params) => {
                const status = params.value?.toLowerCase() || 'pending';
                const statusMap = {
                    completed: { color: 'success', label: 'Completed' },
                    pending: { color: 'warning', label: 'Pending' },
                    failed: { color: 'error', label: 'Failed' },
                    processing: { color: 'info', label: 'Processing' },
                    settled: { color: 'success', label: 'Settled' }
                };

                const currentStatus = statusMap[status] || statusMap.pending;
                return (
                    <Chip
                        label={currentStatus.label}
                        color={currentStatus.color}
                        variant="outlined"
                        size="small"
                    />
                );
            },
        },
    ];

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Vendor Settlement History
                    <IconButton aria-label="close" onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : settlementHistory.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>
                            No settlement history records found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            This vendor doesn't have any settlement history yet.
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ height: 500, width: '100%' }}>
                        <DataGrid
                            rows={settlementHistory}
                            columns={columns}
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}
                            pageSizeOptions={[10, 25, 50]}
                            getRowId={(row) => row._id}
                            sx={{
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#329a73',
                                    color: 'black',
                                },
                            }}
                            slots={{
                                toolbar: GridToolbar,
                            }}
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">Close</Button>
            </DialogActions>
        </Dialog>
    );
};

// Vendor Settlement Modal Component
const VendorSettlementModal = ({ open, handleClose, vendorId }) => {
    const [settlementData, setSettlementData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    // Fetch settlement data with pagination
    const fetchSettlementData = async (page = 0, size = paginationModel.pageSize) => {
        if (!vendorId || !open) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${API_URL}/vendor/fetchvendorbookingrelease/${vendorId}?page=${page + 1}&limit=${size}`
            );
            const data = await response.json();

            if (data.success && data.data) {
                // Filter out invalid entries
                const filteredData = data.data.filter(item =>
                    item && (
                        parseFloat(item.amount || 0) !== 0 ||
                        parseFloat(item.totalamount || 0) !== 0 ||
                        parseFloat(item.gstamount || 0) !== 0 ||
                        parseFloat(item.releasefee || 0) !== 0 ||
                        parseFloat(item.recievableamount || 0) !== 0
                    )
                );
                setSettlementData(filteredData);
                setRowCount(data.totalCount || filteredData.length);
            } else {
                setSettlementData([]);
                setRowCount(0);
            }
        } catch (err) {
            console.error("Failed to fetch settlement details:", err);
            setError(err.message || "Failed to fetch settlement details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettlementData(paginationModel.page, paginationModel.pageSize);
    }, [vendorId, open, paginationModel.page, paginationModel.pageSize]);

    const formatCurrency = (value) => {
        if (value === null || value === undefined || isNaN(value)) return '₹0.00';
        return `₹${parseFloat(value).toFixed(2)}`;
    };

    // Handle row selection
    const handleRowSelection = (newSelection) => {
        setSelectedRows(newSelection);
    };

    // Handle select all rows on current page
    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const newSelected = settlementData.map((row) => row._id);
            setSelectedRows(newSelected);
        } else {
            setSelectedRows([]);
        }
    };

    // Handle individual row selection
    const handleSelectRow = (rowId) => {
        setSelectedRows(prev => {
            if (prev.includes(rowId)) {
                return prev.filter(id => id !== rowId);
            } else {
                return [...prev, rowId];
            }
        });
    };

    // Check if all rows on current page are selected
    const isAllSelected = () => {
        if (settlementData.length === 0) return false;
        return settlementData.every(row => selectedRows.includes(row._id));
    };

    // Check if some rows on current page are selected
    const isSomeSelected = () => {
        if (settlementData.length === 0) return false;
        return settlementData.some(row => selectedRows.includes(row._id)) && !isAllSelected();
    };

    // Calculate totals for selected rows
    const calculateSelectedTotals = () => {
        return settlementData
            .filter((row) => selectedRows.includes(row._id))
            .reduce(
                (acc, item) => {
                    if (!item) return acc;

                    acc.amount += parseFloat(item.amount || 0);
                    acc.gstamount += parseFloat(item.gstamount || 0);
                    acc.totalamount += parseFloat(item.totalamount || 0);
                    acc.releasefee += parseFloat(item.releasefee || 0);
                    acc.recievableamount += parseFloat(item.recievableamount || 0);

                    return acc;
                },
                {
                    amount: 0,
                    gstamount: 0,
                    totalamount: 0,
                    releasefee: 0,
                    recievableamount: 0,
                }
            );
    };

    // Calculate totals for all rows on current page
    const calculatePageTotals = () => {
        return settlementData.reduce(
            (acc, item) => {
                if (!item) return acc;

                acc.amount += parseFloat(item.amount || 0);
                acc.gstamount += parseFloat(item.gstamount || 0);
                acc.totalamount += parseFloat(item.totalamount || 0);
                acc.releasefee += parseFloat(item.releasefee || 0);
                acc.recievableamount += parseFloat(item.recievableamount || 0);

                return acc;
            },
            {
                amount: 0,
                gstamount: 0,
                totalamount: 0,
                releasefee: 0,
                recievableamount: 0,
            }
        );
    };

    // Handle settlement update
    const handleUpdateSettlement = async () => {
        if (selectedRows.length === 0) return;

        setUpdateLoading(true);
        setUpdateSuccess(false);

        try {
            const response = await fetch(`${API_URL}/vendor/updatebookingcont/${vendorId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bookingIds: selectedRows
                })
            });

            const data = await response.json();

            if (data.success) {
                setUpdateSuccess(true);
                // Refresh the data
                fetchSettlementData(paginationModel.page, paginationModel.pageSize);
                setSelectedRows([]);
            } else {
                throw new Error(data.message || "Failed to update settlement");
            }
        } catch (error) {
            console.error("Error updating settlement:", error);
            setError(error.message);
        } finally {
            setUpdateLoading(false);
            setTimeout(() => setUpdateSuccess(false), 3000);
        }
    };

    const columns = [
        {
            field: 'checkbox',
            headerName: '',
            width: 60,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderHeader: () => (
                <Checkbox
                    color="primary"
                    indeterminate={isSomeSelected()}
                    checked={isAllSelected()}
                    onChange={handleSelectAll}
                />
            ),
            renderCell: (params) => (
                <Checkbox
                    color="primary"
                    checked={selectedRows.includes(params.row._id)}
                    onChange={() => handleSelectRow(params.row._id)}
                />
            ),
        },
        {
            field: 'serialNo',
            headerName: 'S.No',
            width: 80,
            renderCell: (params) => (
                <Typography>
                    {paginationModel.page * paginationModel.pageSize +
                        params.api.getRowIndexRelativeToVisibleRows(params.id) +
                        1}
                </Typography>
            ),
        },
        {
            field: '_id',
            headerName: 'Booking ID',
            width: 220,
            renderCell: (params) => (
                <Typography style={{ color: '#666cff' }}>
                    {params.value}
                </Typography>
            ),
        },
        {
            field: 'amount',
            headerName: 'Amount',
            width: 120,
            renderCell: (params) => formatCurrency(params.value),
        },
        {
            field: 'gstamount',
            headerName: 'GST',
            width: 120,
            renderCell: (params) => formatCurrency(params.value),
        },
        {
            field: 'totalamount',
            headerName: 'Total Amount',
            width: 150,
            renderCell: (params) => formatCurrency(params.value),
        },
        {
            field: 'releasefee',
            headerName: 'Release Fee',
            width: 150,
            renderCell: (params) => formatCurrency(params.value),
        },
        {
            field: 'recievableamount',
            headerName: 'Receivable',
            width: 150,
            renderCell: (params) => (
                <Typography fontWeight="bold" color="#329a73">
                    {formatCurrency(params.value)}
                </Typography>
            ),
        },
        {
            field: 'settlementstatus',
            headerName: 'Settlement Status',
            width: 180,
            renderCell: (params) => {
                const status = params.value?.toLowerCase() || 'pending';
                const statusMap = {
                    completed: { color: 'success', label: 'Completed' },
                    pending: { color: 'warning', label: 'Pending' },
                    failed: { color: 'error', label: 'Failed' },
                    processing: { color: 'info', label: 'Processing' },
                    settled: { color: 'success', label: 'Settled' }
                };

                const currentStatus = statusMap[status] || statusMap.pending;

                return (
                    <Chip
                        label={currentStatus.label}
                        color={currentStatus.color}
                        variant="outlined"
                        size="small"
                    />
                );
            },
        },
    ];

    const selectedTotals = calculateSelectedTotals();
    const pageTotals = calculatePageTotals();

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Vendor Settlement Details
                    <IconButton aria-label="close" onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : settlementData.length === 0 ? (
                    <Alert severity="info">No settlement data available for this vendor</Alert>
                ) : (
                    <>
                        {updateSuccess && (
                            <Alert severity="success" sx={{ mb: 2 }}>
                                Settlement status updated successfully!
                            </Alert>
                        )}

                        <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                Summary Totals
                            </Typography>

                            {selectedRows.length > 0 ? (
                                <>
                                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                                        Selected {selectedRows.length} booking(s) on this page
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Selected Amount</Typography>
                                            <Typography variant="h6">{formatCurrency(selectedTotals.amount)}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Selected GST</Typography>
                                            <Typography variant="h6">{formatCurrency(selectedTotals.gstamount)}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Selected Total Amount</Typography>
                                            <Typography variant="h6">{formatCurrency(selectedTotals.totalamount)}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Selected Release Fee</Typography>
                                            <Typography variant="h6">{formatCurrency(selectedTotals.releasefee)}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Selected Receivable</Typography>
                                            <Typography variant="h6" color="#329a73" fontWeight="bold">
                                                {formatCurrency(selectedTotals.recievableamount)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </>
                            ) : (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Page Amount</Typography>
                                        <Typography variant="h6">{formatCurrency(pageTotals.amount)}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Page GST</Typography>
                                        <Typography variant="h6">{formatCurrency(pageTotals.gstamount)}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Page Total Amount</Typography>
                                        <Typography variant="h6">{formatCurrency(pageTotals.totalamount)}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Page Release Fee</Typography>
                                        <Typography variant="h6">{formatCurrency(pageTotals.releasefee)}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Page Receivable</Typography>
                                        <Typography variant="h6" color="#329a73" fontWeight="bold">
                                            {formatCurrency(pageTotals.recievableamount)}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Bookings
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {selectedRows.length > 0
                                    ? `${selectedRows.length} selected on this page (${rowCount} total records)`
                                    : `Showing ${settlementData.length} of ${rowCount} total records`}
                            </Typography>
                        </Box>

                        <Box sx={{ height: 500, width: '100%' }}>
                            <DataGrid
                                rows={settlementData}
                                columns={columns}
                                rowCount={rowCount}
                                paginationMode="server"
                                paginationModel={paginationModel}
                                onPaginationModelChange={setPaginationModel}
                                pageSizeOptions={[10, 25, 50, 100]}
                                checkboxSelection={false}
                                disableRowSelectionOnClick
                                getRowId={(row) => row._id || Math.random().toString(36).substring(2, 9)}
                                sx={{
                                    '& .MuiDataGrid-columnHeaders': {
                                        backgroundColor: '#329a73',
                                        color: 'black',
                                    },
                                }}
                                slots={{
                                    toolbar: GridToolbar,
                                }}
                            />
                        </Box>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">Close</Button>
                {selectedRows.length > 0 && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpdateSettlement}
                        disabled={updateLoading}
                        startIcon={updateLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {updateLoading ? 'Processing...' : `Settle Selected (${selectedRows.length})`}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

const VendorListTable = () => {
    const [rowSelection, setRowSelection] = useState({})
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [globalFilter, setGlobalFilter] = useState('')
    const [filteredData, setFilteredData] = useState([])
    const { lang: locale } = useParams()
    const { data: session } = useSession()
    const router = useRouter()
    const [vendorLoading, setVendorLoading] = useState({});
    const [vendorStatusMap, setVendorStatusMap] = useState({});

    // Modal states
    const [settlementModalOpen, setSettlementModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedVendorId, setSelectedVendorId] = useState(null);

    const handleOpenSettlementModal = (vendorId) => {
        setSelectedVendorId(vendorId);
        setSettlementModalOpen(true);
    };

    const handleCloseSettlementModal = () => {
        setSettlementModalOpen(false);
    };

    const handleOpenHistoryModal = (vendorId) => {
        setSelectedVendorId(vendorId);
        setHistoryModalOpen(true);
    };

    const handleCloseHistoryModal = () => {
        setHistoryModalOpen(false);
    };

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/vendor/all-vendors`)
            const result = await response.json()

            if (result && result.data) {
                setData(result.data)
                setFilteredData(result.data)
            } else {
                setData([])
                setFilteredData([])
            }
        } catch (error) {
            console.error("Error fetching vendor data:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchVendors()
    }, [])

    const updateVendorStatus = async (vendorId, newStatus) => {
        setVendorLoading(prev => ({ ...prev, [vendorId]: true }));

        try {
            const endpoint = newStatus === 'approved'
                ? `${API_URL}/vendor/approve/${vendorId}`
                : `${API_URL}/vendor/updateStatus/${vendorId}`;

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error('Failed to update vendor status');

            setVendorStatusMap(prev => ({ ...prev, [vendorId]: newStatus }));

            return true;
        } catch (error) {
            console.error('Error updating vendor status:', error);
            return false;
        } finally {
            setVendorLoading(prev => ({ ...prev, [vendorId]: false }));
        }
    };

    const columns = useMemo(
        () => [
            {
                id: 'serialNo',
                header: 'S.No',
                cell: ({ row }) => (
                    <Typography>{row.index + 1}</Typography>
                )
            },
            columnHelper.accessor('vendorId', {
                header: 'Vendor ID',
                cell: ({ row }) => <Typography style={{ color: '#666cff' }}>#{row.original.vendorId}</Typography>
            }),
            columnHelper.accessor('vendorName', {
                header: 'Vendor Name',
                cell: ({ row }) => {
                    const vendor = row.original;
                    const imgSrc = vendor.image || "https://demos.pixinvent.com/materialize-nextjs-admin-template/demo-1/images/avatars/1.png";

                    return (
                        <div className="flex items-center gap-3">
                            {vendor.image ? (
                                <img
                                    src={imgSrc}
                                    alt="Vendor Avatar"
                                    className="w-8 h-8 rounded-full"
                                />
                            ) : (
                                <CustomAvatar skin='light' size={34}>
                                    {getInitials(vendor.vendorName)}
                                </CustomAvatar>
                            )}

                            <div className="flex flex-col">
                                <Typography className="font-medium">{vendor.vendorName}</Typography>
                                <Typography variant="body2">{vendor.spaceid}</Typography>
                            </div>
                        </div>
                    );
                }
            }),
            columnHelper.accessor('contacts', {
                header: 'Contact Info',
                cell: ({ row }) => {
                    const contacts = row.original.contacts || [];
                    const primaryContact = contacts[0] || { name: 'N/A', mobile: 'N/A' };

                    return (
                        <div className="flex flex-col">
                            <Typography className="font-medium">{primaryContact.name}</Typography>
                            <Typography variant="body2">{primaryContact.mobile}</Typography>
                            {contacts.length > 1 && (
                                <Typography variant="caption" color="text.secondary">
                                    +{contacts.length - 1} more contacts
                                </Typography>
                            )}
                        </div>
                    );
                }
            }),
            columnHelper.accessor('status', {
                header: 'Status',
                cell: ({ row }) => {
                    const vendorId = row.original._id;
                    const isLoading = vendorLoading[vendorId] || false;
                    const currentStatus = vendorStatusMap[vendorId] || row.original.status || 'pending';

                    const toggleStatus = async () => {
                        if (isLoading || currentStatus !== 'pending') return;

                        const success = await updateVendorStatus(vendorId, 'approved');

                        if (!success) {
                            // Optional: rollback or show toast
                        }
                    };

                    const chipStyles = {
                        backgroundColor: currentStatus === 'pending' ? '#ff4d4f' : '#52c41a',
                        color: 'black',
                        cursor: currentStatus === 'pending' ? 'pointer' : 'default',
                        opacity: isLoading ? 0.7 : 1,
                        '&:hover': currentStatus === 'pending' ? {
                            backgroundColor: '#ff7875',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        } : {}
                    };

                    const chip = (
                        <Chip
                            label={isLoading ? '...' : (currentStatus || 'Pending')}
                            variant="tonal"
                            size="small"
                            sx={chipStyles}
                            onClick={currentStatus === 'pending' ? toggleStatus : undefined}
                        />
                    );

                    return currentStatus === 'pending' ? (
                        <Tooltip title="Click to approve">{chip}</Tooltip>
                    ) : chip;
                }
            }),
            columnHelper.accessor('actions', {
                header: 'Actions',
                cell: ({ row }) => {
                    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
                    const [deleteLoading, setDeleteLoading] = useState(false);

                    const handleDeleteVendor = async () => {
                        try {
                            setDeleteLoading(true);
                            const response = await fetch(`${API_URL}/admin/deletevendor/${row.original.vendorId}`, {
                                method: 'DELETE',
                            });

                            if (!response.ok) {
                                throw new Error('Failed to delete vendor');
                            }

                            setDeleteDialogOpen(false);
                            fetchVendors();

                        } catch (error) {
                            console.error('Error deleting vendor:', error);
                        } finally {
                            setDeleteLoading(false);
                        }
                    };

                    return (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="outlined"
                                size="small"
                                color="primary"
                                startIcon={<VisibilityIcon />}
                                onClick={() => handleOpenSettlementModal(row.original._id)}
                            >
                                View
                            </Button>

                            <Button
                                variant="outlined"
                                size="small"
                                color="secondary"
                                startIcon={<HistoryIcon />}
                                onClick={() => handleOpenHistoryModal(row.original._id)}
                            >
                                Vendor Payouts
                            </Button>

                            <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                Delete
                            </Button>

                            <Dialog
                                open={deleteDialogOpen}
                                onClose={() => setDeleteDialogOpen(false)}
                            >
                                <DialogTitle>Confirm Deletion</DialogTitle>
                                <DialogContent>
                                    <Typography>
                                        Are you sure you want to delete vendor <strong>{row.original.vendorName}</strong> (ID: {row.original.vendorId})?
                                        This action cannot be undone.
                                    </Typography>
                                </DialogContent>
                                <DialogActions>
                                    <Button
                                        onClick={() => setDeleteDialogOpen(false)}
                                        color="primary"
                                        disabled={deleteLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleDeleteVendor}
                                        color="error"
                                        variant="contained"
                                        disabled={deleteLoading}
                                        startIcon={deleteLoading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                                    >
                                        {deleteLoading ? 'Deleting...' : 'Delete'}
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </Box>
                    );
                }
            })
        ],
        [data, filteredData, vendorLoading, vendorStatusMap]
    );

    const table = useReactTable({
        data: filteredData.length > 0 || globalFilter ? filteredData : data,
        columns,
        filterFns: {
            fuzzy: fuzzyFilter
        },
        state: {
            rowSelection,
            globalFilter
        },
        initialState: {
            pagination: {
                pageSize: 10
            }
        },
        enableRowSelection: true,
        globalFilterFn: fuzzyFilter,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues()
    });

    return (
        <Card>
            <CardHeader title='Vendor Settlement' />
            <Divider />
            <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
                <DebouncedInput
                    value={globalFilter ?? ''}
                    onChange={value => setGlobalFilter(String(value))}
                    placeholder='Search Vendors'
                    className='sm:is-auto'
                />
            </CardContent>
            <div className='overflow-x-auto'>
                <table className={tableStyles.table}>
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id}>
                                        {header.isPlaceholder ? null : (
                                            <>
                                                <div
                                                    className={classnames({
                                                        'flex items-center': header.column.getIsSorted(),
                                                        'cursor-pointer select-none': header.column.getCanSort()
                                                    })}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {{
                                                        asc: <i className='ri-arrow-up-s-line text-xl' />,
                                                        desc: <i className='ri-arrow-down-s-line text-xl' />
                                                    }[header.column.getIsSorted()] ?? null}
                                                </div>
                                            </>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    {table.getFilteredRowModel().rows.length === 0 ? (
                        <tbody>
                            <tr>
                                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                                    {loading ? 'Loading vendor data...' : 'No vendors found'}
                                </td>
                            </tr>
                        </tbody>
                    ) : (
                        <tbody>
                            {table
                                .getRowModel()
                                .rows.slice(0, table.getState().pagination.pageSize)
                                .map(row => {
                                    return (
                                        <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                            ))}
                                        </tr>
                                    )
                                })}
                        </tbody>
                    )}
                </table>
            </div>
            <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component='div'
                className='border-bs'
                count={table.getFilteredRowModel().rows.length}
                rowsPerPage={table.getState().pagination.pageSize}
                page={table.getState().pagination.pageIndex}
                SelectProps={{
                    inputProps: { 'aria-label': 'rows per page' }
                }}
                onPageChange={(_, page) => {
                    table.setPageIndex(page)
                }}
                onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
            />

            {/* Vendor Settlement Modal */}
            <VendorSettlementModal
                open={settlementModalOpen}
                handleClose={handleCloseSettlementModal}
                vendorId={selectedVendorId}
            />

            {/* Vendor Settlement History Modal */}
            <VendorSettlementHistoryModal
                open={historyModalOpen}
                handleClose={handleCloseHistoryModal}
                vendorId={selectedVendorId}
            />
        </Card>
    )
}

export default VendorListTable
