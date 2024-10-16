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
import Select from '@material-ui/core/Select'; // 导入 Select 组件
import MenuItem from '@material-ui/core/MenuItem'; // 导入 MenuItem 组件
import Tooltip from '@material-ui/core/Tooltip'; // 导入 Tooltip 组件

import { fetchUsers, deleteUser } from './users.helper';
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

    const [students, setStudents] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [selectedIds, setSelectedIds] = React.useState([]); // 记录选中的行
    const [filterIds, setFilterIds] = React.useState([]); // 记录筛选的行

    const loadData = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetchUsers();
            const tempStudents = response?.results || [];
            // 将students的每个元素做转换：
            tempStudents.forEach((student) => {
                student.fullName = `${student.firstname} ${student.lastname}`; // 生成全名
                // 其他字段已经在原数据中
            });
            setStudents(tempStudents);
            setFilterIds(tempStudents.map((student) => student.id)); // 初始化filterIds
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
            console.error('Failed to load users:', e);
            toast.error('Failed to load users');
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
        const updatedStudents = students.map((student) =>
            student.id === id ? { ...student, status: newStatus } : student
        );
        setStudents(updatedStudents);
    };

    // 切换某一行的选中状态
    const handleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // 全选/取消全选功能
    const handleSelectAll = () => {
        const allRowIds = filterIds.map((id) => id); // 获取所有行的id
        if (filterIds.every((id) => selectedIds.includes(id))) {
            // 如果所有行已被选中，则取消全选filterIds
            setSelectedIds(selectedIds.filter((id) => !filterIds.includes(id)));
        } else {
            // 否则，选中所有行，去重，保证不会重复添加，之前的selectedIds不会被覆盖
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
            }
        },
        {
            field: 'fullName',
            headerName: 'Full Name',
            description: 'This column displays the full name of the user.',
            sortable: true,
            width: 160,
            resizable: false,
            valueGetter: (params) => `${params.row?.firstname} ${params.row?.lastname}`,
            renderCell: (params) => (
                <Tooltip title={params.row?.fullName || ''} arrow>
                    <Typography
                        variant='body1'
                        component={Link}
                        to={`users/${params.row.id}`}
                        noWrap
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        {params.row?.fullName}
                    </Typography>
                </Tooltip>
            )
        },
        {
            field: 'email',
            headerName: 'Email',
            description: 'This column is sortable and filterable.',
            sortable: true,
            filterable: true,
            width: 270,
            editable: true,
            resizable: false,
            valueGetter: (params) => params.row?.email,
            renderCell: (params) => (
                <Tooltip title={params.row?.email || ''} arrow>
                    <Typography variant='body1' noWrap>
                        {params.row?.email}
                    </Typography>
                </Tooltip>
            )
        },
        {
            field: 'Role',
            headerName: 'Role',
            description: 'User privilege level.',
            sortable: true,
            width: 160,
            resizable: false,
            disableClickEventBubbling: true,
            valueGetter: (params) => params.row?.role,
            renderCell: (params) => (
                <Tooltip title={params.row?.role || ''} arrow>
                    <Typography variant='body1' noWrap>
                        {params.row?.role.toUpperCase()}
                    </Typography>
                </Tooltip>
            )
        },
        {
            field: 'Mention',
            headerName: 'Email Mention',
            headerAlign: 'center',
            description: 'Mention the user to upload the regulation we requested.',
            sortable: false,
            width: 190,
            resizable: false,
            valueGetter: (params) => params.row?.email,
            renderCell: (params) => (
                <Tooltip title={`Mention ${params.row?.email}`} arrow>
                    <Button
                        variant='contained'
                        color='primary'
                        size='small'
                        startIcon={<NotificationsActive />}
                        onClick={() => mentionUsers({ email: params.row?.email, mention: 'Hello' })}
                    >
                        Mention
                    </Button>
                </Tooltip>
            )
        },
        {
            field: 'Remark',
            headerName: 'Remark',
            headerAlign: 'center',
            description: 'Remark the user in case we need to remember something.',
            sortable: false,
            width: 190,
            resizable: false,
            disableExport: true,
            valueGetter: (params) => params.row?.remark,
            renderCell: (params) => (
                <Tooltip title={params.row?.remark || ''} arrow>
                    <Button
                        variant='contained'
                        color='primary'
                        size='small'
                        startIcon={<EditIcon />}
                        onClick={() => {
                            history.push(`students/${params.row.id}`);
                        }}
                    >
                        Details
                    </Button>
                </Tooltip>
            )
        },
        {
            field: 'Status',
            headerName: 'Status',
            sortable: true,
            width: 270,
            resizable: false,
            disableClickEventBubbling: true,
            hide: false,
            editable: true, // 允许编辑
            valueGetter: (params) => params.row?.status,
            renderCell: (params) => (
                <Tooltip title={params.row?.status || ''} arrow>
                    <Typography variant='body1' noWrap>
                        {params.row?.status}
                    </Typography>
                </Tooltip>
            ),
            renderEditCell: (params) => {
                return (
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
                );
            }
        },
        // {
        //     field: 'reply', // 回信字段
        //     headerName: 'Reply Status',
        //     width: 200,
        //     sortable: false,
        //     resizable: false,
        //     description: 'This column shows the reply status of the user.',
        //     valueGetter: (params) => params.row.reply,
        //     renderCell: (params) => (
        //         <Tooltip title={params.row?.reply || ''} arrow>
        //             <Typography variant='body1' noWrap>
        //                 {params.row?.reply}
        //             </Typography>
        //         </Tooltip>
        //     )
        // }
    ];

    return (
        <MainCard title='Users' boxShadow shadow={theme.shadows[2]}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    style={{ top: -70, marginLeft: '10px' }}
                    startIcon={<NotificationsActive />}
                    component="label"
                >
                    Batch Import Users' Emails from Excel
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        style={{ display: 'none' }}
                        onChange={handleExcelUpload}
                    />
                </Button>
                {/* 如果需要添加其他按钮，可以在这里添加 */}
            </div>
            <div style={{ width: '100%', marginTop: -31 }}>
                <DataGrid
                    rows={students}
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
                        // LoadingOverlay: CustomLoadingOverlay,
                        // NoRowsOverlay: CustomNoRowsOverlay
                    }}
                    onFilterModelChange={(model) => {
                        const filter = model.items.map((item) => {
                            return [item.columnField, item.operatorValue, item.value];
                        });
                        const filterids = students.filter((student) => {
                            return filter.every(([field, operator, value]) => {
                                const cellValue = student[field];
                                if (operator === 'isEmpty') {
                                    return cellValue === '' || cellValue === undefined;
                                } else if (operator === 'isNotEmpty') {
                                    return cellValue !== '' && cellValue !== undefined;
                                } else if (value === undefined) {
                                    return true;
                                } else if (operator === 'contains') {
                                    return cellValue?.toString().toLowerCase().includes(value.toLowerCase());
                                } else if (operator === 'equals') {
                                    return cellValue?.toString().toLowerCase() === value.toLowerCase();
                                } else if (operator === 'startsWith') {
                                    return cellValue?.toString().toLowerCase().startsWith(value.toLowerCase());
                                } else if (operator === 'endsWith') {
                                    return cellValue?.toString().toLowerCase().endsWith(value.toLowerCase());
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
