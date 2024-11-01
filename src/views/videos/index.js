import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast'; // Optional: For toast notifications

import MainCard from '../../ui-component/cards/MainCard';
import { DataGrid, GridToolbar } from '@material-ui/data-grid';
import { CustomToolbar } from '../../ui-component/CustomNoRowOverlay';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import EditIcon from '@material-ui/icons/Edit';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import LoaderInnerCircular from '../../ui-component/LoaderInnerCircular';

import { CustomLoadingOverlay, CustomNoRowsOverlay } from '../../ui-component/CustomNoRowOverlay';
import { fetchVideos, deleteVideo, addVideoWithSupplierId } from './videos.helper';
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
import { fetchSurveys } from '../survey-templates/helper';
import { get } from 'jquery';

// **Import DownloadIcon**
import DownloadIcon from '@material-ui/icons/CloudDownload'; // You can choose any suitable download icon
import VisibilityIcon from '@material-ui/icons/Visibility'; // Import the visibility icon
import JSZip from 'jszip';

import * as Yup from 'yup';
import { Formik } from 'formik';
import { useDropzone } from 'react-dropzone';
import LinearProgressBar from '../../ui-component/LinearProgress';
import AnimateButton from '../../ui-component/extended/AnimateButton';
import useScriptRef from '../../hooks/useScriptRef';
import { fetchApi } from '../../utils/fetchHelper';
import endpoints from '../../configs/endpoints';
import FileUploadIcon from '@material-ui/icons/FileUpload';
import ClearIcon from '@material-ui/icons/Clear';
import { useStyles } from './videos.styles'; // Ensure this style file exists
import {
    Box,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel, MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@material-ui/core';

import Papa from 'papaparse';
import { saveAs } from 'file-saver';

// Set PDF Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const VideosComponent = ({ user }) => {
    const theme = useTheme();
    const history = useHistory();
    const userRole = user?.role;
    const classes = useStyles();

    const [videos, setVideos] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);

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

    // 添加文件对话框的状态变量
    const [selectedFiles, setSelectedFiles] = React.useState([]);
    const [uploadPercentage, setUploadPercentage] = React.useState(null);
    const [processingFile, setProcessingFile] = React.useState(false);
    const [tableData, setTableData] = React.useState([]);
    const [selectedSupplier, setSelectedSupplier] = React.useState(null);
    const [suppliers, setSuppliers] = React.useState([]);

    const onDrop = React.useCallback(acceptedFiles => {
        setSelectedFiles([...selectedFiles, ...acceptedFiles]);
    }, [selectedFiles]);

    const { getRootProps, getInputProps } = useDropzone({
        maxFiles: 10,
        minSize: 1,
        onDrop
    });

    const removeFile = file => () => {
        const newFiles = [...selectedFiles];
        newFiles.splice(newFiles.indexOf(file), 1);
        setSelectedFiles(newFiles);
    };

    const removeAll = () => {
        setSelectedFiles([]);
    };

    const handleFilePreview = (response) => {
        if (response?.status && response.files.length > 0) {
            const newTableData = response.files[0]?.result?.data || [];
            setTableData(newTableData);
        }
    };

    const uploadFile = async (supplierId, data) => {
        const response = await fetchApi({
            method: 'POST',
            url: `${endpoints.upload_file}/${supplierId}`,
            data: data,
            onUploadProgress: progressEvent => {
                const { total, loaded } = progressEvent;
                const uploadPercentage = (loaded / total) * 100;
                setUploadPercentage(uploadPercentage.toFixed(2));

                if (uploadPercentage >= 100) {
                    setProcessingFile(true);
                }
            }
        }, true);

        return response;
    };

    const generateColumnsWithTooltip = () => {
        if (tableData.length === 0) return [];

        return Object.keys(tableData[0]).map((key) => ({
            field: key,
            headerName: key.charAt(0).toUpperCase() + key.slice(1),
            width: 200,
            sortable: true,
            resizable: false,
            valueGetter: (params) => params.value?.toString() || '',
            renderCell: (params) => (
                <Tooltip title={params.value?.toString() || ''} arrow>
                    <Typography variant='body2' noWrap>
                        {params.value}
                    </Typography>
                </Tooltip>
            )
        }));
    };

    const files = selectedFiles?.map(file => (
        <li key={file.path} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <Typography variant="body2">{file.path} - {(file.size / 1024).toFixed(2)} KB</Typography>
            <IconButton onClick={removeFile(file)} style={{ marginLeft: '10px' }}>
                <ClearIcon />
            </IconButton>
        </li>
    ));    

    const loadData = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetchVideos({ sortBy: '-updatedAt' });
            setVideos(response?.results || []);
            const suppliersResponse = await fetchSuppliers();
            setSuppliers(suppliersResponse);
            setIsLoading(false);
            setFilterIds(response?.results.map((video) => video.id) || []);
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
    // const handleDownload = () => {
    //     if (selectedIds.length === 0) {
    //         toast.warning('No videos selected for download.');
    //         return;
    //     }
    
    //     const selectedVideos = videos.filter(video => selectedIds.includes(video.id));
    
    //     selectedVideos.forEach(async (video, index) => {
    //         try {
    //             const response = await fetch(config[config.env].baseURL + video.path);
    //             const blob = await response.blob();
    //             const link = document.createElement('a');
    //             const url = URL.createObjectURL(blob);
    //             link.href = url;
    //             link.setAttribute('download', video.title || 'download'); // 设置下载文件名
    //             document.body.appendChild(link);
    //             link.click();
    //             document.body.removeChild(link);
    //             URL.revokeObjectURL(url); // 清理 URL 对象
    //         } catch (error) {
    //             console.error('File download error:', error);
    //             toast.error(`Failed to download ${video.title}`);
    //         }
    //     });
    
    //     toast.success('Download initiated for selected videos.');
    // };    

    // [Updated] Implement multiple file download as a zip using JSZip
    const handleDownload = async () => {
        if (selectedIds.length === 0) {
            toast.warning('No files selected for download.');
            return;
        }

        const selectedVideos = videos.filter(video => selectedIds.includes(video.id));

        if (selectedIds.length === 1) {
            // Single file download
            const video = selectedVideos[0];
            try {
                const response = await fetch(config[config.env].baseURL + video.path);
                if (!response.ok) throw new Error('Network response was not ok');
                const blob = await response.blob();
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.href = url;
                link.setAttribute('download', video.title || 'download');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                toast.success('Download initiated for selected file.');
            } catch (error) {
                console.error('File download error:', error);
                toast.error(`Failed to download ${video.title}`);
            }
        } else {
            // Multiple files zipped
            const zip = new JSZip();
            const errors = [];

            await Promise.all(selectedVideos.map(async (video) => {
                try {
                    const response = await fetch(config[config.env].baseURL + video.path);
                    if (!response.ok) throw new Error('Network response was not ok');
                    const blob = await response.blob();
                    zip.file(video.title || `file_${video.id}`, blob);
                } catch (error) {
                    console.error(`File download error for ${video.title}:`, error);
                    errors.push(video.title);
                }
            }));

            if (Object.keys(zip.files).length === 0) {
                toast.error('No files were downloaded successfully.');
                return;
            }

            try {
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(zipBlob);
                link.href = url;
                link.setAttribute('download', 'files.zip');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                if (errors.length > 0) {
                    toast.error(`Failed to download: ${errors.join(', ')}`);
                    toast.success('Downloaded other files successfully.');
                } else {
                    toast.success('Download initiated for selected files.');
                }
            } catch (error) {
                console.error('Zip generation error:', error);
                toast.error('Failed to generate zip file.');
            }
        }
    };    

    const handleDeleteMultiple = async () => {
        if (selectedIds.length === 0) {
            toast.warning('No files selected for deletion.');
            return;
        }

        // Show confirmation dialog
        const result = await Swal.fire({
            text: 'Are you sure you wish to delete the selected items?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: theme.palette.primary['main'],
            cancelButtonColor: theme.palette.error['dark'],
            confirmButtonText: 'Yes, delete them!'
        });

        if (result.isConfirmed) {
            try {
                // Delete selected files
                await Promise.all(selectedIds.map(id => deleteVideo(id)));

                await loadData(); // Reload data after deletion
                setSelectedIds([]); // Clear selected IDs
                Swal.fire('Deleted!', 'Your items have been deleted.', 'success');
            } catch (error) {
                console.error('Failed to delete files:', error);
                toast.error('Failed to delete selected files.');
            }
        }
    };    

    // **Add state for viewing selected details**
    const [openSelectedDetailsDialog, setOpenSelectedDetailsDialog] = React.useState(false);
    const [selectedVideosData, setSelectedVideosData] = React.useState([]);

    const handleViewSelectedDetails = () => {
        if (selectedIds.length === 0) {
            toast.warning('No files selected.');
            return;
        }

        const selectedVideos = videos.filter(video => selectedIds.includes(video.id));

        setSelectedVideosData(selectedVideos);

        setOpenSelectedDetailsDialog(true);
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
            renderCell: (params) => (
                <Typography variant='body1'>
                    {/* Use params.row?.supplier as ID to get the name */}
                    {suppliers.find(supplier => supplier._id === params.row?.supplier)?.supplierName}
                </Typography>
            )
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

    const handleExportAll = () => {
        if (selectedVideosData.length === 0) {
            toast.warning('No data available to export.');
            return;
        }
    
        // 准备合并后的数据数组
        const mergedData = [];
    
        selectedVideosData.forEach((video) => {
            // 如果数据不合法，则跳过
            if (!video.json?.data) return;
            if (video.json?.data?.length > 0) {
                // 在每条数据中添加一个字段以标识其来源视频
                video.json.data.forEach((row) => {
                    mergedData.push({
                        ...row,
                        SourceVideo: video.title || 'Unknown',
                    });
                });
            }
        });
    
        if (mergedData.length === 0) {
            toast.warning('No data available to export.');
            return;
        }
    
        // 使用 PapaParse 将 JSON 转换为 CSV
        const csv = Papa.unparse(mergedData);
    
        // 创建一个 Blob 对象并触发下载
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

        // 获取当前日期和时间
        const currentDate = new Date();
        // 格式化日期为 YYYY-MM-DD
        const formattedDate = currentDate.toISOString().split('T')[0]; // 例如: 2024-04-27
        // 格式化时间为 HH-MM-SS，替换特殊字符以适应文件名
        const formattedTime = currentDate.toTimeString().split(' ')[0].replace(/:/g, '-'); // 例如: 14-30-45
        // 构建文件名，确保没有非法字符
        const fileName = `Exported_data_${selectedVideosData.length}_Created_at_${formattedDate}_${formattedTime}`;
        saveAs(blob, `${fileName}.csv`);
        
        toast.success('All data has been exported successfully.');
    };
    
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
                <Button
                    variant='contained'
                    color='secondary'
                    size='small'
                    style={{ top: -70, marginLeft: '10px' }}
                    onClick={handleDeleteMultiple}
                    disabled={selectedIds.length === 0}
                    startIcon={<DeleteIcon />} // Ensure DeleteIcon is imported
                >
                    Delete Selected
                </Button>
                {/* **New View Selected Details Button** */}
                <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    style={{ top: -70, marginLeft: '10px' }}
                    onClick={handleViewSelectedDetails}
                    disabled={selectedIds.length === 0}
                    startIcon={<VisibilityIcon />} // Ensure VisibilityIcon is imported
                >
                    View Selected Details
                </Button>
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
                                Toolbar: () => <CustomToolbar title={'All Files'} length={videos.length} />,
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

            {/* Add File Dialog */}
            <Dialog
                open={openAddVideoDialog}
                onClose={() => setOpenAddVideoDialog(false)}
                fullWidth
                maxWidth="sm"
                aria-labelledby="add-file-dialog"
            >
                <DialogTitle id="add-file-dialog">
                    Add File
                    <IconButton
                        aria-label="close"
                        onClick={() => { setOpenAddVideoDialog(false); loadData(); }}
                        style={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <MainCard title='Add File' boxShadow shadow={theme.shadows[2]}>
                        <Box sx={{ ml: 2, mb: 2, overflow: 'hidden' }}>
                            <Formik
                                initialValues={{
                                    survey: null
                                }}
                                validationSchema={
                                    Yup.object().shape({ supplier: Yup.object().nullable().required('Supplier is required') })
                                }
                                onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                                    try {
                                        const data = new FormData();
                                        if (selectedFiles?.length) {
                                            for (const file of selectedFiles) {
                                                data.append('file', file);
                                            }
                                        }
                                        console.log('selected supplier', selectedSupplier);
                                        console.log('selected files', selectedFiles);
                                        const response = await uploadFile(selectedSupplier._id, data);
                                        if (response?.status) {
                                            toast.success('Parse successful!');
                                            handleFilePreview(response);
                                        }
                                        setProcessingFile(false);
                                    } catch (err) {
                                        if (err.status === 413) {
                                            setErrors({ submit: 'File size too large. Please upload a smaller file' });
                                            toast.error('File size too large. Please upload a smaller file');
                                        }
                                        console.error('Error uploading file', err);
                                        setErrors({ submit: err.message });
                                        setSubmitting(false);
                                        setProcessingFile(false);
                                    }
                                }}
                            >
                                {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                                    <form onSubmit={handleSubmit}>
                                        <Box sx={{ mt: 2, mb: 2 }}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={12} md={12}>
                                                    <FormControl
                                                        fullWidth
                                                        error={Boolean(touched.supplier && errors.supplier)}
                                                    >
                                                        <InputLabel id="select-supplier-label"
                                                                    classes={{
                                                                        shrink: classes.shrinkLabel
                                                                    }}
                                                        >Select Supplier</InputLabel>
                                                        <Select
                                                            labelId="select-supplier-label"
                                                            id="select-supplier"
                                                            name="supplier"
                                                            value={selectedSupplier?.supplierName}
                                                            onChange={(e) => {
                                                                console.log('selected supplier', e.target.value);
                                                                setSelectedSupplier(e.target.value);
                                                                handleChange(e);
                                                            }}
                                                            onBlur={handleBlur}
                                                            style={{ paddingTop: '10px' }}
                                                        >
                                                            <MenuItem value={null}>
                                                                <em>None</em>
                                                            </MenuItem>
                                                            {suppliers.map((supplier) => (
                                                                <MenuItem key={supplier._id} value={supplier}>
                                                                    {supplier.supplierName}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                        {touched.supplier && errors.supplier && (
                                                            <FormHelperText error>{errors.supplier}</FormHelperText>
                                                        )}
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12} sm={12} md={12}>
                                                    <section className='container'>
                                                        {!uploadPercentage && (
                                                            <div {...getRootProps({ className: 'dropzone' })}>
                                                                <input {...getInputProps()} />
                                                                <FileUploadIcon />
                                                                <p>Drag 'n' drop some files here, or click to select files</p>
                                                            </div>
                                                        )}
                                                        {!!selectedFiles?.length && (
                                                            <aside>
                                                                <div className={classes.selectedFileTitle}>
                                                                    <h4>Selected Files</h4>
                                                                </div>
                                                                <ul>{files}</ul>
                                                                <Grid item xs={4} sm={4} md={4} lg={4}>
                                                                    {files.length > 1 && 
                                                                    <Button variant="outlined" color="secondary" onClick={removeAll}>
                                                                        Remove All
                                                                    </Button>}
                                                                </Grid>
                                                            </aside>
                                                        )}
                                                    </section>
                                                    <Box sx={{ mt: 4, mb: 2 }}>
                                                        {(!!uploadPercentage) &&
                                                        <div>
                                                            Upload Status: <LinearProgressBar progress={uploadPercentage || 0} />
                                                        </div>
                                                        }
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                        <Box sx={{ mt: 4, mb: 2 }}>
                                            <Grid item xs={12} sm={12} md={12} lg={12}>
                                                {(!!processingFile && (Math.abs(uploadPercentage || 0) === 100)) &&
                                                <div>
                                                    Processing Uploaded file: <LoaderInnerCircular />
                                                    This may take a few minutes...
                                                </div>}
                                                {((Math.abs(uploadPercentage || 0) !== 100) && !processingFile) && (
                                                    <AnimateButton>
                                                        <Button
                                                            disableElevation
                                                            fullWidth
                                                            size='large'
                                                            type='submit'
                                                            variant='contained'
                                                            color='primary'
                                                            disabled={!selectedFiles?.length || !!uploadPercentage}
                                                        >
                                                            Start Upload
                                                        </Button>
                                                    </AnimateButton>
                                                )}
                                                {((Math.abs(uploadPercentage || 0) === 100) && !processingFile) && (
                                                    <AnimateButton>
                                                        <Button
                                                            disableElevation
                                                            fullWidth
                                                            size='large'
                                                            variant='contained'
                                                            color='primary'
                                                            onClick={() => {
                                                                selectedFiles.length = 0;
                                                                setSelectedFiles([]);
                                                                setUploadPercentage(null);
                                                                setTableData([]);
                                                            }}
                                                        >
                                                            Upload more files
                                                        </Button>
                                                    </AnimateButton>
                                                )}
                                            </Grid>
                                        </Box>
                                    </form>
                                )}
                            </Formik>
                        </Box>
                        {tableData.length > 0 && (
                            <Box sx={{ ml: 2, mb: 2, overflow: 'hidden' }}>
                                <DataGrid
                                    rows={tableData.map((row, index) => ({
                                        ...row,
                                        id: index + 1,
                                    }))}
                                    columns={generateColumnsWithTooltip()}
                                    pageSize={10}
                                    checkboxSelection={false}
                                    autoHeight
                                    autoPageSize
                                    density={'standard'}
                                    disableSelectionOnClick
                                    loading={isLoading}
                                    components={{
                                        Toolbar: () => <CustomToolbar title={'Parsed Data'} length={tableData.length} />,
                                        LoadingOverlay: CustomLoadingOverlay,
                                        NoRowsOverlay: CustomNoRowsOverlay
                                    }}
                                />
                            </Box>
                        )}
                    </MainCard>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setOpenAddVideoDialog(false); loadData(); }} color="primary">
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
                                        Toolbar: () => <CustomToolbar title={selectedVideo.title} length={dialogRows.length} />,
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
            {/* **Dialog Component** */}
            <Dialog
                open={openSelectedDetailsDialog}
                onClose={() => setOpenSelectedDetailsDialog(false)}
                fullWidth
                maxWidth="lg"
                aria-labelledby="selected-details-dialog"
            >
                <DialogTitle
                    id="selected-details-dialog"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="h6">Selected Files Details</Typography>
                    <div>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<DownloadIcon />}
                            onClick={handleExportAll}
                            style={{ marginRight: '8px' }}
                        >
                            Export All
                        </Button>
                        <IconButton
                            aria-label="close"
                            onClick={() => setOpenSelectedDetailsDialog(false)}
                        >
                            <CloseIcon />
                        </IconButton>
                    </div>
                </DialogTitle>
                <DialogContent>
                    {selectedVideosData.length > 0 ? (
                        selectedVideosData.map((video, index) => {
                            // For each video, render its data
                            const columns = Object.keys(video.json?.data[0] || {}).map((key) => ({
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

                            const rows = (video.json?.data || []).map((item, idx) => ({
                                id: idx,
                                ...item
                            }));

                            return (
                                <div key={video.id} style={{ marginBottom: '20px' }}>
                                    <Typography variant='h6' gutterBottom>
                                        {video.title}
                                    </Typography>
                                    <DataGrid
                                        rows={rows}
                                        columns={columns}
                                        pageSize={10}
                                        rowsPerPageOptions={[5]}
                                        disableSelectionOnClick
                                        autoHeight
                                        density='standard'
                                        components={{
                                            Toolbar: () => <CustomToolbar title={video.title} length={rows.length} />,
                                        }}
                                    />
                                </div>
                            );
                        })
                    ) : (
                        <Typography variant='body1'>No data available.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSelectedDetailsDialog(false)} color="primary">
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
