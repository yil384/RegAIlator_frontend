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

import { fetchStudents, deleteStudent } from './helper';
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
            const response = await fetchStudents();
            const tmepStudents = response?.results || [];
            // 将students的每个元素做转换：
            tmepStudents.forEach((student) => {
                student.fullName = `${student.firstname} ${student.lastname}`; // 生成全名
                student.email = student.email; // 生成邮箱
                student.role = student.role; // 生成角色
                student.remark = student.remark; // 生成备注
                student.status = student.status; // 生成状态
                student.reply = student.reply; // 生成回信状态
            });
            setStudents(tmepStudents);
            setFilterIds(tmepStudents.map((student) => student.id)); // 初始化filterIds
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
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
        {
            field: 'select',
            headerName: (
                <Checkbox
                    checked={filterIds.length > 0 && 
                        filterIds.every((id) => selectedIds.includes(id))
                    } // 全选状态，selectedIds和filterIds内容相同
                    indeterminate={filterIds.length > 0 && 
                        filterIds.some((id) => selectedIds.includes(id)) &&
                        !filterIds.every((id) => selectedIds.includes(id))
                    } // 部分选中状态
                    onChange={handleSelectAll} // 处理全选逻辑
                    style={{ padding: 0 }} // 去掉默认的 padding
                />
            ),
            description: 'This column has a value getter and is not sortable.',
            width: 60,
            sortable: false,
            filterable: false,
            resizable: false,
            editable: false,
            disableClickEventBubbling: true,
            disableColumnMenu: true, // 禁用列头的菜单（三个点的菜单）
            headerAlign: 'center',
            renderCell: (params) => {
                const isSelected = selectedIds.includes(params.row.id);
                return (
                    // 居中显示
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <IconButton onClick={() => handleSelect(params.row.id)}>
                            {isSelected ? (
                                <CheckCircleIcon style={{ color: 'green' }} /> // 已选中
                            ) : (
                                <RadioButtonUncheckedIcon /> // 未选中
                            )}
                        </IconButton>
                    </div>
                );
            }
        },
        // { field: 'id', width: 140, headerName: 'ID', hide: false },
        {
            field: 'fullName',
            headerName: 'Full name',
            description: 'This column has a value getter and is sortable.',
            sortable: true,
            width: 160,
            resizable: false,
            valueGetter: (params) => `${params.row?.firstname} ${params.row?.lastname}`,
            renderCell: (params) => {
                return (
                    <Typography variant='link1' component={Link} to={`students/${params.row.id}`}>
                        {params.row?.firstname} {params.row?.lastname}
                    </Typography>
                );
            }
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
            renderCell: (params) => {
                return (
                    <Typography variant='value1'>
                        {params.row?.email}
                    </Typography>
                );
            }
        },
        {
            field: 'Role',
            headerName: 'Role',
            description: 'User privilege',
            sortable: true,
            width: 160,
            resizable: false,
            disableClickEventBubbling: true,
            valueGetter: (params) => params.row?.role,
            renderCell: (params) => {
                return (
                    <Typography variant='value1'>
                        {params.row?.role.toUpperCase()}
                    </Typography>
                );
            }
        },
        // {
        //     field: 'Instructors',
        //     headerName: 'Instructors',
        //     width: 220,
        //     editable: true,
        //     resizable: false,
        //     valueFormatter: (params) => params.row?.instructors?.reduce((previousValue, currentValue) => {
        //         return previousValue + `${currentValue.userId.firstname} ;`;
        //     }, ''),
        //     renderCell: (params) => {
        //         return (
        //             <Typography>
        //                 ( {params.row?.instructors.length} )
        //                 {params.row?.instructors?.map((item) => (
        //                     <span key={item.id}> {item.userId.firstname}{' ; '} </span>
        //                 ))}
        //             </Typography>
        //         );
        //     }
        // },
        {
            field: 'Mention',
            headerName: 'Email Mention',
            headerAlign: 'center',
            description: 'Mention the user to upload the regulation we requested.',
            sortable: true,
            width: 190,
            resizable: false,
            hide: false,
            valueGetter: (params) => params.row?.email,
            renderCell: (params) => {
                return (
                    <strong>
                        <Button
                            variant='contained'
                            color='primary'
                            size='small'
                            style={{ marginLeft: 16 }}
                            startIcon={<NotificationsActive />}
                            // 按下后调用 mentionUsers 函数
                            onClick={() => mentionUsers({ email: params.row?.email, mention: 'Hello' })}
                        >
                            Mention
                        </Button>
                    </strong>
                );
            }
        },
        {
            field: 'Remark',
            headerName: 'Remark',
            headerAlign: 'center',
            description: 'Remark the user in case that we need to remember something.',
            sortable: true,
            width: 190,
            resizable: false,
            disableExport: true,
            valueGetter: (params) => params.row?.remark,
            renderCell: (params) => {
                return (
                    <strong>
                        <Button
                            variant='contained'
                            color='primary'
                            size='small'
                            style={{ marginLeft: 16 }}
                            startIcon={<EditIcon />}
                            onClick={() => {
                                history.push(`students/${params.row.id}`);
                            }}
                        >
                            Details
                        </Button>
                        {/*{user.role === 'admin' && (*/}
                        {/*    <IconButton*/}
                        {/*        style={{ marginLeft: 16 }}*/}
                        {/*        onClick={(event) => {*/}
                        {/*            event.ignore = true;*/}
                        {/*            Swal.fire({*/}
                        {/*                text: `Are you sure you wish to delete this ${params.row.email} item?`,*/}
                        {/*                icon: 'warning',*/}
                        {/*                showCancelButton: true,*/}
                        {/*                confirmButtonColor: theme.palette.primary['main'],*/}
                        {/*                cancelButtonColor: theme.palette.error['dark'],*/}
                        {/*                confirmButtonText: 'Yes, delete it!'*/}
                        {/*            }).then(async (result) => {*/}
                        {/*                if (result.isConfirmed) {*/}
                        {/*                    await deleteStudent(params.row.id);*/}
                        {/*                    await fetchStudents();*/}
                        {/*                    toast.success('Your item has been deleted');*/}
                        {/*                }*/}
                        {/*            });*/}
                        {/*        }}*/}
                        {/*    >*/}
                        {/*        <DeleteIcon color={'error'} />*/}
                        {/*    </IconButton>*/}
                        {/*)}*/}
                    </strong>
                );
            }
        },
        // {
        //     field: 'VideoGroups',
        //     headerName: 'Video Groups',
        //     sortable: false,
        //     width: 270,
        //     resizable: false,
        //     disableClickEventBubbling: true,
        //     hide: false,
        //     valueFormatter: (params) => params.row?.videoGroups?.reduce((previousValue, currentValue) => {
        //         return previousValue + `${currentValue.groupName} ;`;
        //     }, ''),
        //     renderCell: (params) => {
        //         return (
        //             <Typography variant='value1'>
        //                 ( {params.row?.videoGroups.length} )
        //                 {params.row?.videoGroups?.map((item) => (
        //                     <span key={item.id}> {item.groupName} {' ; '}  </span>
        //                 ))}
        //             </Typography>
        //         );
        //     }
        // },
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
            renderCell: (params) => {
                return (
                    <Typography variant='value1'>
                        {params.row?.status}
                    </Typography>
                );
            },
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
        {
            field: 'reply', // 回信字段
            headerName: 'Reply Status',
            width: 200,
            sortable: false,
            resizable: false,
            description: 'This column shows the reply status of the user.',
            valueGetter: (params) => params.row.reply,
            renderCell: (params) => {
                return (
                    <Typography variant='value1'>
                        {params.row.reply}
                    </Typography>
                );
            }
        }
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
                        LoadingOverlay: CustomLoadingOverlay,
                        NoRowsOverlay: CustomNoRowsOverlay
                    }}
                    onFilterModelChange={(model) => {
                        const filter = model.items.map((item) => {
                            return [item.columnField, item.operatorValue, item.value];
                        });
                        const filterids = students.filter((student) => {
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
            <EmailListener />
        </MainCard>
    );
};

const mapStateToProps = (state) => ({
    user: state.authReducer.user
});

export default connect(mapStateToProps, null)(StudentsComponent);
