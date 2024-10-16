import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import Tooltip from '@material-ui/core/Tooltip';
import MainCard from '../../ui-component/cards/MainCard';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { DataGrid, GridToolbar } from '@material-ui/data-grid';
import { useTheme } from '@material-ui/styles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { fetchSuppliers, addSupplier, updateSupplier, sendEmailsToSuppliers } from './helper';
import { fetchSurveys } from '../survey-templates/helper';
import { mentionUsers } from '../../views/authentication/session/auth.helper';
import { CustomLoadingOverlay, CustomNoRowsOverlay } from '../../ui-component/CustomNoRowOverlay';
import Typography from '@material-ui/core/Typography';
import { DownloadOutlined, NotificationsActive } from '@material-ui/icons';
import EmailListener from '../../utils/emailListener';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import Checkbox from '@material-ui/core/Checkbox';
import { Dialog, DialogContent, DialogTitle, FormControl, FormHelperText, Grid as MuiGrid, InputLabel, OutlinedInput, TextField } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { Formik } from 'formik';
import * as Yup from 'yup';
import LoaderInnerCircular from '../../ui-component/LoaderInnerCircular';
import AnimateButton from '../../ui-component/extended/AnimateButton';
import useScriptRef from '../../hooks/useScriptRef';
import { useStyles } from './styles';

const statusOptions = ['inactive', 'replied', 'read', 'unread'];

const SuppliersComponent = ({ user }) => {
    const theme = useTheme();
    const history = useHistory();

    const [suppliers, setSuppliers] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [selectedIds, setSelectedIds] = React.useState([]);
    const [filterIds, setFilterIds] = React.useState([]);
    const [openDialog, setOpenDialog] = React.useState(false);
    const [surveys, setSurveys] = React.useState([]);
    const [loadingUpdate, setLoadingUpdate] = React.useState(false);
    const [sendingEmails, setSendingEmails] = React.useState(false); // 新增状态以跟踪发送邮件的加载状态

    const classes = useStyles();
    const scriptedRef = useScriptRef();

    const loadData = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetchSuppliers();
            const suppliersData = response || [];

            suppliersData.forEach((supplier, index) => {
                if (!supplier._id) supplier.id = index + 1;
                else supplier.id = supplier._id;
            });

            setSuppliers(suppliersData);
            setFilterIds(suppliersData.map((supplier) => supplier.id));
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
            console.error('Failed to load suppliers:', e);
            toast.error('Failed to load suppliers');
        }
    }, []);

    React.useEffect(() => {
        const loadSurveys = async () => {
            try {
                const response = await fetchSurveys();
                console.log(response);
                setSurveys(response);
            } catch (error) {
                console.error("Failed to fetch surveys:", error);
                toast.error("Failed to load surveys");
            }
        };
        loadSurveys();
    }, []);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    const handleExcelUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            jsonData.forEach(row => {
                const email = row.email;
                if (email) {
                    mentionUsers({ email, mention: 'Hello' });
                }
            });

            toast.success('Successfully mentioned users from Excel!');
        };

        reader.readAsArrayBuffer(file);
    };

    const handleStatusChange = (id, newStatus) => {
        const updatedSuppliers = suppliers.map((supplier) =>
            supplier.id === id ? { ...supplier, status: newStatus } : supplier
        );
        setSuppliers(updatedSuppliers);
    };

    const handleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSelectAll = () => {
        const allRowIds = filterIds.map((id) => id);
        if (filterIds.every((id) => selectedIds.includes(id))) {
            setSelectedIds(selectedIds.filter((id) => !filterIds.includes(id)));
        } else {
            setSelectedIds([...new Set([...selectedIds, ...allRowIds])]);
        }
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleAddSuccess = () => {
        loadData();
    };

    // 电子邮件格式验证函数
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSendEmails = async () => {
        if (selectedIds.length === 0) {
            toast.error('No suppliers selected');
            return;
        }

        // Use SweetAlert2 for confirmation
        const result = await Swal.fire({
            title: 'Confirm Sending',
            text: `Are you sure you want to send emails to the selected ${selectedIds.length} suppliers?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, send it!',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) {
            return;
        }

        setSendingEmails(true);

        try {
            const selectedSuppliers = suppliers.filter(supplier => selectedIds.includes(supplier.id));
            const emailData = selectedSuppliers.map((supplier) => {
                // Assuming supplier.contact is the email address
                const email = supplier.contact;
                if (!email) {
                    throw new Error(`Supplier "${supplier.supplierName}" is missing an email address`);
                }

                // 检查email的格式
                if (!isValidEmail(email)) {
                    throw new Error(`Invalid email format for supplier "${supplier.supplierName}"`);
                }

                // Get the corresponding survey
                let survey = surveys.find(s => s._id === supplier.chooseSurvey);
                if (!survey) {
                    survey = { title: 'This is a survey', content: 'Please complete the survey.' };
                }

                return {
                    email,
                    subject: survey.title || 'This is a survey',
                    content: survey.content || 'Please complete the survey.'
                };
            });

            // 调用 helper.js 中的函数发送邮件
            const results = await sendEmailsToSuppliers(emailData);

            const fulfilled = results.filter(r => r.status === 'fulfilled').length;
            const rejected = results.filter(r => r.status === 'rejected');

            if (fulfilled > 0) {
                toast.success(`${fulfilled} email(s) sent successfully`);
            }

            if (rejected.length > 0) {
                rejected.forEach(r => {
                    if (r.reason) {
                        toast.error(r.reason.message || 'Error occurred while sending email');
                    }
                });
            }
        } catch (error) {
            console.error('Error while sending emails:', error);
            toast.error(`Failed to send emails: ${error.message}`);
        } finally {
            setSendingEmails(false);
        }
    };

    const columns = [
        // Selection Column (unchanged)
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
            },
        },
        // Supplier Name Column
        {
            field: 'supplierName',
            headerName: 'Supplier Name',
            sortable: true,
            width: 190,
            valueGetter: (params) => params.row?.supplierName || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.supplierName || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.supplierName}
                    </Typography>
                </Tooltip>
            ),
        },
        // Contact Column (假设这里是邮箱)
        {
            field: 'contact',
            headerName: 'Contact',
            sortable: true,
            width: 270,
            valueGetter: (params) => params.row?.contact || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.contact || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.contact}
                    </Typography>
                </Tooltip>
            ),
        },
        // Material Name Column
        {
            field: 'materialName',
            headerName: 'Material Name',
            sortable: true,
            width: 200,
            valueGetter: (params) => params.row?.materialName || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.materialName || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.materialName}
                    </Typography>
                </Tooltip>
            ),
        },
        // Part Number Column
        {
            field: 'partNumber',
            headerName: 'Part Number',
            sortable: true,
            width: 190,
            valueGetter: (params) => params.row?.partNumber || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.partNumber || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.partNumber}
                    </Typography>
                </Tooltip>
            ),
        },
        // Choose Survey Column
        {
            field: 'chooseSurvey',
            headerName: 'Choose Survey',
            sortable: true,
            width: 300,
            editable: true,
            valueGetter: (params) => params.row?.chooseSurvey || '',
            renderCell: (params) => {
                const selectedSurveyId = params.row?.chooseSurvey || '';
                const selectedSurvey = surveys.find(survey => survey._id === selectedSurveyId);
                return (
                    <Tooltip title={selectedSurvey ? selectedSurvey.name : ''} arrow>
                        <Typography variant="body1" noWrap>
                            {selectedSurvey ? selectedSurvey.name : ''}
                        </Typography>
                    </Tooltip>
                );
            },
            renderEditCell: (params) => {
                const { id, value, api } = params;

                const handleChange = async (event) => {
                    const selectedSurveyId = event.target.value;

                    try {
                        setLoadingUpdate(true);
                        await updateSupplier(id, { chooseSurvey: selectedSurveyId });
                        setSuppliers((prevSuppliers) =>
                            prevSuppliers.map((supplier) =>
                                supplier.id === id ? { ...supplier, chooseSurvey: selectedSurveyId } : supplier
                            )
                        );
                        toast.success('Survey updated successfully');
                        api.setCellMode(id, 'chooseSurvey', 'view');
                    } catch (error) {
                        console.error('Failed to update survey:', error);
                        toast.error('Failed to update survey');
                    } finally {
                        setLoadingUpdate(false);
                    }
                };

                return (
                    <Select
                        style={{
                            display: 'flex',
                            justifyContent: 'center',   // 水平居中
                            alignItems: 'center',       // 垂直居中
                            height: '100%',             // 使容器的高度占满单元格
                            width: '100%'               // 使容器的宽度占满单元格
                        }}
                        value={value}
                        onChange={handleChange}
                        autoFocus
                        onClose={() => api.setCellMode(id, 'chooseSurvey', 'view')}
                    >
                        {surveys.map((survey) => (
                            <MenuItem key={survey._id} value={survey._id}>
                                {survey.name}
                            </MenuItem>
                        ))}
                    </Select>
                );
            },
        },
        // Status Column
        {
            field: 'status',
            headerName: 'Status',
            sortable: true,
            width: 150,
            editable: true,
            valueGetter: (params) => params.row?.status || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.status || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.status}
                    </Typography>
                </Tooltip>
            ),
            renderEditCell: (params) => (
                <Select
                    style={{
                        display: 'flex',
                        justifyContent: 'center',   // 水平居中
                        alignItems: 'center',       // 垂直居中
                        height: '100%',             // 使容器的高度占满单元格
                        width: '100%'               // 使容器的宽度占满单元格
                    }}
                    value={params.row.status}
                    onChange={(event) => handleStatusChange(params.row.id, event.target.value)}
                >
                    {statusOptions.map((status) => (
                        <MenuItem key={status} value={status}>
                            {status}
                        </MenuItem>
                    ))}
                </Select>
            ),
        },
        // Feedback Column
        {
            field: 'feedback',
            headerName: 'Feedback',
            sortable: true,
            width: 200,
            valueGetter: (params) => params.row?.feedback || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.feedback || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.feedback}
                    </Typography>
                </Tooltip>
            ),
        },
        // Supplier Documents Column
        {
            field: 'supplierDocuments',
            headerName: 'Supplier Documents',
            sortable: true,
            width: 230,
            valueGetter: (params) => params.row?.supplierDocuments || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.supplierDocuments || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.supplierDocuments}
                    </Typography>
                </Tooltip>
            ),
        },
    ];

    const processRowUpdate = async (newRow, oldRow) => {
        if (newRow.chooseSurvey !== oldRow.chooseSurvey) {
            try {
                setLoadingUpdate(true);
                await updateSupplier(newRow.id, { chooseSurvey: newRow.chooseSurvey });
                toast.success('Survey updated successfully');
                return newRow;
            } catch (error) {
                console.error('Failed to update survey:', error);
                toast.error('Failed to update survey');
                return oldRow;
            } finally {
                setLoadingUpdate(false);
            }
        }
        return newRow;
    };

    const AddSupplierDialog = ({ open, handleClose }) => {
        return (
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="sm"
                aria-labelledby="add-supplier-dialog-title"
            >
                <DialogTitle id="add-supplier-dialog-title">
                    Add Supplier
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        style={{ position: 'absolute', right: theme.spacing(1), top: theme.spacing(1) }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Formik
                        initialValues={{
                            supplierName: '',
                            contact: '',
                            materialName: '',
                            partNumber: '',
                            chooseSurvey: '',
                            status: 'inactive',
                            feedback: '',
                            supplierDocuments: ''
                        }}
                        validationSchema={Yup.object().shape({
                            supplierName: Yup.string().required('Supplier Name is required'),
                            contact: Yup.string().required('Contact is required'),
                            materialName: Yup.string().required('Material Name is required'),
                            partNumber: Yup.string().required('Part Number is required'),
                            chooseSurvey: Yup.string(),
                            status: Yup.string().oneOf(statusOptions).required('Status is required'),
                            feedback: Yup.string(),
                            supplierDocuments: Yup.string()
                        })}
                        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                            try {
                                if (scriptedRef.current) {
                                    await addSupplier(values);
                                    setStatus({ success: true });
                                    setSubmitting(false);
                                    handleClose();
                                    handleAddSuccess();
                                    toast.success('Supplier added successfully');
                                }
                            } catch (err) {
                                console.error(err);
                                if (scriptedRef.current) {
                                    setStatus({ success: false });
                                    setErrors({ submit: err.message });
                                    setSubmitting(false);
                                    toast.error('Failed to add supplier');
                                }
                            }
                        }}
                    >
                        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                            <form onSubmit={handleSubmit}>
                                <MuiGrid container spacing={2}>
                                    <MuiGrid item xs={12}>
                                        <FormControl fullWidth className={classes.input}>
                                            <InputLabel htmlFor="supplierName">Supplier Name</InputLabel>
                                            <OutlinedInput
                                                id="supplierName"
                                                type="text"
                                                value={values.supplierName}
                                                name="supplierName"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Supplier Name"
                                            />
                                            {errors.supplierName && (
                                                <FormHelperText error>{errors.supplierName}</FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl fullWidth className={classes.input}>
                                            <InputLabel htmlFor="contact">Contact</InputLabel>
                                            <OutlinedInput
                                                id="contact"
                                                type="text"
                                                value={values.contact}
                                                name="contact"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Contact"
                                            />
                                            {errors.contact && (
                                                <FormHelperText error>{errors.contact}</FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl fullWidth className={classes.input}>
                                            <InputLabel htmlFor="materialName">Material Name</InputLabel>
                                            <OutlinedInput
                                                id="materialName"
                                                type="text"
                                                value={values.materialName}
                                                name="materialName"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Material Name"
                                            />
                                            {errors.materialName && (
                                                <FormHelperText error>{errors.materialName}</FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl fullWidth className={classes.input}>
                                            <InputLabel htmlFor="partNumber">Part Number</InputLabel>
                                            <OutlinedInput
                                                id="partNumber"
                                                type="text"
                                                value={values.partNumber}
                                                name="partNumber"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Part Number"
                                            />
                                            {errors.partNumber && (
                                                <FormHelperText error>{errors.partNumber}</FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl fullWidth className={classes.input}>
                                            <InputLabel id="chooseSurvey-label">Choose Survey</InputLabel>
                                            <Select
                                                labelId="chooseSurvey-label"
                                                id="chooseSurvey"
                                                value={values.chooseSurvey}
                                                name="chooseSurvey"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                style={{ paddingTop: '10px' }}
                                            >
                                                {surveys.map((survey) => (
                                                    <MenuItem key={survey._id} value={survey._id}>
                                                        {survey.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.chooseSurvey && (
                                                <FormHelperText error>{errors.chooseSurvey}</FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl fullWidth className={classes.input}>
                                            <InputLabel id="status-label">Status</InputLabel>
                                            <Select
                                                labelId="status-label"
                                                id="status"
                                                value={values.status}
                                                name="status"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                style={{ paddingTop: '10px' }}
                                            >
                                                {statusOptions.map((status) => (
                                                    <MenuItem key={status} value={status}>
                                                        {status}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.status && (
                                                <FormHelperText error>{errors.status}</FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl fullWidth className={classes.input}>
                                            <TextField
                                                id="feedback"
                                                label="Feedback"
                                                multiline
                                                rows={2}
                                                value={values.feedback}
                                                name="feedback"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                InputLabelProps={{
                                                    classes: {
                                                        shrink: classes.shrinkLabel // 应用自定义的 shrink 样式
                                                    }
                                                }}
                                            />
                                            {errors.feedback && (
                                                <FormHelperText error>{errors.feedback}</FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl fullWidth className={classes.input}>
                                            <InputLabel htmlFor="supplierDocuments">Supplier Documents</InputLabel>
                                            <OutlinedInput
                                                id="supplierDocuments"
                                                type="text"
                                                value={values.supplierDocuments}
                                                name="supplierDocuments"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Supplier Documents"
                                            />
                                            {errors.supplierDocuments && (
                                                <FormHelperText error>{errors.supplierDocuments}</FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                </MuiGrid>

                                <AnimateButton>
                                    <Button
                                        disableElevation
                                        disabled={isSubmitting}
                                        fullWidth
                                        size="large"
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        style={{ marginTop: '16px' }}
                                    >
                                        {isSubmitting ? <LoaderInnerCircular /> : 'Save'}
                                    </Button>
                                </AnimateButton>
                            </form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
        );
    };

    return (
        <MainCard title='Suppliers' boxShadow shadow={theme.shadows[2]}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    style={{ top: -70, right: -124 }}
                    startIcon={<DownloadOutlined />}
                    component="label"
                    onClick={handleOpenDialog}
                >
                    Add Supplier
                </Button>
                <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    style={{ top: -70, marginLeft: '10px', right: -124 }}
                    startIcon={<DownloadOutlined />}
                    component="label"
                >
                    Batch Import Suppliers from Excel
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        style={{ display: 'none' }}
                        onChange={handleExcelUpload}
                    />
                </Button>
                <Button
                    variant='contained'
                    color='secondary'
                    size='small'
                    style={{ zIndex: 1 }}
                    startIcon={<NotificationsActive />}
                    onClick={handleSendEmails}
                    disabled={sendingEmails || selectedIds.length === 0}
                >
                    {sendingEmails ? 'Sending...' : 'Send Emails'}
                </Button>
            </div>
            <div style={{ width: '100%', marginTop: -31 }}>
                <DataGrid
                    rows={suppliers}
                    columns={columns}
                    pageSize={10}
                    checkboxSelection={false}
                    autoHeight
                    autoPageSize
                    density={'standard'}
                    disableSelectionOnClick
                    loading={isLoading || loadingUpdate || sendingEmails}
                    components={{
                        Toolbar: GridToolbar,
                    }}
                    processRowUpdate={processRowUpdate}
                    experimentalFeatures={{ newEditingApi: true }}
                    onFilterModelChange={(model) => {
                        const filter = model.items.map((item) => {
                            return [item.columnField, item.operatorValue, item.value];
                        });
                        const filterids = suppliers.filter((supplier) => {
                            return filter.every(([field, operator, value]) => {
                                const cellValue = supplier[field];
                                if (operator === 'isEmpty') {
                                    return cellValue === '' || cellValue === undefined;
                                } else if (operator === 'isNotEmpty') {
                                    return cellValue !== '' && cellValue !== undefined;
                                } else if (value === undefined) {
                                    return true;
                                } else if (operator === 'contains') {
                                    return cellValue?.toString().toLowerCase().includes(value.toLowerCase());
                                } else if (operator === 'equals') {
                                    return cellValue?.toString().toLowerCase() === value.toLowerCase();
                                } else if (operator === 'startsWith') {
                                    return cellValue?.toString().toLowerCase().startsWith(value.toLowerCase());
                                } else if (operator === 'endsWith') {
                                    return cellValue?.toString().toLowerCase().endsWith(value.toLowerCase());
                                } else {
                                    return false;
                                }
                            });
                        }).map((supplier) => supplier.id);
                        setFilterIds(filterids);
                    }}
                />
            </div>
            <AddSupplierDialog open={openDialog} handleClose={handleCloseDialog} />
        </MainCard>
    );
};

const mapStateToProps = (state) => ({
    user: state.authReducer.user
});

export default connect(mapStateToProps, null)(SuppliersComponent);
