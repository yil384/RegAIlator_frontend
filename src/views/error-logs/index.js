import React from 'react';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';

import MainCard from '../../ui-component/cards/MainCard';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import EditIcon from '@material-ui/icons/Edit';
import { DataGrid } from '@material-ui/data-grid';

import { useTheme } from '@material-ui/styles';

import { fetchErrorLogs, deleteErrorLog } from './error-logs.helper';
import { CustomLoadingOverlay, CustomNoRowsOverlay } from '../../ui-component/CustomNoRowOverlay';

const ErrorLogsComponent = () => {
    const theme = useTheme();
    const history = useHistory();

    const [errorLogs, setErrorLogs] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const loadData = React.useCallback(async () => {
        try {
            await setIsLoading(true);
            const response = await fetchErrorLogs();
            setErrorLogs(response?.results || []);
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
            field: 'errorMessage',
            headerName: 'Error Message',
            width: 200,
            editable: false,
            resizable: false,
            disableClickEventBubbling: true
        },
        {
            field: 'stackTrace',
            headerName: 'Stack trace',
            description: 'Error file',
            sortable: false,
            width: 240,
            editable: false,
            resizable: false,
            disableClickEventBubbling: true
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
                            onClick={() => {
                                history.push(`error-logs/${params.row.id}`);
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
                                        await deleteErrorLog(params.row.id);
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
                        <IconButton
                            style={{ marginLeft: 5 }}
                            onClick={(event) => {
                                event.ignore = true;
                                history.push(`error-logs/${params.row.id}`);
                            }}
                        >
                            <EditIcon color={'primary'} />
                        </IconButton>
                    </strong>
                );
            }
        }
    ];
    return (
        <MainCard title='Error Logs' boxShadow shadow={theme.shadows[2]}>
            <div style={{ width: '100%' }}>
                <DataGrid
                    rows={errorLogs}
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

export default ErrorLogsComponent;
