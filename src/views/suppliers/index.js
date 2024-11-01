// suppliers.js

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
import { DataGrid } from '@material-ui/data-grid';
import { CustomToolbar } from '../../ui-component/CustomNoRowOverlay';
import { useTheme } from '@material-ui/styles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {
    fetchSuppliers,
    addSupplier,
    updateSupplier,
    updateSuppliers,
    sendEmailsToSuppliers,
    deleteSuppliers,
    batchAddSuppliers
} from './helper';
import { fetchSurveys } from '../survey-templates/helper';
import { mentionUsers } from '../../views/authentication/session/auth.helper';
import Typography from '@material-ui/core/Typography';
import {
    DeleteOutlined,
    DownloadOutlined,
    ImportContactsOutlined,
    NotificationsActive
} from '@material-ui/icons';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import Checkbox from '@material-ui/core/Checkbox';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    FormControl,
    FormHelperText,
    Grid as MuiGrid,
    InputLabel,
    OutlinedInput,
    TextField
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { Formik } from 'formik';
import * as Yup from 'yup';
import LoaderInnerCircular from '../../ui-component/LoaderInnerCircular';
import AnimateButton from '../../ui-component/extended/AnimateButton';
import useScriptRef from '../../hooks/useScriptRef';
import { useStyles } from './styles';
import config from '../../configs';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
// 设置 PDF Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
    const [sendingEmails, setSendingEmails] = React.useState(false);
    const [deletingSuppliers, setDeletingSuppliers] = React.useState(false);
    const [importingSuppliers, setImportingSuppliers] = React.useState(false);

    const classes = useStyles();
    const scriptedRef = useScriptRef();

    const [openDialogFeedback, setOpenDialogFeedback] = React.useState(false);
    const [selectedFeedback, setSelectedFeedback] = React.useState([]);
    // Function to open the dialog and set selected feedback
    const handleOpenDialogFeedback = (feedbackArray) => {
        setSelectedFeedback(feedbackArray);
        setOpenDialogFeedback(true);
    };
    // Function to close the dialog
    const handleCloseDialogFeedback = () => {
        setOpenDialogFeedback(false);
        setSelectedFeedback([]);
        setSelectedDocument(null);
    };
    const [selectedDocument, setSelectedDocument] = React.useState(null);
    const [previewingFileType, setPreviewingFileType] = React.useState('');
    const [numPages, setNumPages] = React.useState(null);
    const handleDocumentClick = (document) => {
        setSelectedDocument(document);
        console.log('document',document);
        // Determine the file type based on the document
        const fileExtension = document.filename.split('.').pop();
        console.log('file extension',fileExtension);
        setPreviewingFileType(fileExtension);
    };
    // 加载供应商数据
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

    // 加载调查数据
    React.useEffect(() => {
        const loadSurveys = async () => {
            try {
                const response = await fetchSurveys();
                setSurveys(response);
            } catch (error) {
                console.error('Failed to fetch surveys:', error);
                toast.error('Failed to load surveys');
            }
        };
        loadSurveys();
    }, []);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    // 处理 Excel 文件上传
    const handleExcelUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                setImportingSuppliers(true);
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                
                if (jsonData.length === 0) {
                    toast.error('Excel file is empty');
                    setImportingSuppliers(false);
                    return;
                }

                // Validate and prepare supplier data
                const suppliersToAdd = [];
                const errors = [];

                jsonData.forEach((row, index) => {
                    const supplierName = row.supplierName || row['Supplier Name'];
                    const contact = row.contact || row['Contact'];
                    const materialName = row.materialName || row['Material Name'];
                    const partNumber = row.partNumber || row['Part Number'];
                    const chooseSurvey = row.chooseSurvey || row['Choose Survey'];
                    const status = row.status || row['Status'] || 'inactive'; // Default to 'inactive'

                    // Basic validation
                    if (!supplierName) {
                        errors.push(`Row ${index + 2}: Missing supplier name.`);
                        return;
                    }
                    if (!contact) {
                        errors.push(`Row ${index + 2}: Missing contact.`);
                        return;
                    }

                    // Validate email format
                    if (!isValidEmail(contact)) {
                        errors.push(`Row ${index + 2}: Invalid email format.`);
                        return;
                    }

                    // Optionally, validate chooseSurvey exists in surveys
                    let validSurveyId = '';
                    if (chooseSurvey) {
                        const survey = surveys.find(
                            (s) => s.name.toLowerCase() === chooseSurvey.toString().toLowerCase() || s._id === chooseSurvey
                        );
                        if (survey) {
                            validSurveyId = survey._id;
                        } else {
                            errors.push(`Row ${index + 2}: Survey "${chooseSurvey}" not found.`);
                            return;
                        }
                    }

                    suppliersToAdd.push({
                        supplierName,
                        contact,
                        materialName,
                        partNumber,
                        chooseSurvey: validSurveyId,
                        status
                    });
                });

                if (errors.length > 0) {
                    errors.forEach((error) => toast.error(error));
                    toast.error('Some rows have errors. Please fix them and try again.');
                    setImportingSuppliers(false);
                    return;
                }

                // Batch add suppliers
                try {
                    const result = await batchAddSuppliers(suppliersToAdd);
                    if (result.length > 0) {
                        toast.success(`${suppliersToAdd.length} supplier(s) imported successfully.`);
                    }
                    // Reload suppliers data
                    await loadData();
                } catch (batchError) {
                    console.error('Batch import failed:', batchError);
                    toast.error('Batch import failed. Please try again.');
                }

            } catch (error) {
                console.error('Error reading Excel file:', error);
                toast.error('Failed to read Excel file.');
            } finally {
                setImportingSuppliers(false);
                // Reset the file input
                event.target.value = null;
            }
        };

        reader.readAsArrayBuffer(file);
    };

    
    // 验证邮箱格式的函数
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // 处理发送邮件
    const handleSendEmails = async () => {
        if (selectedIds.length === 0) {
            toast.error('No suppliers selected');
            return;
        }

        const result = await Swal.fire({
            title: 'Confirm Sending',
            text: `Are you sure you want to send emails to the selected ${selectedIds.length} suppliers?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, send it!',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) {
            return;
        }

        setSendingEmails(true);

        try {
            const selectedSuppliers = suppliers.filter((supplier) =>
                selectedIds.includes(supplier.id)
            );
            const emailData = selectedSuppliers.map((supplier) => {
                const email = supplier.contact;
                if (!email) {
                    throw new Error(
                        `Supplier "${supplier.supplierName}" is missing an email address`
                    );
                }

                if (!isValidEmail(email)) {
                    throw new Error(
                        `Invalid email format for supplier "${supplier.supplierName}"`
                    );
                }

                let survey = surveys.find(
                    (s) => s._id === supplier.chooseSurvey
                );

                return {
                    email,
                    survey,
                };
            });

            const results = await sendEmailsToSuppliers(emailData);

            const fulfilled = results.filter((r) => r.status === 'fulfilled')
                .length;
            const rejected = results.filter((r) => r.status === 'rejected');

            if (fulfilled > 0) {
                toast.success(`${fulfilled} email(s) sent successfully`);
            }

            if (rejected.length > 0) {
                rejected.forEach((r) => {
                    if (r.reason) {
                        toast.error(
                            r.reason.message ||
                                'Error occurred while sending email'
                        );
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

    // 处理删除供应商
    const handleDeleteSuppliers = async () => {
        if (selectedIds.length === 0) {
            toast.error('No suppliers selected');
            return;
        }

        const result = await Swal.fire({
            title: 'Confirm Deletion',
            text: `Are you sure you want to delete the selected ${selectedIds.length} suppliers?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete them!',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) {
            return;
        }

        setDeletingSuppliers(true);

        try {
            await deleteSuppliers(selectedIds);
            toast.success('Suppliers deleted successfully');
            await loadData();
            setSelectedIds([]);
        } catch (error) {
            console.error('Error deleting suppliers:', error);
            toast.error('Failed to delete suppliers');
        } finally {
            setDeletingSuppliers(false);
        }
    };

    // 处理选择单个供应商
    const handleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // 处理全选/取消全选
    const handleSelectAll = () => {
        const allRowIds = filterIds.map((id) => id);
        if (filterIds.every((id) => selectedIds.includes(id))) {
            setSelectedIds(selectedIds.filter((id) => !filterIds.includes(id)));
        } else {
            setSelectedIds([...new Set([...selectedIds, ...allRowIds])]);
        }
    };

    // 打开和关闭添加供应商的对话框
    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleAddSuccess = () => {
        loadData();
    };

    // Details Dialog (Optional, implement as needed)
    const handleOpenDetailsDialog = (survey) => {
        // Implement survey details dialog logic here
        // For example, set a state with survey details and open a new Dialog component
    };

    // 删除单个供应商
    const handleDeleteSingleSupplier = async (id) => {
        const result = await Swal.fire({
            title: 'Confirm Deletion',
            text: 'Are you sure you want to delete this supplier?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                await deleteSuppliers([id]);
                toast.success('Supplier deleted successfully');
                await loadData();
            } catch (error) {
                console.error('Error deleting supplier:', error);
                toast.error('Failed to delete supplier');
            }
        }
    };

    const [selectedSurveyId, setSelectedSurveyId] = React.useState('');
    const handleAssignSurvey = async (event) => {
        const surveyId = event.target.value;
        setSelectedSurveyId(surveyId);
    
        // Confirmation dialog
        const result = await Swal.fire({
            title: 'Confirm Assign Survey',
            text: `Are you sure you want to assign this survey to the selected ${selectedIds.length} suppliers?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, assign it!',
            cancelButtonText: 'Cancel'
        });
    
        if (!result.isConfirmed) {
            return;
        }
    
        // Make API call to update suppliers
        try {
            setLoadingUpdate(true);
            console.log('selectedIds',selectedIds);
            console.log('surveyId',surveyId);
            await updateSuppliers(selectedIds, { chooseSurvey: surveyId });
    
            // Update the suppliers in local state
            setSuppliers((prevSuppliers) =>
                prevSuppliers.map((supplier) =>
                    selectedIds.includes(supplier.id)
                        ? { ...supplier, chooseSurvey: surveyId }
                        : supplier
                )
            );
    
            toast.success('Survey assigned successfully');
        } catch (error) {
            console.error('Failed to assign survey:', error);
            toast.error('Failed to assign survey');
        } finally {
            setLoadingUpdate(false);
            setSelectedSurveyId('');
        }
    };    

    const [scale, setScale] = React.useState(1.0); // 初始缩放比例为1.0
    const handleZoomIn = () => {
        setScale(prevScale => (prevScale < 3.0 ? prevScale + 0.2 : prevScale)); // 最大缩放到3.0
    };
    const handleZoomOut = () => {
        setScale(prevScale => (prevScale > 0.4 ? prevScale - 0.2 : prevScale)); // 最小缩小到0.4
    };

    // 列定义
    const columns = [
        // 选择列
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
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <IconButton onClick={() => handleSelect(params.row.id)}>
                            {isSelected ? (
                                <CheckCircleIcon style={{ color: 'green' }} />
                            ) : (
                                <RadioButtonUncheckedIcon />
                            )}
                        </IconButton>
                    </div>
                );
            }
        },
        // 供应商名称列
        {
            field: 'supplierName',
            headerName: 'Supplier Name',
            sortable: true,
            width: 190,
            editable: true, // 可编辑
            valueGetter: (params) => params.row?.supplierName || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.supplierName || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.supplierName}
                    </Typography>
                </Tooltip>
            )
        },
        // 联系方式列（假设是邮箱）
        {
            field: 'contact',
            headerName: 'Contact',
            sortable: true,
            width: 270,
            editable: true, // 可编辑
            valueGetter: (params) => params.row?.contact || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.contact || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.contact}
                    </Typography>
                </Tooltip>
            )
        },
        // 材料名称列
        {
            field: 'materialName',
            headerName: 'Material Name',
            sortable: true,
            width: 200,
            editable: true, // 可编辑
            valueGetter: (params) => params.row?.materialName || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.materialName || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.materialName}
                    </Typography>
                </Tooltip>
            )
        },
        // 零件编号列
        {
            field: 'partNumber',
            headerName: 'Part Number',
            sortable: true,
            width: 190,
            editable: true, // 可编辑
            valueGetter: (params) => params.row?.partNumber || '',
            renderCell: (params) => (
                <Tooltip title={params.row?.partNumber || ''} arrow>
                    <Typography variant="body1" noWrap>
                        {params.row?.partNumber}
                    </Typography>
                </Tooltip>
            )
        },
        // 选择调查列
        {
            field: 'chooseSurvey',
            headerName: 'Choose Survey',
            sortable: true,
            width: 300,
            editable: true,
            valueGetter: (params) => params.row?.chooseSurvey || '',
            renderCell: (params) => {
                const selectedSurveyId = params.row?.chooseSurvey || '';
                const selectedSurvey = surveys.find(
                    (survey) => survey._id === selectedSurveyId
                );
                return (
                    <Tooltip
                        title={selectedSurvey ? selectedSurvey.name : ''}
                        arrow
                    >
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
                                supplier.id === id
                                    ? { ...supplier, chooseSurvey: selectedSurveyId }
                                    : supplier
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
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            width: '100%'
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
            }
        },
        // // 状态列
        // {
        //     field: 'status',
        //     headerName: 'Status',
        //     sortable: true,
        //     width: 150,
        //     editable: true,
        //     valueGetter: (params) => params.row?.status || '',
        //     renderCell: (params) => (
        //         <Tooltip title={params.row?.status || ''} arrow>
        //             <Typography variant="body1" noWrap>
        //                 {params.row?.status}
        //             </Typography>
        //         </Tooltip>
        //     ),
        //     renderEditCell: (params) => (
        //         <Select
        //             style={{
        //                 display: 'flex',
        //                 justifyContent: 'center',
        //                 alignItems: 'center',
        //                 height: '100%',
        //                 width: '100%'
        //             }}
        //             value={params.value}
        //             onChange={(event) => {
        //                 params.api.setEditCellValue({
        //                     id: params.id,
        //                     field: 'status',
        //                     value: event.target.value
        //                 });
        //             }}
        //             autoFocus
        //         >
        //             {statusOptions.map((status) => (
        //                 <MenuItem key={status} value={status}>
        //                     {status}
        //                 </MenuItem>
        //             ))}
        //         </Select>
        //     )
        // },
        // 反馈列
        {
            field: 'feedback',
            headerName: 'Feedback & Documents',
            sortable: true,
            width: 400,
            valueGetter: (params) => params.row?.feedback ? `Feedbacks (${params.row?.feedback.length})` : 'No Feedback Available',
            renderCell: (params) => {
                const feedbackArray = params.row?.feedback;
                return (
                    <div
                        style={{ width: '100%', cursor: 'pointer' }}
                        onClick={() => handleOpenDialogFeedback(feedbackArray)}
                    >
                        {feedbackArray.length > 0 ? (
                            <Typography variant="body1" noWrap>
                                {`Feedbacks (${feedbackArray.length})`}
                            </Typography>
                        ) : (
                            <Typography variant="body1" noWrap>
                                No Feedback Available
                            </Typography>
                        )}
                    </div>
                );
            },
        },
        // Actions Column
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            sortable: false,
            renderCell: (params) => (
                <strong>
                    <Button
                        variant='contained'
                        color='primary'
                        size='small'
                        startIcon={<ImportContactsOutlined />}
                        style={{ marginRight: 16 }}
                        onClick={() => handleOpenDetailsDialog(params.row)}
                    >
                        Details
                    </Button>
                    <IconButton
                        onClick={(event) => {
                            event.stopPropagation(); // Prevent event bubbling
                            handleDeleteSingleSupplier(params.row.id);
                        }}
                    >
                        <DeleteOutlined color="secondary" />
                    </IconButton>
                </strong>
            ),
        },
    ];

    const handleCellEditCommit = React.useCallback(
        async (params) => {
            const { id, field, value } = params;
            // 如果没有变化，不执行任何操作
            if (suppliers.find((supplier) => supplier.id === id)[field] === value) {
                return;
            }
            // 更新供应商数据
            try {
                setLoadingUpdate(true);
                await updateSupplier(id, { [field]: value });
                setSuppliers((prevSuppliers) =>
                    prevSuppliers.map((supplier) =>
                        supplier.id === id
                            ? { ...supplier, [field]: value }
                            : supplier
                    )
                );
                toast.success('Survey updated successfully');
            } catch (error) {
                console.error('Failed to update survey:', error);
                toast.error('Failed to update survey');
            } finally {
                setLoadingUpdate(false);
            }
            // 你可以在这里添加其他逻辑，比如发送更新到服务器
            console.log(`Row with id ${id} updated. Field: ${field}, New Value: ${value}`);
        }, [suppliers]
    );
    
    // 添加供应商对话框
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
                            supplierName: Yup.string().required(
                                'Supplier Name is required'
                            ),
                            contact: Yup.string().required(
                                'Contact is required'
                            ),
                            materialName: Yup.string().required(
                                'Material Name is required'
                            ),
                            partNumber: Yup.string().required(
                                'Part Number is required'
                            ),
                            chooseSurvey: Yup.string(),
                            status: Yup.string()
                                .oneOf(statusOptions)
                                .required('Status is required')
                        })}
                        onSubmit={async (
                            values,
                            { setErrors, setStatus, setSubmitting }
                        ) => {
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
                                            <InputLabel htmlFor="supplierName">
                                                Supplier Name
                                            </InputLabel>
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
                                                <FormHelperText error>
                                                    {errors.supplierName}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl
                                            fullWidth
                                            className={classes.input}
                                        >
                                            <InputLabel htmlFor="contact">
                                                Contact
                                            </InputLabel>
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
                                                <FormHelperText error>
                                                    {errors.contact}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl
                                            fullWidth
                                            className={classes.input}
                                        >
                                            <InputLabel htmlFor="materialName">
                                                Material Name
                                            </InputLabel>
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
                                                <FormHelperText error>
                                                    {errors.materialName}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl
                                            fullWidth
                                            className={classes.input}
                                        >
                                            <InputLabel htmlFor="partNumber">
                                                Part Number
                                            </InputLabel>
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
                                                <FormHelperText error>
                                                    {errors.partNumber}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl
                                            fullWidth
                                            className={classes.input}
                                        >
                                            <InputLabel id="chooseSurvey-label">
                                                Choose Survey
                                            </InputLabel>
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
                                                    <MenuItem
                                                        key={survey._id}
                                                        value={survey._id}
                                                    >
                                                        {survey.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.chooseSurvey && (
                                                <FormHelperText error>
                                                    {errors.chooseSurvey}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl
                                            fullWidth
                                            className={classes.input}
                                        >
                                            <InputLabel id="status-label">
                                                Status
                                            </InputLabel>
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
                                                    <MenuItem
                                                        key={status}
                                                        value={status}
                                                    >
                                                        {status}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.status && (
                                                <FormHelperText error>
                                                    {errors.status}
                                                </FormHelperText>
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

    // 主渲染部分
    return (
        <MainCard title='Suppliers' boxShadow shadow={theme.shadows[2]}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Select
                    value={selectedSurveyId}
                    onChange={handleAssignSurvey}
                    disabled={selectedIds.length === 0}
                    displayEmpty
                    color='primary'
                    size='small'
                    style={{ marginLeft: '10px', top: -63, right: -124, marginTop: -10 }}
                >
                    <MenuItem value="" disabled>
                        {selectedIds.length === 0 ? 'Select suppliers first' : 'Assign Survey'}
                    </MenuItem>
                    {surveys.map((survey) => (
                        <MenuItem key={survey._id} value={survey._id}>
                            {survey.name}
                        </MenuItem>
                    ))}
                </Select>
                <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    style={{ top: -70, marginLeft: '10px', right: -124 }}
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
                    {importingSuppliers ? 'Importing...' : 'Batch Import Suppliers from Excel'}
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
                    style={{ top: -70, marginLeft: '10px', right: -124 }}
                    startIcon={<DeleteOutlined />}
                    onClick={handleDeleteSuppliers}
                    disabled={deletingSuppliers || selectedIds.length === 0}
                >
                    {deletingSuppliers ? 'Deleting...' : 'Delete Suppliers'}
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
                    loading={isLoading || loadingUpdate || sendingEmails || importingSuppliers || deletingSuppliers}
                    components={{
                        Toolbar: () => <CustomToolbar title={"Suppliers"} length={suppliers.length} />
                    }}
                    onCellEditCommit={handleCellEditCommit}
                    experimentalFeatures={{ newEditingApi: true }}
                    onFilterModelChange={(model) => {
                        const filter = model.items.map((item) => {
                            return [
                                item.columnField,
                                item.operatorValue,
                                item.value
                            ];
                        });
                        const filterids = suppliers
                            .filter((supplier) => {
                                return filter.every(
                                    ([field, operator, value]) => {
                                        const cellValue = supplier[field];
                                        if (operator === 'isEmpty') {
                                            return (
                                                cellValue === '' ||
                                                cellValue === undefined
                                            );
                                        } else if (operator === 'isNotEmpty') {
                                            return (
                                                cellValue !== '' &&
                                                cellValue !== undefined
                                            );
                                        } else if (value === undefined) {
                                            return true;
                                        } else if (operator === 'contains') {
                                            return cellValue
                                                ?.toString()
                                                .toLowerCase()
                                                .includes(
                                                    value.toLowerCase()
                                                );
                                        } else if (operator === 'equals') {
                                            return (
                                                cellValue
                                                    ?.toString()
                                                    .toLowerCase() ===
                                                value.toLowerCase()
                                            );
                                        } else if (operator === 'startsWith') {
                                            return cellValue
                                                ?.toString()
                                                .toLowerCase()
                                                .startsWith(
                                                    value.toLowerCase()
                                                );
                                        } else if (operator === 'endsWith') {
                                            return cellValue
                                                ?.toString()
                                                .toLowerCase()
                                                .endsWith(value.toLowerCase());
                                        } else {
                                            return false;
                                        }
                                    }
                                );
                            })
                            .map((supplier) => supplier.id);
                        setFilterIds(filterids);
                    }}
                />
            </div>
            <AddSupplierDialog open={openDialog} handleClose={handleCloseDialog} />
            <Dialog open={openDialogFeedback} onClose={handleCloseDialogFeedback} maxWidth="lg" fullWidth>
                <DialogTitle>
                    Feedback & Documents
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseDialogFeedback}
                        style={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {selectedFeedback.length > 0 ? (
                        <div style={{ display: 'flex', height: 666, width: '100%' }}>
                            {/* Document Preview Area */}
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
                                {/* 缩放控制按钮 */}
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
                                <div style={{
                                    position: 'absolute',
                                    top: '29px',
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    overflow: 'auto',
                                    padding: '8px'
                                }}>
                                    {selectedDocument ? (
                                        previewingFileType === 'pdf' ? (
                                            <Document
                                                file={config[config.env].baseURL + selectedDocument.content}
                                                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                                loading={<LoaderInnerCircular />}
                                            >
                                                {Array.from(new Array(numPages), (el, index) => (
                                                    <Page key={`page_${index + 1}`} pageNumber={index + 1} scale={scale} />
                                                ))}
                                            </Document>
                                        ) : previewingFileType === 'xlsx' ? (
                                            <Typography variant='body1'>XLSX files cannot be previewed directly. Download to view.</Typography>
                                        ) : previewingFileType === 'txt' ? (
                                            <iframe 
                                                src={config[config.env].baseURL + selectedDocument.content} 
                                                style={{ width: '100%', height: '100%', border: 'none' }} 
                                                title="Text Document Preview"
                                            />
                                        ) : (
                                            <Typography variant='body1'>File type not supported for preview.</Typography>
                                        )
                                    ) : (
                                        <Typography variant='body1'>
                                            No file available.
                                        </Typography>
                                    )}
                                </div>
                            </div>
                            <div style={{
                                flex: '13',
                                height: '100%',
                                border: `1px solid ${theme.palette.divider}`,
                                boxSizing: 'border-box',
                                backgroundColor: '#fff',
                            }}>
                                <DataGrid
                                    rows={selectedFeedback.map((feedback, index) => ({
                                        id: index,
                                        subject: feedback.subject || 'No Subject',
                                        content: feedback.content || 'No Content',
                                        attachments: Array.isArray(feedback.attachments) && feedback.attachments.length > 0 
                                                        ? feedback.attachments
                                                        : [{ filename: 'No Document', url: '' }]
                                    }))}
                                    columns={[
                                        {
                                        field: 'subject',
                                        headerName: 'Subject',
                                        width: 200,
                                        renderCell: (params) => (
                                            <Tooltip title={params.value || 'No Subject'} arrow>
                                            <Typography noWrap>{params.value}</Typography>
                                            </Tooltip>
                                        ),
                                        },
                                        {
                                        field: 'content',
                                        headerName: 'Content',
                                        width: 300,
                                        renderCell: (params) => (
                                            <Tooltip title={params.value || 'No Content'} arrow>
                                            <Typography noWrap>{params.value}</Typography>
                                            </Tooltip>
                                        ),
                                        },
                                        {
                                        field: 'attachments',
                                        headerName: 'Document',
                                        width: 600, // You may want to increase the width to fit multiple documents
                                        renderCell: (params) => (
                                            <div style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
                                              {params.value.map((attachment, index) => (
                                                <Tooltip key={index} title={attachment.filename || 'No Document'} arrow>
                                                  <IconButton
                                                    size='small'
                                                    color="primary"
                                                    onClick={() => handleDocumentClick(attachment)}
                                                  >
                                                    {attachment.filename || 'No Document'}
                                                  </IconButton>
                                                </Tooltip>
                                              ))}
                                            </div>
                                          ),                                          
                                        },
                                    ]}
                                    pageSize={9}
                                    autoHeight
                                    disableSelectionOnClick
                                    density={'standard'}
                                    components={{
                                        Toolbar: () => <CustomToolbar title={"Feedback & Documents"} length={selectedFeedback.length} />
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <Typography variant="body1">
                            No Feedback Available
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialogFeedback} color="primary">
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

export default connect(mapStateToProps, null)(SuppliersComponent);
