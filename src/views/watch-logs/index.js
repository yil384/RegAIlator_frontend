import React from 'react';
import { connect } from 'react-redux';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

import MainCard from '../../ui-component/cards/MainCard';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import { DataGrid, GridToolbar } from '@material-ui/data-grid';
import { useTheme } from '@material-ui/styles';

import { fetchWatchLogs, deleteWatchLog } from './watch-logs.helper';
import { CustomLoadingOverlay, CustomNoRowsOverlay } from '../../ui-component/CustomNoRowOverlay';

const WatchLogsComponent = ({ user }) => {
    const theme = useTheme();

    const [watchLogs, setWatchLogs] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const loadData = React.useCallback(async () => {
        try {
            await setIsLoading(true);
            const options = {
                sortBy: '-createdAt'
            };
            if (user.role === 'student') {
                options.userId = user.id;
            }
            const response = await fetchWatchLogs(options);
            setWatchLogs(response?.results || []);
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
            field: 'id', width: 200, headerName: 'ID', hide: true
        },
        {
            field: 'userID', width: 170, headerName: 'Username', hide: user.role === 'student',
            valueFormatter: (params) => `${params.row.userId?.firstname} ${params.row.userId?.lastname}` || '-',
            renderCell: (params) => {
                return <span>{`${params.row.userId?.firstname} ${params.row.userId?.lastname}` || '-'}</span>;
            }
        },
        {
            field: 'Video Name',
            headerName: 'Video Title',
            description: 'video name',
            sortable: false,
            width: 250,
            editable: false,
            resizable: false,
            disableClickEventBubbling: true,
            valueFormatter: (params) => params.row.progressStatus?.info?.videoFileName || '-',
            renderCell: (params) => {
                return <span>{params.row.progressStatus?.info?.videoFileName || '-'}</span>;
            }
        },
        {
            field: 'videoGroupId',
            headerName: 'Assigned Group',
            width: 270,
            editable: false,
            resizable: false,
            disableClickEventBubbling: true,
            valueFormatter: (params) => params.row.videoGroupId?.groupName,
            renderCell: (params) => {
                return (
                    <p>
                        {params.row.videoGroupId?.groupName}
                    </p>
                );
            }
        },
        {
            field: 'progressStatus',
            headerName: 'Progress(%)',
            description: 'Video watched percentage',
            sortable: false,
            width: 160,
            editable: false,
            resizable: false,
            disableClickEventBubbling: true,
            valueFormatter: (params) => params.row.progressStatus?.info?.progress || '-',
            renderCell: (params) => {
                return <strong>{params.row.progressStatus?.info?.progress || '-'}</strong>;
            }
        },
        {
            field: 'recordFileName',
            headerName: 'File name',
            width: 250,
            editable: false,
            resizable: false,
            disableClickEventBubbling: true,
            hide: user.role === 'student',
            valueFormatter: (params) => params.row.recordFilePath,
            renderCell: (params) => {
                return (
                    <a
                        target='_blank'
                        rel='noopener noreferrer'
                        href={params.row.recordFilePath}>
                        {params.row.recordFileName}
                    </a>
                );
            }
        },
        {
            field: 'Record time',
            headerName: 'Record time',
            description: 'recorded at',
            sortable: false,
            width: 190,
            editable: false,
            resizable: false,
            disableClickEventBubbling: true,
            valueFormatter: (params) => params.row.progressStatus?.info?.recordTime || '-',
            renderCell: (params) => {
                return <p>{params.row.progressStatus?.info?.recordTime || '-'}</p>;
            }
        },
        {
            field: 'recordFilePath',
            headerName: 'File path',
            width: 250,
            editable: false,
            resizable: false,
            disableClickEventBubbling: true,
            hide: true,
            valueFormatter: (params) => params.row.recordFilePath,
            renderCell: (params) => {
                return (
                    <a
                        target='_blank'
                        rel='noopener noreferrer'
                        href={params.row.recordFilePath}>
                        File link
                    </a>
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
            hide: user.role !== 'admin',
            disableExport: true,
            renderCell: (params) => {
                return (
                    <strong>
                        {/*<Button*/}
                        {/*    variant='contained'*/}
                        {/*    color='primary'*/}
                        {/*    size='small'*/}
                        {/*    style={{ marginLeft: 16 }}*/}
                        {/*    onClick={() => {*/}
                        {/*        // history.push(`watch-logs/${params.row.id}`);*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    Details*/}
                        {/*</Button>*/}
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
                                        await deleteWatchLog(params.row.id);
                                        await loadData();
                                        toast.success('Your item has been deleted');
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
        <MainCard title='Watch Logs' boxShadow shadow={theme.shadows[2]}>
            <div style={{ width: '100%' }}>
                <DataGrid
                    rows={watchLogs}
                    columns={columns}
                    pageSize={10}
                    checkboxSelection={false}
                    autoHeight
                    paginationMode={'client'}
                    autoPageSize
                    density={'standard'}
                    disableSelectionOnClick
                    loading={isLoading}
                    components={{
                        Toolbar: GridToolbar,
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
    user: state.authReducer.user
});

export default connect(mapStateToProps, null)(WatchLogsComponent);
