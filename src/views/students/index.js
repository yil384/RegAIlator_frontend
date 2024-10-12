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

const statusOptions = ['inactive', 'replied', 'read', 'unread']; // 定义状态选项

const StudentsComponent = ({ user }) => {
    const theme = useTheme();
    const history = useHistory();

    const [students, setStudents] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const loadData = React.useCallback(async () => {
        try {
            await setIsLoading(true);
            const response = await fetchStudents({
                deepPopulate: 'userId'
            });
            setStudents(response?.results || []);
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
        }
    });

    React.useEffect(() => {
        loadData();
    }, []);

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
                const email = row.email || row.userId; // 读取邮箱或 userId
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

    const columns = [
        // { field: 'id', width: 140, headerName: 'ID', hide: false },
        {
            field: 'fullName',
            headerName: 'Full name',
            description: 'This column has a value getter and is not sortable.',
            sortable: false,
            width: 160,
            resizable: false,
            valueFormatter: (params) => `${params.getValue(params.id, 'userId').firstname || ''} ${params.getValue(params.id, 'userId').lastname || ''
            }`,
            renderCell: (params) => {
                return (
                    <Typography variant='link1' component={Link} to={`students/${params.row.id}`}>
                        {`${params.getValue(params.id, 'userId').firstname || ''} ${params.getValue(params.id, 'userId').lastname || ''
                        }`}
                    </Typography>
                );
            }
        },
        {
            field: 'email',
            headerName: 'Email',
            type: 'email',
            width: 270,
            editable: true,
            resizable: false,
            valueFormatter: (params) => params.row?.userId.email,
            renderCell: (params) => {
                return (
                    <Typography variant='value1'>
                        {params.row?.userId.email}
                    </Typography>
                );
            }
        },
        {
            field: 'Role',
            headerName: 'Role',
            description: 'User privilege',
            sortable: false,
            width: 160,
            resizable: false,
            disableClickEventBubbling: true,
            valueFormatter: (params) => params.row?.userId.role.toUpperCase(),
            renderCell: (params) => {
                return (
                    <Typography variant='value1'>
                        {params.row?.userId.role.toUpperCase()}
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
            sortable: false,
            width: 190,
            resizable: false,
            hide: false,
            valueFormatter: (params) => params,
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
                            onClick={() => mentionUsers({ email: params.row?.userId.email, mention: 'Hello' })}
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
            sortable: false,
            width: 190,
            resizable: false,
            disableExport: true,
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
            sortable: false,
            width: 270,
            resizable: false,
            disableClickEventBubbling: true,
            hide: false,
            editable: true, // 允许编辑
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

// TODO