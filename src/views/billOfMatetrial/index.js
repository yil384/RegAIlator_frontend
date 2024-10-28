import React from 'react';
import { DataGrid, GridToolbar } from '@material-ui/data-grid';
import { useTheme } from '@material-ui/styles';
import MainCard from '../../ui-component/cards/MainCard';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Checkbox from '@material-ui/core/Checkbox';
import { Typography } from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import Tooltip from '@material-ui/core/Tooltip';
import { fetchBillOfMaterials } from './helper'; // 假设的 API 用于获取数据

import { mentionUsers } from '../../views/authentication/session/auth.helper';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { NotificationsActive } from '@material-ui/icons';

const BillOfMaterials = () => {
    const theme = useTheme();

    const [materials, setMaterials] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [selectedIds, setSelectedIds] = React.useState([]);
    const [filterIds, setFilterIds] = React.useState([]);

    const loadData = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetchBillOfMaterials();
            const materialsData = response || [];

            materialsData.forEach((material, index) => {
                material.id = index + 1;
            });

            setMaterials(materialsData);
            setFilterIds(materialsData.map((material) => material.id));
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
            console.error('Failed to load Bill of Materials:', e);
            toast.error('Failed to load Bill of Materials');
        }
    }, []);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSelectAll = () => {
        const allRowIds = filterIds.map((id) => id);
        if (filterIds.every((id) => selectedIds.includes(id))) {
            setSelectedIds(selectedIds.filter((id) => !filterIds.includes(id)));
        } else {
            setSelectedIds([...new Set([...selectedIds, ...allRowIds])]);
        }
    };

    const columns = [
        // Selection Column
        {
            field: 'select',
            headerName: (
                <Checkbox
                    checked={
                        filterIds.length > 0 &&
                        filterIds.every((id) => selectedIds.includes(id))
                    }
                    indeterminate={
                        filterIds.length > 0 &&
                        filterIds.some((id) => selectedIds.includes(id)) &&
                        !filterIds.every((id) => selectedIds.includes(id))
                    }
                    onChange={handleSelectAll}
                    style={{ padding: 0 }}
                />
            ),
            width: 60,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => {
                const isSelected = selectedIds.includes(params.row.id);
                return (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <IconButton onClick={() => handleSelect(params.row.id)}>
                            {isSelected ? (
                                <CheckCircleIcon style={{ color: 'green' }} />
                            ) : (
                                <RadioButtonUncheckedIcon />
                            )}
                        </IconButton>
                    </div>
                );
            },
        },
        // Product Column
        {
            field: 'productName',
            headerName: 'Product',
            width: 200,
            valueGetter: (params) => params.row?.productName || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.productName || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.productName}
                    </Typography>
                </Tooltip>
            ),
        },
        // Product PV Column
        {
            field: 'productPartNumber',
            headerName: 'Product PV',
            width: 200,
            valueGetter: (params) => params.row?.productPartNumber || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.productPartNumber || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.productPartNumber}
                    </Typography>
                </Tooltip>
            ),
        },
        // Facility Column
        {
            field: 'facility',
            headerName: 'Facility',
            width: 200,
            valueGetter: (params) => params.row?.facility || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.facility || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.facility}
                    </Typography>
                </Tooltip>
            ),
        },
        // Raw Material Column
        {
            field: 'rawMaterialPartDescription',
            headerName: 'Raw Material',
            width: 300,
            valueGetter: (params) => params.row?.rawMaterialPartDescription || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.rawMaterialPartDescription || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.rawMaterialPartDescription}
                    </Typography>
                </Tooltip>
            ),
        },
        // RM PN Column (Raw Material Part Number)
        {
            field: 'rawMaterialPartNumber',
            headerName: 'RM PN',
            width: 200,
            valueGetter: (params) => params.row?.rawMaterialPartNumber || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.rawMaterialPartNumber || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.rawMaterialPartNumber}
                    </Typography>
                </Tooltip>
            ),
        },
        // Function Column
        {
            field: 'function',
            headerName: 'Function',
            width: 200,
            valueGetter: (params) => params.row?.function || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.function || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.function}
                    </Typography>
                </Tooltip>
            ),
        },
        // Supplier Column
        {
            field: 'supplier',
            headerName: 'Supplier',
            width: 200,
            valueGetter: (params) => params.row?.supplier || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.supplier || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.supplier}
                    </Typography>
                </Tooltip>
            ),
        },
    ];

    return (
        <MainCard title="Bill of Materials" boxShadow shadow={theme.shadows[2]}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    style={{ top: -70, marginLeft: '10px' }} // 调整按钮位置以与表格对齐
                    startIcon={<NotificationsActive />}
                    component="label"
                >
                   Add New Material
                </Button>
            </div>
            <div style={{ width: '100%', marginTop: -31 }}>
                <DataGrid
                    rows={materials}
                    columns={columns}
                    pageSize={10}
                    autoHeight
                    autoPageSize
                    density="standard"
                    disableSelectionOnClick
                    loading={isLoading}
                    components={{
                        Toolbar: GridToolbar,
                    }}
                    onFilterModelChange={(model) => {
                        const filter = model.items.map((item) => {
                            return [item.columnField, item.operatorValue, item.value];
                        });
                        const filterids = materials
                            .filter((material) => {
                                return filter.every(([field, operator, value]) => {
                                    const cellValue = material[field];
                                    if (operator === 'isEmpty') {
                                        return cellValue === '' || cellValue === undefined;
                                    } else if (operator === 'isNotEmpty') {
                                        return cellValue !== '' && cellValue !== undefined;
                                    } else if (value === undefined) {
                                        return true;
                                    } else if (operator === 'contains') {
                                        return (
                                            cellValue
                                                ?.toString()
                                                .toLowerCase()
                                                .includes(value.toLowerCase())
                                        );
                                    } else if (operator === 'equals') {
                                        return (
                                            cellValue?.toString().toLowerCase() === value.toLowerCase()
                                        );
                                    } else if (operator === 'startsWith') {
                                        return (
                                            cellValue
                                                ?.toString()
                                                .toLowerCase()
                                                .startsWith(value.toLowerCase())
                                        );
                                    } else if (operator === 'endsWith') {
                                        return (
                                            cellValue
                                                ?.toString()
                                                .toLowerCase()
                                                .endsWith(value.toLowerCase())
                                        );
                                    } else {
                                        return false;
                                    }
                                });
                            })
                            .map((material) => material.id);
                        setFilterIds(filterids);
                    }}
                />
            </div>
        </MainCard>
    );
};

export default BillOfMaterials;
