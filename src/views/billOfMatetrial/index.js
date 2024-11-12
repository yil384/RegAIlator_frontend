import React from 'react';
import { DataGrid, GridToolbar } from '@material-ui/data-grid';
import { useTheme } from '@material-ui/styles';
import MainCard from '../../ui-component/cards/MainCard';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Checkbox from '@material-ui/core/Checkbox';
import { Typography } from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import Tooltip from '@material-ui/core/Tooltip';
import {
    fetchBillOfMaterials,
    addMaterial,
    batchAddMaterials,
    updateMaterial,
    deleteMaterials
} from './helper';
import { fetchSuppliers, batchAddSuppliers } from '../suppliers/helper';
import { useStyles } from './styles';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    FormHelperText,
    Grid as MuiGrid,
    InputLabel,
    OutlinedInput,
    Select,
    MenuItem
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { Formik } from 'formik';
import * as Yup from 'yup';
import LoaderInnerCircular from '../../ui-component/LoaderInnerCircular';
import AnimateButton from '../../ui-component/extended/AnimateButton';
import useScriptRef from '../../hooks/useScriptRef';
import { makeStyles } from '@material-ui/core/styles';
import { DownloadOutlined, DeleteOutlined } from '@material-ui/icons';
import Swal from 'sweetalert2';

const BillOfMaterials = () => {
    const theme = useTheme();
    const classes = useStyles();
    const scriptedRef = useScriptRef();

    const [materials, setMaterials] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [loadingUpdate, setLoadingUpdate] = React.useState(false);
    const [selectedIds, setSelectedIds] = React.useState([]);
    const [filterIds, setFilterIds] = React.useState([]);
    const [openDialog, setOpenDialog] = React.useState(false);
    const [importingMaterials, setImportingMaterials] = React.useState(false);
    const [deletingMaterials, setDeletingMaterials] = React.useState(false);

    const [suppliers, setSuppliers] = React.useState([]); // New state for suppliers

    const loadData = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetchBillOfMaterials();
            const materialsData = response?.results || [];

            console.log('Bill of Materials:', materialsData);

            setMaterials(materialsData);
            setFilterIds(materialsData.map((material) => material.id));
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
            console.error('Failed to load Bill of Materials:', e);
            toast.error('Failed to load Bill of Materials');
        }
    }, []);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    // Fetch suppliers
    React.useEffect(() => {
        const loadSuppliers = async () => {
            try {
                const suppliersData = await fetchSuppliers();
                setSuppliers(suppliersData);
            } catch (error) {
                console.error('Failed to fetch suppliers:', error);
                toast.error('Failed to load suppliers');
            }
        };
        loadSuppliers();
    }, []);

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

    const handleExcelUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                setImportingMaterials(true);
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    toast.error('Excel file is empty');
                    setImportingMaterials(false);
                    return;
                }

                // Validate and prepare material data
                const materialsToAdd = [];
                const errors = [];

                let notFoundSuppliers = [];
                jsonData.forEach((row, index) => {
                    const rawMaterialPartDescription = row.rawMaterialPartDescription || row['Raw Material Name'] || row['Raw material name'];
                    const rawMaterialPartNumber = row.rawMaterialPartNumber || row['Raw Material Part Number'] || row['Raw material part number'];
                    const supplierName = row.supplier || row['Supplier Name'] || row['Supplier name'];
                    if (supplierName) {
                        // create a new supplier based on the supplier name and its raw material name and number if it does not exist
                        const supplier = suppliers.find(
                            (s) => (s.supplierName.toLowerCase() === supplierName.toLowerCase()
                                    && (rawMaterialPartDescription? s.materialName?.toLowerCase() === rawMaterialPartDescription.toLowerCase() : true)
                                    && (rawMaterialPartNumber? s.partNumber?.toString().toLowerCase() === rawMaterialPartNumber.toString().toLowerCase() : true)
                        )
                        );

                        if (!supplier) {
                            if (notFoundSuppliers.find(
                                (s) => s.supplierName.toLowerCase() === supplierName.toLowerCase()
                                    && (rawMaterialPartDescription? s.materialName?.toLowerCase() === rawMaterialPartDescription.toLowerCase() : true)
                                    && (rawMaterialPartNumber? s.partNumber?.toString().toLowerCase() === rawMaterialPartNumber.toString().toLowerCase() : true)
                            )) {
                                return;
                            }
                            notFoundSuppliers.push(
                                {
                                    supplierName: supplierName,
                                    materialName: rawMaterialPartDescription,
                                    partNumber: rawMaterialPartNumber
                                }
                            );
                        }
                    }
                });
                if (notFoundSuppliers.length > 0) {
                    const result = await batchAddSuppliers(notFoundSuppliers);
                    if (result.length > 0) {
                        toast.success(`${notFoundSuppliers.length} supplier(s) imported successfully.`);
                    }
                    suppliers.push(...result);
                }

                jsonData.forEach((row, index) => {
                    const productName = row.productName || row['Product Name'] || row['Product name'];
                    const productPartNumber = row.productPartNumber || row['Product Part Number'] || row['Product part number'];
                    const facility = row.facility || row['Facility'];
                    const rawMaterialPartDescription = row.rawMaterialPartDescription || row['Raw Material Name'] || row['Raw material name'];
                    const rawMaterialPartNumber = row.rawMaterialPartNumber || row['Raw Material Part Number'] || row['Raw material part number'];
                    const functionField = row.function || row['Function'];
                    const supplierName = row.supplier || row['Supplier Name'] || row['Supplier name'];

                    // Basic validation
                    if (!productName) {
                        errors.push(`Row ${index + 2}: Missing product name.`);
                        return;
                    }
                    // if (!productPartNumber) {
                    //     errors.push(`Row ${index + 2}: Missing product part number.`);
                    //     return;
                    // }
                    // if (!rawMaterialPartDescription) {
                    //     errors.push(`Row ${index + 2}: Missing raw material name.`);
                    //     return;
                    // }
                    // if (!rawMaterialPartNumber) {
                    //     errors.push(`Row ${index + 2}: Missing raw material part number.`);
                    //     return;
                    // }
                    // if (!supplierName) {
                    //     errors.push(`Row ${index + 2}: Missing supplier name.`);
                    //     return;
                    // }

                    if (supplierName) {
                        // Find supplier ID from supplier name
                        const supplier = suppliers.find(
                            (s) => s.supplierName.toLowerCase() === supplierName.toLowerCase()
                        );

                        if (!supplier) {
                            errors.push(`Row ${index + 2}: Supplier "${supplierName}" not found.`);
                            return;
                        }

                        materialsToAdd.push({
                            productName,
                            productPartNumber,
                            facility,
                            rawMaterialPartDescription,
                            rawMaterialPartNumber,
                            function: functionField,
                            supplier: supplier._id, // Use supplier ID
                        });
                    } else {
                        materialsToAdd.push({
                            productName,
                            productPartNumber,
                            facility,
                            rawMaterialPartDescription,
                            rawMaterialPartNumber,
                            function: functionField,
                        });
                    }
                });

                if (errors.length > 0) {
                    errors.forEach((error) => toast.error(error));
                    toast.error('Some rows have errors. Please fix them and try again.');
                    setImportingMaterials(false);
                    return;
                }

                // Batch add materials
                try {
                    const result = await batchAddMaterials(materialsToAdd);
                    if (result.length > 0) {
                        toast.success(`${materialsToAdd.length} material(s) imported successfully.`);
                    }
                    // Reload materials data
                    await loadData();
                } catch (batchError) {
                    console.error('Batch import failed:', batchError);
                    toast.error('Batch import failed. Please try again.');
                }

            } catch (error) {
                console.error('Error reading Excel file:', error);
                toast.error('Failed to read Excel file.');
            } finally {
                setImportingMaterials(false);
                // Reset the file input
                event.target.value = null;
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const handleDeleteMaterials = async () => {
        if (selectedIds.length === 0) {
            toast.error('No materials selected');
            return;
        }

        const result = await Swal.fire({
            title: 'Confirm Deletion',
            text: `Are you sure you want to delete the selected ${selectedIds.length} materials?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete them!',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) {
            return;
        }

        setDeletingMaterials(true);

        try {
            await deleteMaterials(selectedIds);
            toast.success('Materials deleted successfully');
            await loadData();
            setSelectedIds([]);
        } catch (error) {
            console.error('Error deleting materials:', error);
            toast.error('Failed to delete materials');
        } finally {
            setDeletingMaterials(false);
        }
    };

    const handleDeleteSingleMaterial = async (id) => {
        const result = await Swal.fire({
            title: 'Confirm Deletion',
            text: 'Are you sure you want to delete this material?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) {
            return;
        }

        setDeletingMaterials(true);

        try {
            await deleteMaterials([id]);
            toast.success('Material deleted successfully');
            await loadData();
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } catch (error) {
            console.error('Error deleting material:', error);
            toast.error('Failed to delete material');
        } finally {
            setDeletingMaterials(false);
        }
    };

    const handleCellEditCommit = React.useCallback(
        async (params) => {
            const { id, field, value } = params;
            // Check if value has changed
            if (materials.find((material) => material.id === id)[field] === value) {
                return;
            }
            // Prepare data for update
            let updateData = { [field]: value };
            if (field === 'supplier') {
                // Find supplier ID from supplier name
                const supplier = suppliers.find(
                    (s) => s.supplierName.toLowerCase() === value.toLowerCase()
                );
                if (!supplier) {
                    toast.error(`Supplier "${value}" not found.`);
                    return;
                }
                updateData = { supplier: supplier._id };
            }
            // Update Material
            try {
                setLoadingUpdate(true);
                await updateMaterial(id, updateData);
                setMaterials((prevMaterials) =>
                    prevMaterials.map((material) =>
                        material.id === id
                            ? { ...material, [field]: value }
                            : material
                    )
                );
                toast.success('Material updated successfully');
            } catch (error) {
                console.error('Failed to update material:', error);
                toast.error('Failed to update material');
            } finally {
                setLoadingUpdate(false);
            }
            console.log(`Row with id ${id} updated. Field: ${field}, New Value: ${value}`);
        }, [materials, suppliers]
    );

    // Define your columns
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
            disableColumnMenu: true,
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
        // Product Name Column
        {
            field: 'productName',
            headerName: 'Product Name',
            width: 200,
            editable: true,
            valueGetter: (params) => params.row?.productName || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.productName || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.productName}
                    </Typography>
                </Tooltip>
            ),
        },
        // Product Part Number Column
        {
            field: 'productPartNumber',
            headerName: 'Product Part Number',
            width: 250,
            editable: true,
            valueGetter: (params) => params.row?.productPartNumber || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.productPartNumber || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.productPartNumber}
                    </Typography>
                </Tooltip>
            ),
        },
        // Facility Column
        {
            field: 'facility',
            headerName: 'Facility',
            width: 150,
            editable: true,
            valueGetter: (params) => params.row?.facility || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.facility || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.facility}
                    </Typography>
                </Tooltip>
            ),
        },
        // Raw Material Name Column
        {
            field: 'rawMaterialPartDescription',
            headerName: 'Raw Material Name',
            width: 250,
            editable: true,
            valueGetter: (params) => params.row?.rawMaterialPartDescription || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.rawMaterialPartDescription || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.rawMaterialPartDescription}
                    </Typography>
                </Tooltip>
            ),
        },
        // Raw Material Part Number Column
        {
            field: 'rawMaterialPartNumber',
            headerName: 'Raw Material Part Number',
            width: 300,
            editable: true,
            valueGetter: (params) => params.row?.rawMaterialPartNumber || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.rawMaterialPartNumber || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.rawMaterialPartNumber}
                    </Typography>
                </Tooltip>
            ),
        },
        // Function Column
        {
            field: 'function',
            headerName: 'Function',
            width: 200,
            editable: true,
            valueGetter: (params) => params.row?.function || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.function || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.function}
                    </Typography>
                </Tooltip>
            ),
        },
        // Supplier Column
        {
            field: 'supplier',
            headerName: 'Supplier Name',
            width: 200,
            editable: true,
            valueGetter: (params) => {
                const supplierId = params.row?.supplier;
                const supplier = suppliers.find((s) => s._id === supplierId);
                return supplier ? supplier.supplierName : '';
            },
            renderCell: (params) => (
                <Tooltip title={params.value || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.value}
                    </Typography>
                </Tooltip>
            ),
        },
        // Actions Column
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <IconButton
                    onClick={(event) => {
                        event.stopPropagation(); // Prevent event bubbling
                        handleDeleteSingleMaterial(params.row.id);
                    }}
                >
                    <DeleteOutlined color="secondary" />
                </IconButton>
            ),
        },
    ];

    const AddMaterialDialog = ({ open, handleClose }) => {
        return (
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="sm"
                aria-labelledby="add-material-dialog-title"
            >
                <DialogTitle id="add-material-dialog-title">
                    Add Material
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        style={{
                            position: 'absolute',
                            right: theme.spacing(1),
                            top: theme.spacing(1)
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Formik
                        initialValues={{
                            productName: '',
                            productPartNumber: '',
                            facility: '',
                            rawMaterialPartDescription: '',
                            rawMaterialPartNumber: '',
                            function: '',
                            supplier: ''
                        }}
                        validationSchema={Yup.object().shape({
                            productName: Yup.string().required('Product Name is required'),
                            productPartNumber: Yup.string().required('Product Part Number is required'),
                            facility: Yup.string().required('Facility is required'),
                            rawMaterialPartDescription: Yup.string().required('Raw Material Name is required'),
                            rawMaterialPartNumber: Yup.string().required('Raw Material Part Number is required'),
                            function: Yup.string().required('Function is required'),
                            supplier: Yup.string().required('Supplier Name is required')
                        })}
                        onSubmit={async (
                            values,
                            { setErrors, setStatus, setSubmitting }
                        ) => {
                            try {
                                if (scriptedRef.current) {
                                    console.log('Adding material:', values);
                                    await addMaterial(values);
                                    setStatus({ success: true });
                                    setSubmitting(false);
                                    handleClose();
                                    handleAddSuccess();
                                    toast.success('Material added successfully');
                                }
                            } catch (err) {
                                console.error(err);
                                if (scriptedRef.current) {
                                    setStatus({ success: false });
                                    setErrors({ submit: err.message });
                                    setSubmitting(false);
                                    toast.error('Failed to add material');
                                }
                            }
                        }}
                    >
                        {({
                            errors,
                            handleBlur,
                            handleChange,
                            handleSubmit,
                            isSubmitting,
                            touched,
                            values
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <MuiGrid container spacing={2}>
                                    <MuiGrid item xs={12}>
                                        <FormControl
                                            fullWidth
                                            className={classes.input}
                                        >
                                            <InputLabel htmlFor="productName">
                                                Product Name
                                            </InputLabel>
                                            <OutlinedInput
                                                id="productName"
                                                type="text"
                                                value={values.productName}
                                                name="productName"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Product Name"
                                            />
                                            {errors.productName && (
                                                <FormHelperText error>
                                                    {errors.productName}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl
                                            fullWidth
                                            className={classes.input}
                                        >
                                            <InputLabel htmlFor="productPartNumber">
                                                Product Part Number
                                            </InputLabel>
                                            <OutlinedInput
                                                id="productPartNumber"
                                                type="text"
                                                value={values.productPartNumber}
                                                name="productPartNumber"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Product Part Number"
                                            />
                                            {errors.productPartNumber && (
                                                <FormHelperText error>
                                                    {errors.productPartNumber}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl
                                            fullWidth
                                            className={classes.input}
                                        >
                                            <InputLabel htmlFor="facility">
                                                Facility
                                            </InputLabel>
                                            <OutlinedInput
                                                id="facility"
                                                type="text"
                                                value={values.facility}
                                                name="facility"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Facility"
                                            />
                                            {errors.facility && (
                                                <FormHelperText error>
                                                    {errors.facility}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl
                                            fullWidth
                                            className={classes.input}
                                        >
                                            <InputLabel htmlFor="rawMaterialPartDescription">
                                                Raw Material Name
                                            </InputLabel>
                                            <OutlinedInput
                                                id="rawMaterialPartDescription"
                                                type="text"
                                                value={values.rawMaterialPartDescription}
                                                name="rawMaterialPartDescription"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Raw Material Name"
                                            />
                                            {errors.rawMaterialPartDescription && (
                                                <FormHelperText error>
                                                    {errors.rawMaterialPartDescription}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl
                                            fullWidth
                                            className={classes.input}
                                        >
                                            <InputLabel htmlFor="rawMaterialPartNumber">
                                                Raw Material Part Number
                                            </InputLabel>
                                            <OutlinedInput
                                                id="rawMaterialPartNumber"
                                                type="text"
                                                value={values.rawMaterialPartNumber}
                                                name="rawMaterialPartNumber"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Raw Material Part Number"
                                            />
                                            {errors.rawMaterialPartNumber && (
                                                <FormHelperText error>
                                                    {errors.rawMaterialPartNumber}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl
                                            fullWidth
                                            className={classes.input}
                                        >
                                            <InputLabel htmlFor="function">
                                                Function
                                            </InputLabel>
                                            <OutlinedInput
                                                id="function"
                                                type="text"
                                                value={values.function}
                                                name="function"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Function"
                                            />
                                            {errors.function && (
                                                <FormHelperText error>
                                                    {errors.function}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl fullWidth className={classes.input}>
                                            <InputLabel id="supplier-label">Supplier Name</InputLabel>
                                            <Select
                                                labelId="supplier-label"
                                                id="supplier"
                                                value={values.supplier}
                                                name="supplier"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Supplier Name"
                                                style={{ paddingTop: '10px' }}
                                            >
                                                {suppliers.map((supplier) => (
                                                    <MenuItem key={supplier._id} value={supplier._id}>
                                                        {supplier.supplierName}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.supplier && (
                                                <FormHelperText error>{errors.supplier}</FormHelperText>
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
                                        {isSubmitting ? (
                                            <LoaderInnerCircular />
                                        ) : (
                                            'Save'
                                        )}
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
        <MainCard title="Bill of Materials" boxShadow shadow={theme.shadows[2]}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    style={{ top: -70, marginLeft: '10px' }}
                    startIcon={<DownloadOutlined />}
                    component="label"
                    onClick={handleOpenDialog}
                >
                    Add New Material
                </Button>
                <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    style={{ top: -70, marginLeft: '10px' }}
                    startIcon={<DownloadOutlined />}
                    component="label"
                >
                    {importingMaterials ? 'Importing...' : 'Batch Import Materials from Excel'}
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
                    style={{ top: -70, marginLeft: '10px' }}
                    startIcon={<DeleteOutlined />}
                    onClick={handleDeleteMaterials}
                    disabled={deletingMaterials || selectedIds.length === 0}
                >
                    {deletingMaterials ? 'Deleting...' : 'Delete Materials'}
                </Button>
            </div>
            <div style={{ width: '100%', marginTop: -31 }}>
                <DataGrid
                    rows={materials}
                    columns={columns}
                    pageSize={10}
                    autoHeight
                    autoPageSize
                    density="standard"
                    disableSelectionOnClick
                    loading={isLoading || loadingUpdate || importingMaterials}
                    components={{
                        Toolbar: GridToolbar,
                    }}
                    onCellEditCommit={handleCellEditCommit}
                    onFilterModelChange={(model) => {
                        const filter = model.items.map((item) => {
                            return [item.columnField, item.operatorValue, item.value];
                        });
                        const filterids = materials
                            .filter((material) => {
                                return filter.every(([field, operator, value]) => {
                                    const cellValue = material[field];
                                    if (operator === 'isEmpty') {
                                        return cellValue === '' || cellValue === undefined;
                                    } else if (operator === 'isNotEmpty') {
                                        return cellValue !== '' && cellValue !== undefined;
                                    } else if (value === undefined) {
                                        return true;
                                    } else if (operator === 'contains') {
                                        return (
                                            cellValue
                                                ?.toString()
                                                .toLowerCase()
                                                .includes(value.toLowerCase())
                                        );
                                    } else if (operator === 'equals') {
                                        return (
                                            cellValue?.toString().toLowerCase() === value.toLowerCase()
                                        );
                                    } else if (operator === 'startsWith') {
                                        return (
                                            cellValue
                                                ?.toString()
                                                .toLowerCase()
                                                .startsWith(value.toLowerCase())
                                        );
                                    } else if (operator === 'endsWith') {
                                        return (
                                            cellValue
                                                ?.toString()
                                                .toLowerCase()
                                                .endsWith(value.toLowerCase())
                                        );
                                    } else {
                                        return false;
                                    }
                                });
                            })
                            .map((material) => material.id);
                        setFilterIds(filterids);
                    }}
                />
            </div>
            <AddMaterialDialog open={openDialog} handleClose={handleCloseDialog} />
        </MainCard>
    );
};

export default BillOfMaterials;
