// VideoGroupComponent.js

import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import MainCard from '../../ui-component/cards/MainCard';
import { useTheme } from '@material-ui/styles';

import { DataGrid } from '@material-ui/data-grid';

import { fetchVideoGroupsAction, addVideoGroupAction } from './video-groups.actions';
import { CustomLoadingOverlay, CustomNoRowsOverlay } from '../../ui-component/CustomNoRowOverlay';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import EditIcon from '@material-ui/icons/Edit';
import { deleteVideoGroup } from './video-groups.helper';
import Swal from 'sweetalert2';

import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    IconButton as MuiIconButton
} from '@material-ui/core';

import CloseIcon from '@material-ui/icons/Close';

import * as Yup from 'yup';
import { Formik } from 'formik';

import LoaderInnerCircular from '../../ui-component/LoaderInnerCircular';

import { useStyles } from './video-groups.styles';

import AnimateButton from '../../ui-component/extended/AnimateButton';
import useScriptRef from '../../hooks/useScriptRef';
import toast from 'react-hot-toast';

// 主组件
const VideoGroupComponent = ({ fetchVideoGroupsAction, addVideoGroupAction, isLoading, videoGroups, user }) => {
    const history = useHistory();
    const theme = useTheme();
    const userRole = user?.role;

    const classes = useStyles();
    const scriptedRef = useScriptRef();

    const [openDialog, setOpenDialog] = React.useState(false);
    const [selectedAccessState, setSelectedAccessState] = React.useState('public');

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleAccessStatusChange = (value) => {
        setSelectedAccessState(value);
    };

    const handleAddSuccess = () => {
        fetchVideoGroupsAction(); // 刷新列表
    };

    const columns = [
        {
            field: 'id', width: 270, headerName: 'ID', hide: false
        },
        {
            field: 'groupName',
            headerName: 'Group Name',
            width: 300,
            editable: false,
            resizable: false,
            disableClickEventBubbling: true
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
            renderCell: (params) => {
                return (
                    <Typography variant='value1'>
                        {params.row?.accessState.toUpperCase()}
                    </Typography>
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
            hide: userRole === 'student',
            renderCell: (params) => {
                return (
                    <strong>
                        <Button
                            variant='contained'
                            color='primary'
                            size='small'
                            startIcon={<EditIcon />}
                            style={{ marginLeft: 16 }}
                            onClick={() => {
                                history.push(`video-groups/${params.row.id}`);
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
                                        await deleteVideoGroup(params.row.id);
                                        await fetchVideoGroupsAction();
                                        await Swal.fire(
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
                );
            }
        }
    ];

    React.useEffect(() => {
        fetchVideoGroupsAction();
    }, [fetchVideoGroupsAction]);

    // 添加视频组对话框组件
    const AddVideoGroupDialog = ({ open, handleClose }) => {
        return (
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="sm"
                aria-labelledby="add-video-group-dialog-title"
            >
                <DialogTitle id="add-video-group-dialog-title">
                    Add File Group
                    <MuiIconButton
                        aria-label="close"
                        onClick={handleClose}
                        style={{ position: 'absolute', right: theme.spacing(1), top: theme.spacing(1) }}
                    >
                        <CloseIcon />
                    </MuiIconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Formik
                        initialValues={{
                            groupName: '',
                            accessState: 'public'
                        }}
                        validationSchema={Yup.object().shape({
                            groupName: Yup.string().min(2).required('Group name is required'),
                            accessState: Yup.string()
                        })}
                        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                            try {
                                if (scriptedRef.current) {
                                    await addVideoGroupAction(values);
                                    setStatus({ success: true });
                                    setSubmitting(false);
                                    handleClose(); // 成功后关闭对话框
                                    handleAddSuccess(); // 通知父组件刷新数据
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
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth className={classes.input}>
                                            <InputLabel htmlFor="group-name">Group Name</InputLabel>
                                            <OutlinedInput
                                                id="group-name"
                                                type="text"
                                                value={values?.groupName}
                                                name="groupName"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Group Name"
                                                inputProps={{
                                                    classes: {
                                                        notchedOutline: classes.notchedOutline
                                                    }
                                                }}
                                            />
                                            {errors.groupName && (
                                                <FormHelperText error id="standard-weight-helper-text-group-name">
                                                    {errors.groupName}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth className={classes.selectInput}>
                                            <InputLabel htmlFor="group-access-status">Access status</InputLabel>
                                            <Select
                                                id="group-access-status"
                                                labelId="group-access-status"
                                                value={selectedAccessState}
                                                name="accessState"
                                                onChange={(e) => {
                                                    handleChange(e);
                                                    handleAccessStatusChange(e.target.value);
                                                }}
                                                label="Access Status"
                                                inputProps={{
                                                    classes: {
                                                        notchedOutline: classes.notchedOutline
                                                    }
                                                }}
                                            >
                                                <MenuItem value="public">Public</MenuItem>
                                                <MenuItem value="private">Private</MenuItem>
                                                <MenuItem value="code_access">Code Access</MenuItem>
                                            </Select>
                                            {errors.accessState && (
                                                <FormHelperText error id="standard-weight-helper-text-access-state">
                                                    {errors.accessState}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                <Box sx={{ mt: 2 }}>
                                    <AnimateButton>
                                        <Button
                                            disableElevation
                                            disabled={isLoading}
                                            fullWidth
                                            size="large"
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                        >
                                            {isLoading ? <LoaderInnerCircular /> : 'Save'}
                                        </Button>
                                    </AnimateButton>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
        );
    };

    return (
        <MainCard title='File Groups' boxShadow shadow={theme.shadows[2]}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    size='small'
                    style={{ top: -70 }}
                    onClick={handleOpenDialog}
                >
                    Add File Group
                </Button>
            </div>
            <div style={{ width: '100%', marginTop: -31 }}>
                <DataGrid
                    rows={videoGroups?.results || []}
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
            {/* 添加对话框组件 */}
            <AddVideoGroupDialog open={openDialog} handleClose={handleCloseDialog} />
        </MainCard>
    );
};

const mapStateToProps = (state) => ({
    user: state.authReducer.user,
    isLoading: state.videoGroupsReducer.isLoading,
    videoGroups: state.videoGroupsReducer.videoGroups
});

const mapDispatchToProps = (dispatch) => ({
    fetchVideoGroupsAction: (obj) => dispatch(fetchVideoGroupsAction(obj)),
    addVideoGroupAction: (obj) => dispatch(addVideoGroupAction(obj))
});

export default connect(mapStateToProps, mapDispatchToProps)(VideoGroupComponent);
