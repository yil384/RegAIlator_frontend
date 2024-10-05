import React from 'react';
import { connect } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

import MainCard from '../../ui-component/cards/MainCard';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import { DataGrid, GridToolbar } from '@material-ui/data-grid';
import { useTheme } from '@material-ui/styles';

import { fetchInstructors, deleteInstructor } from './helper';
import { CustomLoadingOverlay, CustomNoRowsOverlay } from '../../ui-component/CustomNoRowOverlay';
import Typography from '@material-ui/core/Typography';
import EditIcon from '@material-ui/icons/Edit';

const InstructorsComponent = ({ user }) => {
    const theme = useTheme();
    const history = useHistory();

    const [instructors, setInstructors] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const loadData = React.useCallback(async () => {
        try {
            await setIsLoading(true);
            const response = await fetchInstructors();
            setInstructors(response?.results || []);
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
        }
    });

    React.useEffect(() => {
        loadData();
    }, []);

    const columns = [
        { field: 'id', width: 250, headerName: 'ID', hide: false },
        {
            field: 'fullName',
            headerName: 'Full name',
            description: 'This column has a value getter and is not sortable.',
            sortable: false,
            width: 160,
            resizable: false,
            renderCell: (params) => {
                return (
                    <Typography variant='link1' component={Link} to={`instructors/${params.row.id}`}>
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
            hide: true,
            renderCell: (params) => {
                return (
                    <Typography variant='value1'>
                        {params.row?.userId.role.toUpperCase()}
                    </Typography>
                );
            }
        },
        {
            field: 'VideoGroups',
            headerName: 'Video Groups',
            sortable: false,
            width: 270,
            resizable: false,
            disableClickEventBubbling: true,
            hide: false,
            renderCell: (params) => {
                return (
                    <Typography variant='value1'>
                        ( {params.row?.videoGroups.length} )
                        {params.row?.videoGroups.map((item) => (
                            <span key={item.id}> {item.groupName} {' ; '}  </span>
                        ))}
                    </Typography>
                );
            }
        },
        {
            field: 'IsEmailVerified',
            headerName: 'Email Verification',
            description: 'User privilege',
            sortable: false,
            width: 190,
            resizable: false,
            hide: true,
            renderCell: (params) => {
                return params.row?.userId.isEmailVerified ? (
                    <Typography variant='value2'>
                        {'Verified'}
                    </Typography>
                ) : (
                    <Typography variant='error1'>
                        {'Not Verified'}
                    </Typography>
                );
            }
        },
        {
            field: 'Actions',
            headerName: 'Actions',
            headerAlign: 'center',
            description: 'tools',
            sortable: false,
            width: 190,
            resizable: false,
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
                                history.push(`instructors/${params.row.id}`);
                            }}
                        >
                            Details
                        </Button>
                        {/*<IconButton*/}
                        {/*    style={{ marginLeft: 16 }}*/}
                        {/*    onClick={(event) => {*/}
                        {/*        event.ignore = true;*/}
                        {/*        Swal.fire({*/}
                        {/*            text: `Are you sure you wish to delete this ${params.row.email} item?`,*/}
                        {/*            icon: 'warning',*/}
                        {/*            showCancelButton: true,*/}
                        {/*            confirmButtonColor: theme.palette.primary['main'],*/}
                        {/*            cancelButtonColor: theme.palette.error['dark'],*/}
                        {/*            confirmButtonText: 'Yes, delete it!'*/}
                        {/*        }).then(async (result) => {*/}
                        {/*            if (result.isConfirmed) {*/}
                        {/*                await deleteInstructor(params.row.id);*/}
                        {/*                await fetchInstructors();*/}
                        {/*                toast.success('Your item has been deleted');*/}
                        {/*            }*/}
                        {/*        });*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    <DeleteIcon color={'error'} />*/}
                        {/*</IconButton>*/}
                    </strong>
                );
            }
        }
    ];

    return (
        <MainCard title='Instructors' boxShadow shadow={theme.shadows[2]}>
            <div style={{ width: '100%' }}>
                <DataGrid
                    rows={instructors}
                    columns={columns}
                    pageSize={10}
                    checkboxSelection={false}
                    autoHeight
                    autoPageSize
                    density={'standard'}
                    disableSelectionOnClick
                    loading={isLoading}
                    components={{
                        // Toolbar: GridToolbar,
                        LoadingOverlay: CustomLoadingOverlay,
                        NoRowsOverlay: CustomNoRowsOverlay
                    }}
                />
            </div>
        </MainCard>
    );
};

const mapStateToProps = (state) => ({
    user: state.authReducer.user
});

export default connect(mapStateToProps, null)(InstructorsComponent);
