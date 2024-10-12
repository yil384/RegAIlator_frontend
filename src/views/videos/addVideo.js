import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import MainCard from '../../ui-component/cards/MainCard';
import { useTheme } from '@material-ui/styles';

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
import { fetchVideoGroupsAction } from '../video-group/video-groups.actions';
import FileUploadIcon from '@material-ui/icons/FileUpload';
import ClearIcon from '@material-ui/icons/Clear';

import { useStyles } from './videos.styles';
import { fetchApi } from '../../utils/fetchHelper';
import endpoints from '../../configs/endpoints';

import { useDropzone } from 'react-dropzone';
import LinearProgressBar from '../../ui-component/LinearProgress';
import LoaderInnerCircular from '../../ui-component/LoaderInnerCircular';

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
    const [tableData, setTableData] = React.useState([
        {
            id: 1,
            name: 'John Doe',
            age: 25,
            email: 'hh',
            phone: '1234567890',
            address: '1234 Main St',
            city: 'New York',
            state: 'NY',
            country: 'USA'

        },
        {
            id: 2,
            name: 'Jane Doe',
            age: 32,
            email: 'hh',
            phone: '1234567890',
            address: '1234 Main St',
            city: 'New York',
            state: 'NY',
            country: 'USA'
        }
    ]); // Updated to store an array of table data

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
        <div className={classes.selectedFileTitle} key={file.path}>
            <li>
                {file.path} - {file.size} bytes
                <Box sx={{ ml: 10 }}>
                    <ClearIcon onClick={removeFile(file)} />
                </Box>
            </li>
        </div>
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
            }
        }, true);
    
        return response; // Return the full response including status and message
    };    

    // Update to handle the correct parsing of table data
    const handleFilePreview = (response) => {
        if (response?.status && response.files.length > 0) {
            const newTableData = response.files[0]?.result?.data || [];
            setTableData(newTableData); // Save the table data
        }
    };

    React.useEffect(() => {
        fetchVideoGroups();
    }, [fetchVideoGroups]);

    React.useEffect(() => {
        setVideoGroupOpts(videoGroups?.results);
    }, [videoGroups]);

    React.useEffect(() => {
        setUploadPercentage(null);
    }, []);

    return (
        <MainCard title='Add Video' boxShadow shadow={theme.shadows[2]}>
            <Box sx={{ ml: 2, mb: 2, overflow: 'hidden' }}>
                <Formik
                    initialValues={{}}
                    validationSchema={Yup.object().shape({
                        videoGroup: Yup.string().required('Please select the video group')
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
                            const response = await uploadFile(data); // Upload and get JSON response
                            console.log('response', response);
                            if (response?.status) {
                                toast.success('Upload successful!');
                                handleFilePreview(response);  // Pass the full response to the preview handler
                            }
                        } catch (err) {
                            console.error(err);
                            setErrors({ submit: err.message });
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                        <form onSubmit={handleSubmit}>
                            <Grid container>
                                <Grid item xs={12} sm={12} md={12} lg={6}>
                                    <FormControl fullWidth className={classes.selectInput}>
                                        <InputLabel htmlFor='video-group'>Video Group</InputLabel>
                                        <Select
                                            id='video-group'
                                            labelId='video-group'
                                            value={selectedVideoGroup}
                                            name='videoGroup'
                                            onChange={(e) => {
                                                handleChange(e);
                                                handleVideoGroupChange(e.target.value);
                                            }}
                                            label='Video Group'
                                            inputProps={{
                                                classes: {
                                                    notchedOutline: classes.notchedOutline
                                                }
                                            }}
                                        >
                                            <MenuItem value=''>
                                                <em>None</em>
                                            </MenuItem>
                                            {videoGroupOpts?.map(({ id, groupName }) => (
                                                <MenuItem key={id} value={id}>{groupName}</MenuItem>
                                            ))}
                                        </Select>
                                        {errors.videoGroup && (
                                            <FormHelperText error id='standard-weight-helper-text-video-group'>
                                                {errors.videoGroup}
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 2, mb: 2 }}>
                                <Grid item xs={12} sm={12} md={12} lg={6}>
                                    <section className='container'>
                                        {!uploadPercentage && (<div {...getRootProps({ className: 'dropzone' })}>
                                            <input {...getInputProps()} />
                                            <FileUploadIcon />
                                            <p>Drag 'n' drop some files here, or click to select PDF or Excel file</p>
                                        </div>)}
                                        {!!selectedFiles?.length && (<aside>
                                            <div className={classes.selectedFileTitle}>
                                                <h4>Selected File</h4>
                                            </div>
                                            <ul>{files}</ul>
                                            <Grid item xs={4} sm={4} md={4} lg={4}>
                                                {files.length > 1 && <button onClick={removeAll}>Remove All</button>}
                                            </Grid>
                                        </aside>)}
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
                                        Processing Video file: <LoaderInnerCircular />
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
                                                    setTableData([]); // Clear table data on new upload
                                                }}
                                            >
                                                Upload more videos
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
                        rows={tableData}
                        columns={[
                            // 根据 tableData 中的数据动态生成列
                            ...Object.keys(tableData[0]).map((key) => ({
                                field: key,
                                headerName: key.charAt(0).toUpperCase() + key.slice(1), // 将字段名称首字母大写
                                width: 150, // 根据需要设置列宽
                                // description: 'This column has a value getter and is not sortable.',
                                sortable: false,
                                resizable: false,
                            }))
                        ]}
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

const mapStateToProps = (state) => ({
    isLoading: state.videoGroupsReducer.isLoading,
    videoGroups: state.videoGroupsReducer.videoGroups
});

const mapDispatchToProps = (dispatch) => ({
    fetchVideoGroups: (obj) => dispatch(fetchVideoGroupsAction(obj))
});

export default connect(mapStateToProps, mapDispatchToProps)(AddVideoComponent);
