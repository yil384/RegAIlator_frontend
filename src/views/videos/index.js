import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast'; // Optional: For toast notifications

import MainCard from '../../ui-component/cards/MainCard';
import { DataGrid, GridToolbar } from '@material-ui/data-grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import EditIcon from '@material-ui/icons/Edit';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import LoaderInnerCircular from '../../ui-component/LoaderInnerCircular';

import { CustomLoadingOverlay, CustomNoRowsOverlay } from '../../ui-component/CustomNoRowOverlay';
import { fetchVideos, deleteVideo } from './videos.helper';
import { useTheme } from '@material-ui/styles';

// Import PDF Viewer Components
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import CloseIcon from '@material-ui/icons/Close';
import { Tooltip, Checkbox } from '@material-ui/core';

import CheckCircleIcon from '@material-ui/icons/CheckCircle'; // Solid circle with check
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked'; // Hollow circle

import config from '../../configs';
import { fetchSuppliers } from '../suppliers/helper';
import { get } from 'jquery';

// **Import DownloadIcon**
import DownloadIcon from '@material-ui/icons/CloudDownload'; // You can choose any suitable download icon
import AddVideoComponent from './addVideo';

// Set PDF Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const VideosComponent = ({ user }) => {
    const theme = useTheme();
    const history = useHistory();
    const userRole = user?.role;

    const [videos, setVideos] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const [suppliers, setSuppliers] = React.useState([]);

    // Dialog state
    const [openDialog, setOpenDialog] = React.useState(false);
    const [selectedVideo, setSelectedVideo] = React.useState(null);
    const [scale, setScale] = React.useState(1.0); // Initial zoom scale
    const [openAddVideoDialog, setOpenAddVideoDialog] = React.useState(false); // State for Add Video Dialog

    const handleZoomIn = () => {
        setScale(prevScale => (prevScale < 3.0 ? prevScale + 0.2 : prevScale)); // Max zoom 3.0
    };
    const handleZoomOut = () => {
        setScale(prevScale => (prevScale > 0.4 ? prevScale - 0.2 : prevScale)); // Min zoom 0.4
    };

    const [numPages, setNumPages] = React.useState(null);
    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const loadData = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetchVideos({ sortBy: '-updatedAt' });
            setVideos(response?.results || []);
            const suppliersResponse = await fetchSuppliers();
            setSuppliers(suppliersResponse || []);
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
            // Optional: Add error handling
            console.error('Failed to load:', e);
            toast.error('Failed to load files');
        }
    }, []);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    // Open dialog and set selected video
    const handleOpenDialog = (video) => {
        setSelectedVideo(video);
        setOpenDialog(true);
    };

    // Close dialog
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedVideo(null);
    };

    // **Selection State and Handlers**
    const [selectedIds, setSelectedIds] = React.useState([]); // Selected file IDs
    const [filterIds, setFilterIds] = React.useState([]); // Filtered file IDs

    // Handle individual row selection
    const handleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Handle select all
    const handleSelectAll = () => {
        const allRowIds = filterIds.map((id) => id);
        if (filterIds.every((id) => selectedIds.includes(id))) {
            setSelectedIds(selectedIds.filter((id) => !filterIds.includes(id)));
        } else {
            setSelectedIds([...new Set([...selectedIds, ...allRowIds])]);
        }
    };

    // 在 handleDownload 函数中实现多个文件下载
    const handleDownload = () => {
        if (selectedIds.length === 0) {
            toast.warning('No videos selected for download.');
            return;
        }
    
        const selectedVideos = videos.filter(video => selectedIds.includes(video.id));
    
        selectedVideos.forEach(async (video, index) => {
            try {
                const response = await fetch(config[config.env].baseURL + video.path);
                const blob = await response.blob();
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.href = url;
                link.setAttribute('download', video.title || 'download'); // 设置下载文件名
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url); // 清理 URL 对象
            } catch (error) {
                console.error('File download error:', error);
                toast.error(`Failed to download ${video.title}`);
            }
        });
    
        toast.success('Download initiated for selected videos.');
    };    

    const columns = [
        // **Selection Column**
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
                    color="primary"
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
        // **Existing Columns**
        {
            field: 'supplier',
            headerName: 'Supplier Name',
            width: 200,
            editable: false,
            resizable: false,
            disableClickEventBubbling: true,
            renderCell: (params) => {
                const supplierEmail = params.row?.supplier;
        
                // If supplier email exists, find the corresponding supplier data
                const matchedSupplier = suppliers.find(supplier => supplier.contact === supplierEmail);
        
                return (
                    <Tooltip title={matchedSupplier ? matchedSupplier.supplierName : 'Supplier not found'} arrow>
                        <Typography variant='body1' noWrap>
                            {matchedSupplier ? matchedSupplier.supplierName : ''}
                        </Typography>
                    </Tooltip>
                );
            }
        },        
        {
            field: 'title',
            headerName: 'File Name',
            width: 250,
            editable: false,
            resizable: false,
            disableClickEventBubbling: true
        },
        {
            field: 'updatedAt',
            headerName: 'Last Updated',
            width: 200,
            editable: false,
            resizable: false,
            disableClickEventBubbling: true,
            renderCell: (params) => (
                <Typography variant='body1'>
                    {new Date(params.row?.updatedAt).toLocaleString()}
                </Typography>
            )
        },
        {
            field: 'accessState',
            headerName: 'Access Status',
            description: 'Group privilege',
            sortable: false,
            width: 160,
            editable: false,
            resizable: false,
            disableClickEventBubbling: true,
            renderCell: (params) => (
                <Typography variant='body1'>
                    {params.row?.accessState.toUpperCase()}
                </Typography>
            )
        },
        {
            field: 'Actions',
            headerName: 'Actions',
            headerAlign: 'center',
            description: 'Tools',
            sortable: false,
            width: 190,
            resizable: false,
            hide: userRole === 'student',
            renderCell: (params) => (
                <strong>
                    <Button
                        variant='contained'
                        color='primary'
                        size='small'
                        startIcon={<EditIcon />}
                        style={{ marginLeft: 16 }}
                        onClick={() => handleOpenDialog(params.row)}
                    >
                        Details
                    </Button>
                    <IconButton
                        style={{ marginLeft: 16 }}
                        onClick={(event) => {
                            event.stopPropagation(); // Prevent event bubbling
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
            )
        }
    ];

    // **Dialog DataGrid Columns**
    const dialogColumns = React.useMemo(() => {
        if (!selectedVideo?.json?.data?.length) return [];
        return Object.keys(selectedVideo.json.data[0]).map((key) => ({
            field: key,
            headerName: key.charAt(0).toUpperCase() + key.slice(1),
            width: 100 + key.length * 10,
            renderCell: (params) => (
                <Tooltip title={params.value}>
                    <Typography variant='body1' noWrap>
                        {params.value}
                    </Typography>
                </Tooltip>
            )
        }));
    }, [selectedVideo]);

    const dialogRows = React.useMemo(() => {
        if (!selectedVideo?.json?.data?.length) return [];
        return selectedVideo.json.data.map((item, index) => ({
            id: index,
            ...item
        }));
    }, [selectedVideo]);

    return (
        <MainCard title='All Files' boxShadow shadow={theme.shadows[2]}>
            {/* **Action Buttons** */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    style={{ top: -70, marginLeft: '10px' }}
                    onClick={() => setOpenAddVideoDialog(true)}
                >
                    Add Files
                </Button>
                <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    style={{ top: -70, marginLeft: '10px' }}
                    onClick={handleDownload}
                    disabled={selectedIds.length === 0}
                    startIcon={<DownloadIcon />} // Ensure DownloadIcon is imported
                >
                    Download Selected
                </Button>
                {/* You can add more buttons here if needed */}
            </div>

            <div style={{ width: '100%', marginTop: -31 }}>
                {
                    isLoading ? <LoaderInnerCircular /> :
                        (
                        <DataGrid
                            rows={videos}
                            columns={columns}
                            pageSize={10}
                            rowsPerPageOptions={[100]}
                            checkboxSelection={false} // Disabled since we're using custom selection
                            autoHeight
                            autoPageSize
                            density='standard'
                            disableSelectionOnClick
                            loading={isLoading}
                            components={{
                                Toolbar: GridToolbar,
                                LoadingOverlay: CustomLoadingOverlay,
                                NoRowsOverlay: CustomNoRowsOverlay
                            }}
                            onFilterModelChange={(model) => {
                                const filter = model.items.map((item) => {
                                    return [
                                        item.columnField,
                                        item.operatorValue,
                                        item.value
                                    ];
                                });
                                const filterids = videos
                                    .filter((video) => {
                                        return filter.every(
                                            ([field, operator, value]) => {
                                                const cellValue = video[field];
                                                if (operator === 'isEmpty') {
                                                    return (
                                                        cellValue === '' ||
                                                        cellValue === undefined
                                                    );
                                                } else if (operator === 'isNotEmpty') {
                                                    return (
                                                        cellValue !== '' &&
                                                        cellValue !== undefined
                                                    );
                                                } else if (value === undefined) {
                                                    return true;
                                                } else if (operator === 'contains') {
                                                    return cellValue
                                                        ?.toString()
                                                        .toLowerCase()
                                                        .includes(
                                                            value.toLowerCase()
                                                        );
                                                } else if (operator === 'equals') {
                                                    return (
                                                        cellValue
                                                            ?.toString()
                                                            .toLowerCase() ===
                                                        value.toLowerCase()
                                                    );
                                                } else if (operator === 'startsWith') {
                                                    return cellValue
                                                        ?.toString()
                                                        .toLowerCase()
                                                        .startsWith(
                                                            value.toLowerCase()
                                                        );
                                                } else if (operator === 'endsWith') {
                                                    return cellValue
                                                        ?.toString()
                                                        .toLowerCase()
                                                        .endsWith(value.toLowerCase());
                                                } else {
                                                    return false;
                                                }
                                            }
                                        );
                                    })
                                    .map((video) => video.id);
                                setFilterIds(filterids);
                            }}
                        />
                        )
                }
            </div>

            {/* Add Video Dialog */}
            <Dialog
                open={openAddVideoDialog}
                onClose={() => setOpenAddVideoDialog(false)}
                fullWidth
                maxWidth="lg"
                aria-labelledby="add-video-dialog"
            >
                <DialogTitle id="add-video-dialog">
                    Add File
                    <IconButton
                        aria-label="close"
                        onClick={() => {setOpenAddVideoDialog(false); loadData();}}
                        style={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <AddVideoComponent
                        onUploadSuccess={() => {
                            setOpenAddVideoDialog(false);
                            loadData();
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {setOpenAddVideoDialog(false); loadData()}} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* **Dialog Component** */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="lg"
                aria-labelledby="video-details-dialog"
            >
                <DialogTitle id="video-details-dialog">
                    File Details
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseDialog}
                        style={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {selectedVideo ? (
                        <div style={{ display: 'flex', height: 666, width: '100%' }}>
                            {/* **PDF Preview Area** */}
                            <div style={{
                                flex: '9',
                                height: '100%',
                                border: `1px solid ${theme.palette.divider}`,
                                boxSizing: 'border-box',
                                backgroundColor: '#fff',
                                marginRight: '8px',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                            }}>
                                {/* **Zoom Control Buttons** */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                    <IconButton onClick={handleZoomOut} aria-label="zoom out">
                                        <ZoomOutIcon />
                                    </IconButton>
                                    <Typography variant="body2" style={{ margin: '0 8px' }}>
                                        {`${Math.round(scale * 100)}%`}
                                    </Typography>
                                    <IconButton onClick={handleZoomIn} aria-label="zoom in">
                                        <ZoomInIcon />
                                    </IconButton>
                                </div>
                                {/* **PDF Content Area** */}
                                <div style={{
                                    position: 'absolute',
                                    top: '29px', // Adjust based on button height
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    overflow: 'auto',
                                    padding: '8px'
                                }}>
                                    {selectedVideo.path ? (
                                        <Document
                                            file={config[config.env].baseURL + selectedVideo.path}
                                            onLoadError={console.error}
                                            onLoadSuccess={onDocumentLoadSuccess}
                                            loading={<LoaderInnerCircular />}
                                        >
                                            {Array.from(
                                                new Array(numPages),
                                                (el, index) => (
                                                    <Page
                                                        key={`page_${index + 1}`}
                                                        pageNumber={index + 1}
                                                        scale={scale} // Use zoom scale
                                                        // If needed, you can use the width property instead of scale
                                                    />
                                                )
                                            )}
                                        </Document>
                                    ) : (
                                        <Typography variant='body1'>
                                            No file available.
                                        </Typography>
                                    )}
                                </div>
                            </div>
                            {/* **DataGrid Area** */}
                            <div style={{
                                flex: '13',
                                height: '100%',
                                border: `1px solid ${theme.palette.divider}`,
                                boxSizing: 'border-box',
                                backgroundColor: '#fff',
                            }}>
                                <DataGrid
                                    rows={dialogRows}
                                    columns={dialogColumns}
                                    pageSize={11}
                                    rowsPerPageOptions={[5]}
                                    disableSelectionOnClick
                                    hideFooter
                                    autoHeight
                                    density='standard'
                                    components={{
                                        Toolbar: GridToolbar,
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <Typography variant='body1'>No data available.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </MainCard>
    );
};

const mapStateToProps = (state) => ({
    user: state.authReducer.user
});

export default connect(mapStateToProps, null)(VideosComponent);
