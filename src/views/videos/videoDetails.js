import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import MainCard from '../../ui-component/cards/MainCard';
import { useTheme } from '@material-ui/styles';

import * as Yup from 'yup';
import { Formik } from 'formik';

import {
    Box, Button,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel, MenuItem,
    OutlinedInput, Select,
    Typography
} from '@material-ui/core';

import LoaderInnerCircular from '../../ui-component/LoaderInnerCircular';

import { useStyles } from './videos.styles';

import { fetchVideoDetails, updateVideo } from './videos.helper';

import useScriptRef from '../../hooks/useScriptRef';
import AnimateButton from '../../ui-component/extended/AnimateButton';

import SubCard from '../../ui-component/cards/SubCard';
import toast from 'react-hot-toast';
import { fetchVideoGroupsAction } from '../video-group/video-groups.actions';

const VideoDetailsComponent = ({ fetchVideoGroups, isLoading, videoGroups }) => {
    const history = useHistory();
    const theme = useTheme();
    const classes = useStyles();
    const scriptedRef = useScriptRef();
    const { id } = useParams();

    const [videoDetails, setVideoDetails] = React.useState(null);
    const [videoGroupOpts, setVideoGroupOpts] = React.useState(null);
    const [selectedVideoGroup, setSelectedVideoGroup] = React.useState('');
    const [selectedAccessState, setSelectedAccessState] = React.useState('public');

    const handleVideoGroupChange = (value) => {
        setSelectedVideoGroup(value);
    };

    const handleAccessStatusChange = (value) => {
        setSelectedAccessState(value);
    };

    React.useEffect(async () => {
        const response = await fetchVideoDetails(id);
        // console.log('fetchVideoDetails', response);
        setVideoDetails(response);
        setSelectedVideoGroup(response.group);
        setSelectedAccessState(response.accessState);
    }, []);

    React.useEffect(() => {
        fetchVideoGroups();
    }, [id]);

    React.useEffect(() => {
        setVideoGroupOpts(videoGroups?.results);
    }, [videoGroups]);

    React.useEffect(() => {
        setSelectedVideoGroup(videoDetails?.group);
        setSelectedAccessState(videoDetails?.accessState);
    }, [videoDetails]);

    return (
        <MainCard title='Video Details' boxShadow shadow={theme.shadows[2]}>
            {isLoading ? <LoaderInnerCircular /> : (
                <Box sx={{ ml: 2, mb: 2 }}>

                    <Formik
                        initialValues={{
                            ...videoDetails
                        }}
                        validationSchema={Yup.object().shape({
                            title: Yup.string().min(2).required('Video name is required'),
                            group: Yup.string().required('Please select the video group'),
                            accessState: Yup.string().required('Group access state is required')
                        })}
                        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                            try {
                                if (scriptedRef.current) {
                                    const { group, title, accessState } = values;
                                    const response = await updateVideo(id, {
                                        group,
                                        title,
                                        accessState,
                                        path: videoDetails.path
                                    });
                                    setStatus({ success: true });
                                    setSubmitting(false);
                                    if (response.id) {
                                        toast.success('Video updated successfully!');
                                        history.goBack();
                                    }
                                }
                            } catch (err) {
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
                                    <Grid item xs={12} sm={4}>
                                        <FormControl fullWidth className={classes.input}>
                                            <InputLabel htmlFor='user-first-name'>Video Title</InputLabel>
                                            <OutlinedInput
                                                id='video-title'
                                                type='text'
                                                value={values?.title}
                                                name='title'
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label='Video title'
                                                inputProps={{
                                                    classes: {
                                                        notchedOutline: classes.notchedOutline
                                                    }
                                                }}
                                            />
                                            {errors.title && (
                                                <FormHelperText error id='standard-weight-helper-text-video-name'>
                                                    {errors.title}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                        <FormControl fullWidth className={classes.selectInput}>
                                            <InputLabel htmlFor='video-group'>Video Group</InputLabel>
                                            <Select
                                                id='video-group'
                                                labelId='video-group'
                                                value={selectedVideoGroup}
                                                name='group'
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
                                            {errors.group && (
                                                <FormHelperText error
                                                                id='standard-weight-helper-text-video-group'>
                                                    {errors.group}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                        <FormControl fullWidth className={classes.selectInput}>
                                            <InputLabel htmlFor='group-access-status'>Access State</InputLabel>
                                            <Select
                                                id='group-access-status'
                                                labelId='group-access-status'
                                                value={selectedAccessState}
                                                name='accessState'
                                                onChange={(e) => {
                                                    handleChange(e);
                                                    handleAccessStatusChange(e.target.value);
                                                }}
                                                label='Access Status'
                                                inputProps={{
                                                    classes: {
                                                        notchedOutline: classes.notchedOutline
                                                    }
                                                }}
                                            >
                                                <MenuItem value=''>
                                                    <em>None</em>
                                                </MenuItem>
                                                <MenuItem value={'public'}>Public</MenuItem>
                                                <MenuItem value={'private'}>Private</MenuItem>
                                                <MenuItem value={'code_access'}>Code Access</MenuItem>
                                            </Select>
                                            {errors.accessState && (
                                                <FormHelperText error
                                                                id='standard-weight-helper-text-access-state'>
                                                    {errors.accessState}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                        <Box sx={{ mt: 2, mb: 2 }}>
                                            <AnimateButton>
                                                <Button
                                                    disableElevation
                                                    disabled={isLoading}
                                                    fullWidth
                                                    size='large'
                                                    type='submit'
                                                    variant='contained'
                                                    color='primary'
                                                >
                                                    Update
                                                </Button>
                                            </AnimateButton>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={4} paddingLeft={4} marginTop={1}>
                                        <FormControl fullWidth>
                                            <SubCard>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant='h4' marginBottom={2}>Details</Typography>
                                                    <Typography variant='subtitle2' marginBottom={1}>
                                                        Created At:
                                                        <span className={classes.valueTxt}>
                                                            {values?.createdAt}
                                                        </span>
                                                    </Typography>
                                                    <Typography variant='subtitle2' marginBottom={1}>
                                                        Last updated:
                                                        <span className={classes.valueTxt}> {values?.updatedAt}</span>
                                                    </Typography>
                                                </Box>
                                            </SubCard>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </form>
                        )}

                    </Formik>
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

export default connect(mapStateToProps, mapDispatchToProps)(VideoDetailsComponent);
