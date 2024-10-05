import React from 'react';
import { connect } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Typography from '@material-ui/core/Typography';

import { useTheme } from '@material-ui/styles';
import {
    DataGrid
    // GridToolbar
} from '@material-ui/data-grid';

// project imports
import MainCard from '../../ui-component/cards/MainCard';
import { CustomNoRowsOverlay, CustomLoadingOverlay } from '../../ui-component/CustomNoRowOverlay';
import { fetchUsersAction } from './users.actions';
import { deleteUser } from './users.helper';
import queryString from 'query-string';
import Swal from 'sweetalert2';

const Users = ({ fetchUsersAction, isLoading, users, location, user }) => {
    const history = useHistory();
    const theme = useTheme();
    const { role } = queryString.parse(location.search);

    const columns = [
        { field: 'id', width: 140, headerName: 'ID', hide: true },
        {
            field: 'firstname',
            headerName: 'First Name',
            width: 200,
            editable: true,
            resizable: false,
            disableClickEventBubbling: true
        },
        {
            field: 'lastname',
            headerName: 'Last Name',
            width: 160,
            editable: true,
            resizable: false
        },
        {
            field: 'fullName',
            headerName: 'Full name',
            description: 'This column has a value getter and is not sortable.',
            sortable: false,
            width: 160,
            resizable: false,
            renderCell: (params) => {
                return (
                    <Typography variant='link1' component={Link} to={`users/${params.row.id}`}>
                        {`${params.getValue(params.id, 'firstname') || ''} ${params.getValue(params.id, 'lastname') || ''
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
            resizable: false
        },
        {
            field: 'Role',
            headerName: 'Role',
            description: 'User privilege',
            sortable: false,
            width: 160,
            resizable: false,
            disableClickEventBubbling: true,
            renderCell: (params) => {
                return (
                    <Typography variant='value1'>
                        {params.row?.role.toUpperCase()}
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
            hide: false,
            renderCell: (params) => {
                return params.row.isEmailVerified ? (
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
                                history.push(`users/${params.row.id}`);
                            }}
                        >
                            Details
                        </Button>
                        {user.role === 'admin' && (
                            <IconButton
                                style={{ marginLeft: 16 }}
                                onClick={(event) => {
                                    event.ignore = true;
                                    Swal.fire({
                                        text: `Are you sure you wish to delete this ${params.row.email} item?`,
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonColor: theme.palette.primary['main'],
                                        cancelButtonColor: theme.palette.error['dark'],
                                        confirmButtonText: 'Yes, delete it!'
                                    }).then(async (result) => {
                                        if (result.isConfirmed) {
                                            await deleteUser(params.row.id);
                                            await fetchUsersAction();
                                            Swal.fire(
                                                'Deleted!',
                                                'Your item has been deleted.',
                                                'success'
                                            );
                                        }
                                    });
                                }}
                            >
                                <DeleteIcon color={'error'} />
                            </IconButton>
                        )}
                    </strong>
                );
            }
        }
    ];

    React.useEffect(() => {
        fetchUsersAction({ role });
    }, [fetchUsersAction, role]);

    return (
        <MainCard title='All Users' boxShadow shadow={theme.shadows[2]}>
            <div style={{ width: '100%' }}>
                <DataGrid
                    rows={users?.results || []}
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
                    // componentsProps={{ toolbar: { style: { position: 'absolute', top: -90, right: 0 } } }}
                />
            </div>
        </MainCard>
    );
};


const mapStateToProps = (state) => ({
    isLoading: state.usersReducer.isLoading,
    users: state.usersReducer.users,
    user: state.authReducer.user
});

const mapDispatchToProps = (dispatch) => ({
    fetchUsersAction: (loginObj) => dispatch(fetchUsersAction(loginObj))
});

export default connect(mapStateToProps, mapDispatchToProps)(Users);
