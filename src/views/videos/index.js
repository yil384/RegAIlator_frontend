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
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import LoaderInnerCircular from '../../ui-component/LoaderInnerCircular';

import { CustomLoadingOverlay, CustomNoRowsOverlay } from '../../ui-component/CustomNoRowOverlay';
import { fetchVideos, deleteVideo } from './videos.helper';
import { useTheme } from '@material-ui/styles';

// 导入 PDF 查看器组件
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import CloseIcon from '@material-ui/icons/Close';
import { Tooltip } from '@material-ui/core';

import config from '../../configs';
import { fetchSuppliers } from '../suppliers/helper';

// 设置 PDF Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const VideosComponent = ({ user }) => {
    const theme = useTheme();
    const history = useHistory();
    const userRole = user?.role;

    const [videos, setVideos] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const [suppliers, setSuppliers] = React.useState([]);

    // 对话框状态
    const [openDialog, setOpenDialog] = React.useState(false);
    const [selectedVideo, setSelectedVideo] = React.useState(null);
    const [scale, setScale] = React.useState(1.0); // 初始缩放比例
    const handleZoomIn = () => {
        setScale(prevScale => (prevScale < 3.0 ? prevScale + 0.2 : prevScale)); // 最大缩放比例3.0
    };
    const handleZoomOut = () => {
        setScale(prevScale => (prevScale > 0.4 ? prevScale - 0.2 : prevScale)); // 最小缩放比例0.4
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
            // 可选：添加错误处理
            console.error('Failed to load:', e);
        }
    }, []);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    // 打开对话框并设置选中的视频
    const handleOpenDialog = (video) => {
        setSelectedVideo(video);
        setOpenDialog(true);
    };

    // 关闭对话框
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedVideo(null);
    };

    const columns = [
        // { field: 'id', width: 200, headerName: 'ID', hide: false },
        {
            field: 'supplier',
            headerName: 'Supplier Name',
            width: 200,
            editable: false,
            resizable: false,
            disableClickEventBubbling: true,
            renderCell: (params) => {
                const supplierEmail = params.row?.supplier;
        
                // 如果有供应商邮箱，查找对应的供应商数据
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
            field: 'group',
            headerName: 'Assigned Group',
            width: 200,
            editable: false,
            resizable: false,
            disableClickEventBubbling: true,
            renderCell: (params) => (
                params.row?.group && 
                <Typography variant='body1'>
                    {params.row?.group.groupName}
                </Typography>
            )
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
            description: 'group privilege',
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
            description: 'tools',
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
                            event.stopPropagation(); // 防止事件冒泡
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

    // 对话框中 DataGrid 的列
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
                        />
                        )
                }
            </div>

            {/* Dialog 组件 */}
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
                            {/* PDF 预览区域 */}
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
                                {/* Zoom 控制按钮 */}
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
                                {/* PDF 内容区域 */}
                                <div style={{
                                    position: 'absolute',
                                    top: '29px', // 根据按钮的高度调整
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
                                                        scale={scale} // 使用缩放比例
                                                        // 如果需要，可以使用 width 属性代替 scale
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
                            {/* DataGrid 区域 */}
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
