import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';

import MainCard from '../../ui-component/cards/MainCard';
import { DataGrid, GridToolbar } from '@material-ui/data-grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import EditIcon from '@material-ui/icons/Edit';
import LoaderInnerCircular from '../../ui-component/LoaderInnerCircular';

import { CustomLoadingOverlay, CustomNoRowsOverlay } from '../../ui-component/CustomNoRowOverlay';
import { fetchVideos, deleteVideo } from './videos.helper';
import { useTheme } from '@material-ui/styles';

const VideosComponent = ({ user }) => {
    const theme = useTheme();
    const history = useHistory();
    const userRole = user?.role;

    const [videos, setVideos] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const loadData = React.useCallback(async () => {
        try {
            await setIsLoading(true);
            const response = await fetchVideos({ sortBy: '-updatedAt' });
            setVideos(response?.results || []);
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
        }
    });

    React.useEffect(() => {
        loadData();
    }, []);

    const columns = [
        {
            field: 'id', width: 200, headerName: 'ID', hide: false
        },
        {
            field: 'title',
            headerName: 'File Name',
            width: 270,
            editable: false,
            resizable: false,
            disableClickEventBubbling: true
        },
        {
            field: 'group',
            headerName: 'Assigned Group',
            width: 250,
            editable: false,
            resizable: false,
            disableClickEventBubbling: true,
            renderCell: (params) => {
                return (
                    <Typography variant='value1'>
                        {params.row?.group.groupName}
                    </Typography>
                );
            }
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
                                history.push(`videos/${params.row.id}`);
                                // history.push(`videos/${params.row.id}`);
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
                                        await deleteVideo(params.row.id);
                                        await loadData();
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
                    </strong>
                );
            }
        }
    ];

    return (
        <MainCard title='All Files' boxShadow shadow={theme.shadows[2]}>
            <div style={{ width: '100%' }}>
                {
                    isLoading ? <LoaderInnerCircular /> :
                        (
                            <DataGrid
                                rows={videos}
                                columns={columns}
                                pageSize={10}
                                rowsPerPageOptions={[100]}
                                checkboxSelection={false}
                                autoHeight={true}
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
                        )
                }
            </div>
        </MainCard>
    );
};

const mapStateToProps = (state) => ({
    user: state.authReducer.user
});

export default connect(mapStateToProps, null)(VideosComponent);
