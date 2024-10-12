import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import MainCard from '../../ui-component/cards/MainCard';
import { useTheme } from '@material-ui/styles';

import { DataGrid } from '@material-ui/data-grid';

import { fetchVideoGroupsAction } from './video-groups.actions';
import { CustomLoadingOverlay, CustomNoRowsOverlay } from '../../ui-component/CustomNoRowOverlay';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import EditIcon from '@material-ui/icons/Edit';
import { deleteVideoGroup } from './video-groups.helper';
import Swal from 'sweetalert2';

const VideoGroupComponent = ({ fetchVideoGroupsAction, isLoading, videoGroups, user }) => {
    const history = useHistory();
    const theme = useTheme();
    const userRole = user?.role;

    const columns = [
        {
            field: 'id', width: 270, headerName: 'ID', hide: false
        },
        {
            field: 'groupName',
            headerName: 'Group Name',
            width: 300,
            editable: false,
            resizable: false,
            disableClickEventBubbling: true
        },
        {
            field: 'accessState',
            headerName: 'Access Status',
            description: 'group privilege',
            sortable: false,
            width: 160,
            editable: false,
            resizable: false,
            disableClickEventBubbling: true,
            renderCell: (params) => {
                return (
                    <Typography variant='value1'>
                        {params.row?.accessState.toUpperCase()}
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
            hide: userRole === 'student',
            renderCell: (params) => {
                return (
                    <strong>
                        <Button
                            variant='contained'
                            color='primary'
                            size='small'
                            startIcon={<EditIcon />}
                            style={{ marginLeft: 16 }}
                            onClick={() => {
                                history.push(`video-groups/${params.row.id}`);
                            }}
                        >
                            Details
                        </Button>
                        <IconButton
                            style={{ marginLeft: 16 }}
                            onClick={(event) => {
                                event.ignore = true;
                                Swal.fire({
                                    text: 'Are you sure you wish to delete this item?',
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonColor: theme.palette.primary['main'],
                                    cancelButtonColor: theme.palette.error['dark'],
                                    confirmButtonText: 'Yes, delete it!'
                                }).then(async (result) => {
                                    if (result.isConfirmed) {
                                        await deleteVideoGroup(params.row.id);
                                        await fetchVideoGroupsAction();
                                        await Swal.fire(
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
                    </strong>
                );
            }
        }
    ];

    React.useEffect(() => {
        fetchVideoGroupsAction();
    }, [fetchVideoGroupsAction]);

    return (
        <MainCard title='File Groups' boxShadow shadow={theme.shadows[2]}>
            <div style={{ width: '100%' }}>
                <DataGrid
                    rows={videoGroups?.results || []}
                    columns={columns}
                    pageSize={7}
                    rowsPerPageOptions={[7]}
                    checkboxSelection={false}
                    autoHeight
                    autoPageSize
                    density={'standard'}
                    disableSelectionOnClick
                    loading={isLoading}
                    components={{
                        LoadingOverlay: CustomLoadingOverlay,
                        NoRowsOverlay: CustomNoRowsOverlay
                    }}
                />
            </div>
        </MainCard>
    );
};

const mapStateToProps = (state) => ({
    user: state.authReducer.user,
    isLoading: state.videoGroupsReducer.isLoading,
    videoGroups: state.videoGroupsReducer.videoGroups
});

const mapDispatchToProps = (dispatch) => ({
    fetchVideoGroupsAction: (obj) => dispatch(fetchVideoGroupsAction(obj))
});

export default connect(mapStateToProps, mapDispatchToProps)(VideoGroupComponent);
