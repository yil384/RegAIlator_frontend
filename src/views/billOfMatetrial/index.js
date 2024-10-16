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
import Tooltip from '@material-ui/core/Tooltip'; // 导入 Tooltip 组件
import { fetchBillOfMaterials } from './helper'; // 假设的 API 用于获取数据

import { mentionUsers } from '../../views/authentication/session/auth.helper';
import * as XLSX from 'xlsx';  // 导入 xlsx 库
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
        {
            field: 'productName',
            headerName: 'Product Name',
            width: 200,
            renderCell: (params) => (
                <Tooltip title={params.row?.productName || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.productName}
                    </Typography>
                </Tooltip>
            ),
        },
        {
            field: 'productPartNumber',
            headerName: 'Product Part Number',
            width: 200,
            renderCell: (params) => (
                <Tooltip title={params.row?.productPartNumber || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.productPartNumber}
                    </Typography>
                </Tooltip>
            ),
        },
        {
            field: 'rawMaterialPartNumber',
            headerName: 'Raw Material Part Number',
            width: 200,
            renderCell: (params) => (
                <Tooltip title={params.row?.rawMaterialPartNumber || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.rawMaterialPartNumber}
                    </Typography>
                </Tooltip>
            ),
        },
        {
            field: 'rawMaterialPartDescription',
            headerName: 'Raw Material Part Description',
            width: 300,
            renderCell: (params) => (
                <Tooltip title={params.row?.rawMaterialPartDescription || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.rawMaterialPartDescription}
                    </Typography>
                </Tooltip>
            ),
        },
        {
            field: 'rawMaterialComplianceInfo',
            headerName: 'Raw Material Compliance Information',
            width: 300,
            renderCell: (params) => (
                <Tooltip title={params.row?.rawMaterialComplianceInfo || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.rawMaterialComplianceInfo}
                    </Typography>
                </Tooltip>
            ),
        },
    ];

    // 处理 Excel 文件的上传
    const handleExcelUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0]; // 获取第一个工作表
            const worksheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            jsonData.forEach(row => {
                const email = row.email; // 读取邮箱
                if (email) {
                    mentionUsers({ email, mention: 'Hello' });
                }
            });

            toast.success('Successfully mentioned users from Excel!');
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <MainCard title="Bill of Materials" boxShadow shadow={theme.shadows[2]}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    style={{ top: -70 }} // 调整按钮位置以与表格对齐
                    startIcon={<NotificationsActive />}
                    component="label"
                >
                    Import Bill of Materials
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        style={{ display: 'none' }}
                        onChange={handleExcelUpload}
                    />
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
                                return filter.every((filter) => {
                                    if (filter[1] === 'contains') {
                                        return (
                                            material[filter[0]]
                                                .toString()
                                                .toLowerCase()
                                                .includes(filter[2].toLowerCase())
                                        );
                                    } else {
                                        return true;
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
