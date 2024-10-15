import React from 'react';
import { connect } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';  // 导入 xlsx 库

import MainCard from '../../ui-component/cards/MainCard';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import { DataGrid, GridToolbar } from '@material-ui/data-grid';
import { useTheme } from '@material-ui/styles';
import Select from '@material-ui/core/Select'; // Import Select component
import MenuItem from '@material-ui/core/MenuItem'; // Import MenuItem component

import { fetchSuppliers } from './helper'; // 根据路径进行调整
import { mentionUsers } from '../../views/authentication/session/auth.helper';
import { CustomLoadingOverlay, CustomNoRowsOverlay } from '../../ui-component/CustomNoRowOverlay';
import Typography from '@material-ui/core/Typography';
import EditIcon from '@material-ui/icons/Edit';
import { NotificationsActive } from '@material-ui/icons';
import EmailListener from '../../utils/emailListener';

import CheckCircleIcon from '@material-ui/icons/CheckCircle'; // 实心圆带对号
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked'; // 空心圆
import Checkbox from '@material-ui/core/Checkbox'; // 用于全选

const statusOptions = ['inactive', 'replied', 'read', 'unread']; // 定义状态选项

const StudentsComponent = ({ user }) => {
    const theme = useTheme();
    const history = useHistory();

    const [suppliers, setSuppliers] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [selectedIds, setSelectedIds] = React.useState([]); // 记录选中的行
    const [filterIds, setFilterIds] = React.useState([]); // 记录筛选的行

    const loadData = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetchSuppliers();
            const suppliersData = response || []; // 根据 API 响应结构进行调整
    
            // 处理供应商数据
            suppliersData.forEach((supplier, index) => {
                supplier.id = index + 1; // 确保每个供应商都有一个 'id' 字段供 DataGrid 使用
                // 如果需要，映射其他字段
            });
    
            setSuppliers(suppliersData);
            setFilterIds(suppliersData.map((supplier) => supplier.id)); // 初始化 filterIds
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
            console.error('Failed to load suppliers:', e);
        }
    }, []);    

    React.useEffect(() => {
        loadData();
    }, [loadData]);

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

    const handleStatusChange = (id, newStatus) => {
        const updatedSuppliers = suppliers.map((supplier) =>
            suppliers.id === id ? { ...supplier, status: newStatus } : supplier
        );
        setSuppliers(updatedSuppliers);
    };

    // 切换某一行的选中状态
    const handleSelect = (id) => {
        if (selectedIds.includes(id)) {
            // 如果已经选中，则取消选中
            setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
        } else {
            // 如果未选中，则添加到选中列表中
            setSelectedIds([...selectedIds, id]);
        }
    };

    // 全选/取消全选功能
    const handleSelectAll = () => {
        const allRowIds = filterIds.map((id) => id); // 获取所有行的id
        if (filterIds.every((id) => selectedIds.includes(id))) {
            // 如果所有行已被选中，则取消全选filterIds
            console.log('all selected', filterIds);
            setSelectedIds(selectedIds.filter((id) => !filterIds.includes(id)));
        } else {
            // 否则，选中所有行，去重，保证不会重复添加，之前的selectedIds不会被覆盖
            setSelectedIds([...new Set([...selectedIds, ...allRowIds])]);
        }
    };

    const columns = [
        // 选择框列（与之前相同）
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
            resizable: false,
            editable: false,
            disableClickEventBubbling: true,
            disableColumnMenu: true,
            headerAlign: 'center',
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
        // 供应商名称列
        {
            field: 'supplierName',
            headerName: 'Supplier Name',
            sortable: true,
            width: 160,
            renderCell: (params) => (
                <Typography variant="link1">
                    {params.row?.supplierName}
                </Typography>
            ),
        },
        // 联系方式列
        {
            field: 'contact',
            headerName: 'Contact',
            sortable: true,
            width: 270,
            renderCell: (params) => (
                <Typography variant="value1">
                    {params.row?.contact}
                </Typography>
            ),
        },
        // 材料名称列
        {
            field: 'materialName',
            headerName: 'Material Name',
            sortable: true,
            width: 200,
            renderCell: (params) => (
                <Typography variant="value1">
                    {params.row?.materialName}
                </Typography>
            ),
        },
        // 零件编号列
        {
            field: 'partNumber',
            headerName: 'Part Number',
            sortable: true,
            width: 150,
            renderCell: (params) => (
                <Typography variant="value1">
                    {params.row?.partNumber}
                </Typography>
            ),
        },
        // 选择的调查列
        {
            field: 'chooseSurvey',
            headerName: 'Choose Survey',
            sortable: true,
            width: 200,
            renderCell: (params) => (
                <Typography variant="value1">
                    {params.row?.chooseSurvey?.join(', ')}
                </Typography>
            ),
        },
        // 状态列
        {
            field: 'status',
            headerName: 'Status',
            sortable: true,
            width: 150,
            editable: true,
            renderCell: (params) => (
                <Typography variant="value1">
                    {params.row?.status}
                </Typography>
            ),
            renderEditCell: (params) => (
                <Select
                    value={params.row.status}
                    onChange={(event) => handleStatusChange(params.row.id, event.target.value)}
                >
                    {statusOptions.map((status) => (
                        <MenuItem key={status} value={status}>
                            {status}
                        </MenuItem>
                    ))}
                </Select>
            ),
        },
        // 反馈列
        {
            field: 'feedback',
            headerName: 'Feedback',
            sortable: true,
            width: 200,
            renderCell: (params) => (
                <Typography variant="value1">
                    {params.row?.feedback}
                </Typography>
            ),
        },
        // 供应商文档列
        {
            field: 'supplierDocuments',
            headerName: 'Supplier Documents',
            sortable: true,
            width: 200,
            renderCell: (params) => (
                <Typography variant="value1">
                    {params.row?.supplierDocuments}
                </Typography>
            ),
        },
    ];    

    return (
        <MainCard title='Suppliers' boxShadow shadow={theme.shadows[2]}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    style={{ top: -70 }} // 调整按钮位置, 使其与表格对齐, 70-31=39
                    startIcon={<NotificationsActive />}
                    component="label"
                >
                    Batch import suppliers' emails from Excel
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
                    rows={suppliers}
                    columns={columns}
                    pageSize={10}
                    checkboxSelection={false}
                    autoHeight
                    autoPageSize
                    density={'standard'}
                    disableSelectionOnClick
                    loading={isLoading}
                    components={{
                        Toolbar: GridToolbar,
                        LoadingOverlay: CustomLoadingOverlay,
                        NoRowsOverlay: CustomNoRowsOverlay
                    }}
                    onFilterModelChange={(model) => {
                        const filter = model.items.map((item) => {
                            return [item.columnField, item.operatorValue, item.value];
                        });
                        const filterids = suppliers.filter((student) => {
                            return filter.every((filter) => {
                                if (filter[1] == 'isEmpty') {
                                    return student[filter[0]] === '' || student[filter[0]] === undefined;
                                } else if (filter[1] == 'isNotEmpty') {
                                    return student[filter[0]] !== '' && student[filter[0]] !== undefined;
                                } else if (filter[2] === undefined) {
                                    return true;
                                } else if (filter[1] === 'contains') {
                                    return student[filter[0]].toLowerCase().includes(filter[2].toLowerCase())
                                } else if (filter[1] === 'equals') {
                                    return student[filter[0]].toLowerCase() === filter[2].toLowerCase();
                                } else if (filter[1] === 'startsWith') {
                                    return student[filter[0]].toLowerCase().startsWith(filter[2].toLowerCase());
                                } else if (filter[1] === 'endsWith') {
                                    return student[filter[0]].toLowerCase().endsWith(filter[2].toLowerCase());
                                } else {
                                    return false;
                                }
                            }); 
                        }).map((student) => student.id);
                        setFilterIds(filterids);
                    }}
                />
            </div>
            {/* <EmailListener /> */}
        </MainCard>
    );
};

const mapStateToProps = (state) => ({
    user: state.authReducer.user
});

export default connect(mapStateToProps, null)(StudentsComponent);
