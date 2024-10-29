import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import MainCard from '../../ui-component/cards/MainCard';
import { useTheme } from '@material-ui/styles';
import IconButton from '@material-ui/core/IconButton';

import * as Yup from 'yup';
import { Formik } from 'formik';
import toast from 'react-hot-toast';

import {
    Box, Button,
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

import AnimateButton from '../../ui-component/extended/AnimateButton';
import useScriptRef from '../../hooks/useScriptRef';
import { DataGrid, GridToolbar } from '@material-ui/data-grid';
import { CustomLoadingOverlay, CustomNoRowsOverlay } from '../../ui-component/CustomNoRowOverlay';
import FileUploadIcon from '@material-ui/icons/FileUpload';
import ClearIcon from '@material-ui/icons/Clear';

import { useStyles } from './videos.styles';
import { fetchApi } from '../../utils/fetchHelper';
import endpoints from '../../configs/endpoints';

import { useDropzone } from 'react-dropzone';
import LinearProgressBar from '../../ui-component/LinearProgress';
import LoaderInnerCircular from '../../ui-component/LoaderInnerCircular';

import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip'; // 导入 Tooltip 组件
import Typography from '@material-ui/core/Typography';

const AddVideoComponent = ({ isLoading, fetchVideoGroups, videoGroups }) => {
    const history = useHistory();
    const theme = useTheme();
    const classes = useStyles();
    const scriptedRef = useScriptRef();

    const [selectedVideoGroup, setSelectedVideoGroup] = React.useState('');
    const [videoGroupOpts, setVideoGroupOpts] = React.useState(null);
    const [selectedFiles, setSelectedFiles] = React.useState([]);
    const [uploadPercentage, setUploadPercentage] = React.useState(null);
    const [processingVideo, setProcessingVideo] = React.useState(false);
    const [tableData, setTableData] = React.useState([]); // 更新为存储表格数据的数组

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

    const files = selectedFiles?.map(file => (
        // <div className={classes.selectedFileTitle} key={file.path}>
        //     <li>
        //         {file.path} - {file.size} bytes
        //         <Box sx={{ ml: 10 }}>
        //             <ClearIcon onClick={removeFile(file)} />
        //         </Box>
        //     </li>
        // </div>
        <li key={file.path} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <Typography variant="body2">{file.path} - {(file.size / 1024).toFixed(2)} KB</Typography>
            <IconButton onClick={removeFile(file)} style={{ marginLeft: '10px' }}>
                <ClearIcon />
            </IconButton>
        </li>
    ));

    const handleVideoGroupChange = (value) => {
        setSelectedVideoGroup(value);
    };

    const uploadFile = async (data) => {
        const response = await fetchApi({
            method: 'POST',
            url: endpoints.upload_file,
            data: data,
            onUploadProgress: progressEvent => {
                const { total, loaded } = progressEvent;
                const uploadPercentage = (loaded / total) * 100;
                setUploadPercentage(uploadPercentage.toFixed(2));

                if (uploadPercentage >= 100) {
                    setProcessingVideo(true);
                }
            }
        }, true);

        return response; // 返回完整的响应，包括状态和消息
    };

    // 更新以处理正确解析的表格数据
    const handleFilePreview = (response) => {
        if (response?.status && response.files.length > 0) {
            const newTableData = response.files[0]?.result?.data || [];
            setTableData(newTableData); // 保存表格数据
        }
    };

    React.useEffect(() => {
        setUploadPercentage(null);
    }, []);

    // 定义用于生成带有 Tooltip 和 valueGetter 的列
    const generateColumnsWithTooltip = () => {
        if (tableData.length === 0) return [];

        return Object.keys(tableData[0]).map((key) => ({
            field: key,
            headerName: key.charAt(0).toUpperCase() + key.slice(1), // 将字段名称首字母大写
            width: 200, // 根据需要设置列宽
            sortable: true, // 根据需要设置是否可排序
            resizable: false,
            valueGetter: (params) => params.value?.toString() || '', // 将值转换为字符串
            renderCell: (params) => (
                <Tooltip title={params.value?.toString() || ''} arrow>
                    <Typography variant='body2' noWrap>
                        {params.value}
                    </Typography>
                </Tooltip>
            )
        }));
    };

    return (
        <MainCard title='Add File' boxShadow shadow={theme.shadows[2]}>
            <Box sx={{ ml: 2, mb: 2, overflow: 'hidden' }}>
                <Formik
                    initialValues={{}}
                    validationSchema={Yup.object().shape({
                        videoGroup: Yup.string().optional('Please select the video group')
                    })}
                    onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                        try {
                            const data = new FormData();
                            if (selectedFiles?.length) {
                                for (const file of selectedFiles) {
                                    data.append('file', file);
                                }
                                data.set('group', selectedVideoGroup);
                            }
                            const response = await uploadFile(data); // 上传并获取 JSON 响应
                            console.log('response', response);
                            if (response?.status) {
                                toast.success('Parse successful!');
                                handleFilePreview(response);  // 传递完整的响应到预览处理器
                            }
                            setProcessingVideo(false); // 处理完响应后设置为 false
                        } catch (err) {
                            if (err.status === 413) {
                                setErrors({ submit: 'File size too large. Please upload a smaller file' });
                                toast.error('File size too large. Please upload a smaller file');
                            }
                            console.error('Error uploading file', err);
                            setErrors({ submit: err.message });
                            setSubmitting(false);
                            setProcessingVideo(false); // 在错误情况下也设置为 false
                        }
                    }}
                >
                    {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                        <form onSubmit={handleSubmit}>
                            <Box sx={{ mt: 2, mb: 2 }}>
                                <Grid item xs={12} sm={12} md={12} lg={6}>
                                    <section className='container'>
                                        {!uploadPercentage && (
                                            <div {...getRootProps({ className: 'dropzone' })}>
                                                <input {...getInputProps()} />
                                                <FileUploadIcon />
                                                <p>Drag 'n' drop some files here, or click to select PDF or Excel file</p>
                                            </div>
                                        )}
                                        {!!selectedFiles?.length && (
                                            <aside>
                                                <div className={classes.selectedFileTitle}>
                                                    <h4>Selected File</h4>
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
                            </Box>
                            <Box sx={{ mt: 4, mb: 2 }}>
                                <Grid item xs={12} sm={12} md={12} lg={6}>
                                    {(!!processingVideo && (Math.abs(uploadPercentage || 0) === 100)) &&
                                    <div>
                                        Processing Uploaded file: <LoaderInnerCircular />
                                        This may take a few minutes...
                                    </div>}
                                    {((Math.abs(uploadPercentage || 0) !== 100) && !processingVideo) && (
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
                                    {((Math.abs(uploadPercentage || 0) === 100) && !processingVideo) && (
                                        <AnimateButton>
                                            <Button
                                                disableElevation
                                                fullWidth
                                                size='large'
                                                variant='contained'
                                                color='primary'
                                                onClick={() => {
                                                    selectedFiles.length = 0;
                                                    setSelectedVideoGroup(null);
                                                    setSelectedFiles([]);
                                                    setUploadPercentage(null);
                                                    setTableData([]); // 在新上传时清除表格数据
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
                            id: index + 1, // 为每一行动态添加唯一的 id
                        }))}
                        columns={generateColumnsWithTooltip()} // 使用带有 Tooltip 和 valueGetter 的列
                        pageSize={10}
                        checkboxSelection={false}
                        autoHeight
                        autoPageSize
                        density={'standard'}
                        disableSelectionOnClick
                        loading={isLoading} // 根据需要调整是否显示加载状态
                        components={{
                            Toolbar: GridToolbar,
                            LoadingOverlay: CustomLoadingOverlay, // 自定义加载组件
                            NoRowsOverlay: CustomNoRowsOverlay // 自定义无数据组件
                        }}
                    />
                </Box>
            )}
        </MainCard>
    );
};

export default AddVideoComponent;