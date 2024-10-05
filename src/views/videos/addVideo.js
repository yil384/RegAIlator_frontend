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
    Select
} from '@material-ui/core';

import AnimateButton from '../../ui-component/extended/AnimateButton';
import useScriptRef from '../../hooks/useScriptRef';
import { fetchVideoGroupsAction } from '../video-group/video-groups.actions';
import FileUploadIcon from '@material-ui/icons/FileUpload';
import ClearIcon from '@material-ui/icons//Clear';

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
        <div className={classes.selectedFileTitle}>
            <li key={file.path}>
                {file.path} - {file.size} bytes
            </li>
            <Box sx={{ ml: 10 }}>
                <ClearIcon onClick={removeFile(file)} />
            </Box>
        </div>
    ));

    const handleVideoGroupChange = (value) => {
        // console.log('value', value);
        setSelectedVideoGroup(value);
    };

    const uploadFile = (data) => fetchApi({
        method: 'POST',
        // url: `${config[config.env].URL}${endpoints.upload_file}`,
        url: endpoints.upload_file,
        data: data,
        onUploadProgress: progressEvent => {
            setProcessingVideo(true);
            const { total, loaded } = progressEvent;
            const totalSizeInMB = total / 1000000;
            const loadedSizeInMB = loaded / 1000000;
            const uploadPercentage = (loadedSizeInMB / totalSizeInMB) * 100;
            setUploadPercentage(uploadPercentage.toFixed(2));
            // console.log('total size in MB ==> ', totalSizeInMB);
            // console.log('uploaded size in MB ==> ', loadedSizeInMB);
        } // TO SHOW UPLOAD STATUS
    }, true);

    React.useEffect(() => {
        fetchVideoGroups();
    }, [fetchVideoGroups]);

    React.useEffect(() => {
        setVideoGroupOpts(videoGroups?.results);
    }, [videoGroups]);

    React.useEffect(() => {
        setUploadPercentage(null);
    }, []);

    // console.log('uploadPercentage', uploadPercentage);

    return (
        <MainCard title='Add Video' boxShadow shadow={theme.shadows[2]}>
            <Box sx={{ ml: 2, mb: 2, height: '70vh', overflow: 'scroll' }}>
                <Formik
                    initialValues={{}}
                    validationSchema={Yup.object().shape({
                        // name: Yup.string().min(2).required('Video name is required'),
                        videoGroup: Yup.string().required('Please select the video group')
                    })}
                    onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                        try {
                            if (scriptedRef.current) {
                                setStatus({ success: true });
                                setSubmitting(true);
                                const data = new FormData();
                                if (selectedFiles?.length) {
                                    for (const single_file of selectedFiles) {
                                        // console.log('single_file', single_file);
                                        data.append('file', single_file);
                                    }
                                    data.set('group', selectedVideoGroup);
                                }
                                const response = await uploadFile(data);
                                if (response?.status) {
                                    setProcessingVideo(false);
                                    // console.log(response);
                                    // setSelectedFiles([]);
                                    toast.success('Upload successful!');
                                    // history.push('videos');
                                }
                            }
                        } catch (err) {
                            console.error(err);
                            if (scriptedRef.current) {
                                setStatus({ success: false });
                                setErrors({ submit: err.message });
                                setSubmitting(false);
                            }
                        }
                    }}
                >
                    {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                        <form onSubmit={handleSubmit}>
                            <Grid container>
                                <Grid item xs={12} sm={12} md={12} lg={6}>
                                    {/*<FormControl fullWidth className={classes.input}>*/}
                                    {/*    <InputLabel htmlFor='video-name'>Video Name</InputLabel>*/}
                                    {/*    <OutlinedInput*/}
                                    {/*        id='video-name'*/}
                                    {/*        type='text'*/}
                                    {/*        value={values?.name}*/}
                                    {/*        name='name'*/}
                                    {/*        onBlur={handleBlur}*/}
                                    {/*        onChange={handleChange}*/}
                                    {/*        label='Video Name'*/}
                                    {/*        inputProps={{*/}
                                    {/*            classes: {*/}
                                    {/*                notchedOutline: classes.notchedOutline*/}
                                    {/*            }*/}
                                    {/*        }}*/}
                                    {/*    />*/}
                                    {/*    {errors.name && (*/}
                                    {/*        <FormHelperText error id='standard-weight-helper-text-video-name'>*/}
                                    {/*            {errors.name}*/}
                                    {/*        </FormHelperText>*/}
                                    {/*    )}*/}
                                    {/*</FormControl>*/}
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
                                            {videoGroupOpts?.map(({ id, groupName }) => {
                                                return (
                                                    <MenuItem key={id} value={id}>{groupName}</MenuItem>
                                                );
                                            })}
                                        </Select>
                                        {errors.videoGroup && (
                                            <FormHelperText error
                                                            id='standard-weight-helper-text-video-group'>
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
                                            <p>Drag 'n' drop some files here, or click to select video file</p>
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
