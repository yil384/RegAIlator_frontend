import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

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

import { useStyles } from './video-groups.styles';

import { addVideoGroupAction } from './video-groups.actions';
import AnimateButton from '../../ui-component/extended/AnimateButton';
import useScriptRef from '../../hooks/useScriptRef';
import SubCard from '../../ui-component/cards/SubCard';

const AddVideoGroupComponent = ({ addVideoGroupAction, isLoading, videoGroups, ...others }) => {
    const history = useHistory();
    const theme = useTheme();
    const classes = useStyles();
    const scriptedRef = useScriptRef();

    const [selectedAccessState, setSelectedAccessState] = React.useState('public');

    const handleAccessStatusChange = (value) => {
        setSelectedAccessState(value);
    };

    // React.useEffect(() => {
    //     setSelectedAccessState('public');
    // }, []);

    return (
        <MainCard title='Add File Group' boxShadow shadow={theme.shadows[2]}>
            <Box sx={{ ml: 2, mb: 2, height: '70vh' }}>
                <Formik
                    initialValues={{
                        accessState: 'public'
                    }}
                    validationSchema={Yup.object().shape({
                        groupName: Yup.string().min(2).required('Group name is required'),
                        accessState: Yup.string()
                    })}
                    onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                        try {
                            if (scriptedRef.current) {
                                addVideoGroupAction({ history, ...values });
                                setStatus({ success: true });
                                setSubmitting(false);
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
                                        <InputLabel htmlFor='user-first-name'>Group Name</InputLabel>
                                        <OutlinedInput
                                            id='group-name'
                                            type='text'
                                            value={values?.groupName}
                                            name='groupName'
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            label='Group Name'
                                            inputProps={{
                                                classes: {
                                                    notchedOutline: classes.notchedOutline
                                                }
                                            }}
                                        />
                                        {errors.groupName && (
                                            <FormHelperText error id='standard-weight-helper-text-group-name'>
                                                {errors.groupName}
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                    <FormControl fullWidth className={classes.selectInput}>
                                        <InputLabel htmlFor='group-access-status'>Access status</InputLabel>
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
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 2, mb: 2 }}>
                                <Grid item xs={12} sm={4}>
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
                                            Save
                                        </Button>
                                    </AnimateButton>
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
    addVideoGroupAction: (obj) => dispatch(addVideoGroupAction(obj))
});

export default connect(mapStateToProps, mapDispatchToProps)(AddVideoGroupComponent);
