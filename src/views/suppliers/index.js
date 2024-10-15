import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

import MainCard from '../../ui-component/cards/MainCard';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { DataGrid, GridToolbar } from '@material-ui/data-grid';
import { useTheme } from '@material-ui/styles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { fetchSuppliers, addSupplier } from './helper'; // Adjust the path as needed
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
import { useStyles } from './styles'; // Adjust the path or create a styles file as needed

const statusOptions = ['inactive', 'replied', 'read', 'unread']; // Define status options

const SuppliersComponent = ({ user }) => {
    const theme = useTheme();
    const history = useHistory();

    const [suppliers, setSuppliers] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [selectedIds, setSelectedIds] = React.useState([]);
    const [filterIds, setFilterIds] = React.useState([]);
    const [openDialog, setOpenDialog] = React.useState(false);

    const classes = useStyles();
    const scriptedRef = useScriptRef();

    const loadData = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetchSuppliers();
            const suppliersData = response || [];

            suppliersData.forEach((supplier, index) => {
                supplier.id = index + 1;
            });

            setSuppliers(suppliersData);
            setFilterIds(suppliersData.map((supplier) => supplier.id));
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
            console.error('Failed to load suppliers:', e);
        }
    }, []);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    // Handle Excel file upload
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

    // Toggle selection of a row
    const handleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Select/Deselect all rows
    const handleSelectAll = () => {
        const allRowIds = filterIds.map((id) => id);
        if (filterIds.every((id) => selectedIds.includes(id))) {
            setSelectedIds(selectedIds.filter((id) => !filterIds.includes(id)));
        } else {
            setSelectedIds([...new Set([...selectedIds, ...allRowIds])]);
        }
    };

    // Handle dialog open and close
    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleAddSuccess = () => {
        loadData(); // Reload data after adding a supplier
    };

    const columns = [
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
        {
            field: 'supplierName',
            headerName: 'Supplier Name',
            sortable: true,
            width: 160,
            renderCell: (params) => (
                <Typography variant="link1">
                    {params.row?.supplierName}
                </Typography>
            ),
        },
        {
            field: 'contact',
            headerName: 'Contact',
            sortable: true,
            width: 270,
            renderCell: (params) => (
                <Typography variant="value1">
                    {params.row?.contact}
                </Typography>
            ),
        },
        {
            field: 'materialName',
            headerName: 'Material Name',
            sortable: true,
            width: 200,
            renderCell: (params) => (
                <Typography variant="value1">
                    {params.row?.materialName}
                </Typography>
            ),
        },
        {
            field: 'partNumber',
            headerName: 'Part Number',
            sortable: true,
            width: 150,
            renderCell: (params) => (
                <Typography variant="value1">
                    {params.row?.partNumber}
                </Typography>
            ),
        },
        {
            field: 'chooseSurvey',
            headerName: 'Choose Survey',
            sortable: true,
            width: 200,
            renderCell: (params) => (
                <Typography variant="value1">
                    {params.row?.chooseSurvey?.join(', ')}
                </Typography>
            ),
        },
        {
            field: 'status',
            headerName: 'Status',
            sortable: true,
            width: 150,
            editable: true,
            renderCell: (params) => (
                <Typography variant="value1">
                    {params.row?.status}
                </Typography>
            ),
            renderEditCell: (params) => (
                <Select
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
        {
            field: 'feedback',
            headerName: 'Feedback',
            sortable: true,
            width: 200,
            renderCell: (params) => (
                <Typography variant="value1">
                    {params.row?.feedback}
                </Typography>
            ),
        },
        {
            field: 'supplierDocuments',
            headerName: 'Supplier Documents',
            sortable: true,
            width: 200,
            renderCell: (params) => (
                <Typography variant="value1">
                    {params.row?.supplierDocuments}
                </Typography>
            ),
        },
    ];

    // Add Supplier Dialog Component
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
                            chooseSurvey: [],
                            status: 'inactive',
                            feedback: '',
                            supplierDocuments: ''
                        }}
                        validationSchema={Yup.object().shape({
                            supplierName: Yup.string().required('Supplier Name is required'),
                            contact: Yup.string().required('Contact is required'),
                            materialName: Yup.string().required('Material Name is required'),
                            partNumber: Yup.string().required('Part Number is required'),
                            chooseSurvey: Yup.array().of(Yup.string()),
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
                                            <TextField
                                                id="contact"
                                                label="Contact"
                                                multiline
                                                rows={2}
                                                value={values.contact}
                                                name="contact"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
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
                                                multiple
                                                value={values.chooseSurvey}
                                                name="chooseSurvey"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                renderValue={(selected) => selected.join(', ')}
                                            >
                                                {/* Replace with actual survey options */}
                                                <MenuItem value="Survey 1">Survey 1</MenuItem>
                                                <MenuItem value="Survey 2">Survey 2</MenuItem>
                                                <MenuItem value="Survey 3">Survey 3</MenuItem>
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
                    style={{ top: -70 }}
                    startIcon={<DownloadOutlined />}
                    component="label"
                    onClick={handleOpenDialog}
                >
                    Add Supplier
                </Button>
                {/* Excel Upload Button (if needed) */}
                <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    style={{ top: -70, marginLeft: '10px' }}
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
                    loading={isLoading}
                    components={{
                        Toolbar: GridToolbar,
                        LoadingOverlay: CustomLoadingOverlay,
                        NoRowsOverlay: CustomNoRowsOverlay
                    }}
                    onFilterModelChange={(model) => {
                        const filter = model.items.map((item) => {
                            return [item.columnField, item.operatorValue, item.value];
                        });
                        const filterids = suppliers.filter((supplier) => {
                            return filter.every((filter) => {
                                if (filter[1] === 'isEmpty') {
                                    return supplier[filter[0]] === '' || supplier[filter[0]] === undefined;
                                } else if (filter[1] === 'isNotEmpty') {
                                    return supplier[filter[0]] !== '' && supplier[filter[0]] !== undefined;
                                } else if (filter[2] === undefined) {
                                    return true;
                                } else if (filter[1] === 'contains') {
                                    return supplier[filter[0]]?.toLowerCase().includes(filter[2].toLowerCase());
                                } else if (filter[1] === 'equals') {
                                    return supplier[filter[0]]?.toLowerCase() === filter[2].toLowerCase();
                                } else if (filter[1] === 'startsWith') {
                                    return supplier[filter[0]]?.toLowerCase().startsWith(filter[2].toLowerCase());
                                } else if (filter[1] === 'endsWith') {
                                    return supplier[filter[0]]?.toLowerCase().endsWith(filter[2].toLowerCase());
                                } else {
                                    return false;
                                }
                            });
                        }).map((supplier) => supplier.id);
                        setFilterIds(filterids);
                    }}
                />
            </div>
            {/* <EmailListener /> */}
            <AddSupplierDialog open={openDialog} handleClose={handleCloseDialog} />
        </MainCard>
    );
};

const mapStateToProps = (state) => ({
    user: state.authReducer.user
});

export default connect(mapStateToProps, null)(SuppliersComponent);
