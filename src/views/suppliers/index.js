// suppliers.js

import React from 'react';
import { connect, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import Tooltip from '@material-ui/core/Tooltip';
import MainCard from '../../ui-component/cards/MainCard';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
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
    AddOutlined,
    DeleteOutlined,
    DoneOutlineOutlined,
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
import { DateTimePicker, LocalizationProvider } from '@mui/lab';
import AdapterDateFns from '@date-io/date-fns';
import { set } from 'date-fns';
import { file } from 'jszip';
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
    const emailUpdateCount = useSelector((state) => state.emailReducer.emailUpdateCount);

    const classes = useStyles();
    const scriptedRef = useScriptRef();

    const [openDialogFeedback, setOpenDialogFeedback] = React.useState(false);
    const [selectedFeedback, setSelectedFeedback] = React.useState([]);
    const [selectedFeedbackSupplierId, setSelectedFeedbackSupplierId] = React.useState(null);
    const [dateTimePickerValue, setDateTimePickerValue] = React.useState(new Date());
    // Function to open the dialog and set selected feedback
    const handleOpenDialogFeedback = (feedbackArray, supplierId, nextSendTime) => {
        setSelectedFeedback(feedbackArray);
        setOpenDialogFeedback(true);
        setSelectedFeedbackSupplierId(supplierId);
        setDateTimePickerValue(nextSendTime ? new Date(nextSendTime) : new Date());
    };
    // Function to close the dialog
    const handleCloseDialogFeedback = async () => {
        setOpenDialogFeedback(false);
        setSelectedFeedback([]);
        setSelectedDocument(null);
        setSelectedFeedbackSupplierId(null);
        setDateTimePickerValue(new Date());
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

    const [lastEmailSentTime, setLastEmailSentTime] = React.useState(null); // 记录上次发送邮件的时间

    React.useEffect(() => {
        const checkEmailReminders = async () => {
            let suppliersEmailing = [];
            const now = new Date();
            // 如果上次发送邮件的时间存在，且距离现在小于10s，则跳过发送
            if (lastEmailSentTime && (now - lastEmailSentTime < 10000)) {
                console.log('Email already sent within the last minute. Skipping...');
                return;
            }
            suppliers.forEach((supplier) => {
                if (!supplier.nextEmailSendTime) {
                    return;
                }
                const nextSendTime = new Date(supplier.nextEmailSendTime);
                if (nextSendTime <= now && !supplier.isEmailSent) {
                    suppliersEmailing.push(supplier);
                }
            });
            if (suppliersEmailing.length === 0) {
                return;
            }
            setSendingEmails(true); // 设置发送邮件中...
            const response = await sendEmailsToSuppliers(suppliersEmailing);
            if (response) {
                toast.success(`${suppliersEmailing.length} email(s) sent successfully`);
                await updateSuppliers(suppliersEmailing.map((supplier) => supplier.id), {
                    nextEmailSendTime: new Date(),
                    isEmailSent: true
                });
                loadData();
                // 更新上次发送邮件的时间
                setLastEmailSentTime(new Date());
            }
            setSendingEmails(false); // 结束发送邮件的状态
        };
    
        checkEmailReminders();
    }, [suppliers]);  // 只在 suppliers 更新时触发    

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
    }, [loadData, emailUpdateCount]);

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
                    const supplierName = row.supplierName || row['Supplier Name'] || row['Supplier'];
                    const contact = row.contact || row['Contact'] || row['Email'];
                    const materialName = row.materialName || row.rawMaterialName || row['Material Name'] || row['Raw Material Name'];
                    const partNumber = row.partNumber || row.rawMaterialPartNumber || row['Part Number'] || row['Raw Material Part Number'];
                    const chooseSurvey = row.chooseSurvey || row['Choose Survey'] || row['Survey'] || row['Survey Name'];
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

                    const rawMaterials = [];
                    if (materialName || partNumber) {
                        rawMaterials.push({ rawMaterialName: materialName, rawMaterialPartNumber: partNumber });
                    }

                    suppliersToAdd.push({
                        supplierName,
                        contact,
                        rawMaterials,
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

                // 将 supplierName, contact, chooseSurvey 都相同的suppliers合并为一个（如果都不存在字段也视为相同）
                const uniqueSuppliers = suppliersToAdd.reduce((acc, supplier) => {
                    const existingSupplier = acc.find(
                        (s) =>
                            s.supplierName === supplier.supplierName &&
                            s.contact === supplier.contact &&
                            s.chooseSurvey === supplier.chooseSurvey
                    );
                    if (existingSupplier) {
                        existingSupplier.rawMaterials.push(...supplier.rawMaterials);
                    } else {
                        acc.push(supplier);
                    }
                    return acc;
                }, []);

                // Batch add suppliers
                try {
                    const result = await batchAddSuppliers(uniqueSuppliers);
                    if (result.length > 0) {
                        toast.success(`${uniqueSuppliers.length} supplier(s) imported successfully.`);
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
            setSelectedSurveyId('');
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

    // 计算剩余时间，返回一个友好的格式
    const calculateTimeLeft = (nextSendTime) => {
        const now = new Date();
        let timeDifference = new Date(nextSendTime) - now;

        // 前缀后缀设置为 “in” 或 “ago” 取决于时间差是否小于等于0
        const prefix = timeDifference > 0 ? 'Next email in' : 'Emailed';
        const suffix = timeDifference > 0 ? '' : 'ago';
        timeDifference = Math.abs(timeDifference);

        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

        let timeLeft = '';
        if (days === 0 && hours === 0) {
            timeLeft = `${minutes}m`;
        } else if (days === 0) {
            timeLeft = `${hours}h ${minutes}m`;
        } else {
            timeLeft = `${days}d ${hours}h`;
        }
        return prefix + ' ' + timeLeft + ' ' + suffix;
    };

    const [openRawMaterialsDialog, setOpenRawMaterialsDialog] = React.useState(false);
    const [selectedRawMaterials, setSelectedRawMaterials] = React.useState(null);
    const [selectedRawMaterialsSupplierId, setSelectedRawMaterialsSupplierId] = React.useState(null);
    const [newMaterial, setNewMaterial] = React.useState({ rawMaterialName: '', rawMaterialPartNumber: '' });
    const handleOpenRawMaterialsDialog = (rawMaterials, supplierId) => {
        setSelectedRawMaterials(rawMaterials.map((rawMaterial) => ({ id: rawMaterial._id, ...rawMaterial })));
        setSelectedRawMaterialsSupplierId(supplierId);
        setOpenRawMaterialsDialog(true);
    };
    const handleCloseRawMaterialsDialog = async () => {
        setSelectedRawMaterials(null);
        setSelectedRawMaterialsSupplierId(null);
        setOpenRawMaterialsDialog(false);
        setNewMaterial({ rawMaterialName: '', rawMaterialPartNumber: '' });
        await loadData();
    };
    const handleAddRawMaterialInputChange = (e) => {
        setNewMaterial({ ...newMaterial, [e.target.name]: e.target.value });
    }
    const handleAddRawMaterial = async () => {
        if (!newMaterial.rawMaterialName && !newMaterial.rawMaterialPartNumber) {
            toast.error('Please enter raw material name or part number');
            return;
        }
        const updatedRawMaterials = [...selectedRawMaterials, newMaterial];
        const result = await updateSupplier(selectedRawMaterialsSupplierId, { rawMaterials: updatedRawMaterials }); 
        if (!result) {
            toast.error('Failed to add raw material');
            return;
        }
        toast.success('Raw material added successfully');
        setSelectedRawMaterials(result.rawMaterials.map((rawMaterial) => ({ id: rawMaterial._id, ...rawMaterial })));
        console.log('selectedRawMaterials', selectedRawMaterials);
        setNewMaterial({ rawMaterialName: '', rawMaterialPartNumber: '' });
    };

    const handleDeleteSingleRawMaterial = async (rawMaterialId) => {
        const result = await updateSupplier(selectedRawMaterialsSupplierId, { rawMaterials: selectedRawMaterials.filter((rawMaterial) => rawMaterial.id !== rawMaterialId) });
        if (!result) {
            toast.error('Failed to delete raw material');
            return;
        }
        toast.success('Raw material deleted successfully');
        setSelectedRawMaterials(result.rawMaterials.map((rawMaterial) => ({ id: rawMaterial._id, ...rawMaterial })));
    }

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
            headerName: 'Raw Material Name',
            sortable: true,
            width: 250,
            valueGetter: (params) => params.row?.rawMaterials.map((rawMaterial) => rawMaterial.rawMaterialName).join(', ') || '',
            renderCell: (params) => {
                const supplierId = params.row?.id;
                const rawMaterials = params.row?.rawMaterials || [];
                return (
                    <Tooltip 
                        title={
                            <div style={{ display: 'table' }}>
                                {rawMaterials.map((rawMaterial, index) => (
                                    <div key={index} style={{ display: 'table-row' }}>
                                        <span 
                                            style={{
                                                fontStyle: 'italic',  // 设置斜体
                                                color: 'lightblue',         // 设置特殊颜色
                                                marginRight: '8px'    // 给斜体的索引一些右侧间距
                                            }}
                                        >
                                            {(index+1) + '.'}
                                        </span>
                                        {rawMaterial.rawMaterialName}
                                    </div>
                                ))}
                            </div>
                        } 
                        arrow
                    >
                        <Button
                            variant="text"
                            color="inherit"
                            onClick={() => {
                                console.log('rawMaterials', rawMaterials);
                                handleOpenRawMaterialsDialog(rawMaterials, supplierId);
                            }}
                            style={{
                                width: '104%',
                                height: '100%',
                                paddingLeft: 0,
                                marginLeft: '-2%',
                                display: 'flex',
                                flexDirection: 'column', // 使子元素垂直排列
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                overflowY: 'auto',  // 允许垂直滚动
                                maxHeight: '100%'  // 设置最大高度
                            }}
                        >
                           {rawMaterials.map((rawMaterial, index) => (
                                <Typography
                                    key={index}
                                    variant="body1"
                                    // noWrap
                                    style={{
                                        paddingLeft: '2%',
                                        textAlign: 'left',
                                        width: '100%',
                                        height: '100%',
                                        marginTop: '10px',
                                        marginBottom: '10px',
                                    }}
                                    // 设置颜色，不断交替
                                    color={index % 2 === 0 ? 'primary' : 'secondary'}
                                >
                                    {rawMaterial.rawMaterialName}
                                </Typography>
                            ))}
                        </Button>
                    </Tooltip>
                );
            }
        },
        // 零件编号列
        {
            field: 'partNumber',
            headerName: 'Raw Material Part Number',
            sortable: true,
            width: 290,
            valueGetter: (params) => params.row?.rawMaterials.map((rawMaterial) => rawMaterial.rawMaterialPartNumber).join(', ') || '',
            renderCell: (params) => {
                const supplierId = params.row?.id;
                const rawMaterials = params.row?.rawMaterials || [];
                return (
                    <Tooltip 
                        title={
                            <div style={{ display: 'table' }}>
                                {rawMaterials.map((rawMaterial, index) => (
                                    <div key={index} style={{ display: 'table-row' }}>
                                        <span 
                                            style={{
                                                fontStyle: 'italic',  // 设置斜体
                                                color: 'lightblue',         // 设置特殊颜色
                                                marginRight: '8px'    // 给斜体的索引一些右侧间距
                                            }}
                                        >
                                            {(index+1) + '.'}
                                        </span>
                                        {rawMaterial.rawMaterialPartNumber}
                                    </div>
                                ))}
                            </div>
                        } 
                        arrow
                    >
                        <Button
                            variant="text"
                            color="inherit"
                            onClick={() => {
                                console.log('rawMaterials', rawMaterials);
                                handleOpenRawMaterialsDialog(rawMaterials, supplierId);
                            }}
                            style={{
                                width: '104%',
                                height: '100%',
                                paddingLeft: 0,
                                marginLeft: '-2%',
                                display: 'flex',
                                flexDirection: 'column', // 使子元素垂直排列
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                overflowY: 'auto',  // 允许垂直滚动
                                maxHeight: '100%'  // 设置最大高度
                            }}
                        >
                           {rawMaterials.map((rawMaterial, index) => (
                                <Typography
                                    key={index}
                                    variant="body1"
                                    // noWrap
                                    style={{
                                        paddingLeft: '2%',
                                        textAlign: 'left',
                                        width: '100%',
                                        height: '100%',
                                        marginTop: '10px',
                                        marginBottom: '10px',
                                    }}
                                    // 设置颜色，不断交替
                                    color={index % 2 === 0 ? 'primary' : 'secondary'}
                                >
                                    {rawMaterial.rawMaterialPartNumber}
                                </Typography>
                            ))}
                        </Button>
                    </Tooltip>
                );
            }
        },
        // 选择调查列
        {
            field: 'chooseSurvey',
            headerName: 'Choose Survey',
            sortable: true,
            width: 300,
            editable: true,
            valueGetter: (params) => surveys.find(
                (survey) => survey._id === params.row?.chooseSurvey
            )?.title || '',
            renderCell: (params) => {
                const selectedSurveyId = params.row?.chooseSurvey || '';
                const selectedSurvey = surveys.find(
                    (survey) => survey._id === selectedSurveyId
                );
                return (
                    <Tooltip title={selectedSurvey ? selectedSurvey.title : ''} arrow>
                        <Typography variant="body1" noWrap>
                            {selectedSurvey ? selectedSurvey.title : ''}
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
                                {survey.title}
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
            valueGetter: (params) => {
                const feedbackArray = params.row?.feedback;
                if (feedbackArray.length > 0) {
                    return `Feedbacks (${feedbackArray.length})`;
                } else {
                    const nextSendTime = params.row?.nextEmailSendTime;
                    if (nextSendTime) {
                        const timeLeft = calculateTimeLeft(nextSendTime);
                        return `No Feedback - ${timeLeft}`;
                    }
                    return 'No Feedback';
                }
            },
            renderCell: (params) => {
                const feedbackArray = params.row?.feedback;
                const nextSendTime = params.row?.nextEmailSendTime;
                const supplierId = params.row?.id;
                const isEmailSent = params.row?.isEmailSent;
                return (
                    <div
                        style={{ width: '100%', cursor: 'pointer' }}
                        onClick={() => handleOpenDialogFeedback(feedbackArray, supplierId, nextSendTime)}
                    >
                        {feedbackArray.length > 0 ? (
                            <Typography variant="body1" noWrap>
                                {`Feedbacks (${feedbackArray.length})`}
                            </Typography>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Tooltip title="No feedback">
                                    <Typography variant="body1" noWrap>
                                        No Feedback
                                    </Typography>
                                </Tooltip>
                                {nextSendTime && (
                                    <Tooltip title={`${calculateTimeLeft(nextSendTime)}`}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <NotificationsActive style={{ marginLeft: 8, color: isEmailSent ? '#4caf50' : '#ff9800' }} />
                                            <Typography variant="body2" color="textSecondary" style={{ marginLeft: 8 }}>
                                                {`- ${calculateTimeLeft(nextSendTime)}`}
                                            </Typography>
                                        </div>
                                    </Tooltip>
                                )}
                            </div>
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
            filterable: false,
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

    const handleRawMaterialsDialogDataGridCellEditCommit = React.useCallback(
        async (params) => {
            const { id, field, value } = params;
            // 如果没有变化，不执行任何操作
            if (selectedRawMaterials.find((rawMaterial) => rawMaterial.id === id)[field] === value) {
                return;
            }
            // 更新供应商数据
            try {
                setLoadingUpdate(true);
                const updatedRawMaterials = selectedRawMaterials.map((rawMaterial) =>
                    rawMaterial.id === id ? { ...rawMaterial, [field]: value } : rawMaterial
                );
                await updateSupplier(selectedRawMaterialsSupplierId, { rawMaterials: updatedRawMaterials });
                setSelectedRawMaterials(updatedRawMaterials);
                toast.success('Raw material updated successfully');
            } catch (error) {
                console.error('Failed to update raw material:', error);
                toast.error('Failed to update raw material');
            } finally {
                setLoadingUpdate(false);
            }
            // 你可以在这里添加其他逻辑，比如发送更新到服务器
            console.log(`Row with id ${id} updated. Field: ${field}, New Value: ${value}`);
        }, [selectedRawMaterials, selectedRawMaterialsSupplierId]
    );
    
    // 添加供应商对话框
    const AddSupplierDialog = ({ open, handleClose }) => {
        const [dateTimePickerValue, setDateTimePickerValue] = React.useState(null); // 记录选择的时间

        return (
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" aria-labelledby="add-supplier-dialog-title">
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
                            supplierDocuments: '',
                            nextEmailSendTime: null // 初始化为 null，可以为空
                        }}
                        validationSchema={Yup.object().shape({
                            supplierName: Yup.string().required('Supplier Name is required'),
                            contact: Yup.string().required('Contact is required'),
                            materialName: Yup.string(),
                            partNumber: Yup.string(),
                            chooseSurvey: Yup.string(),
                            status: Yup.string().oneOf(statusOptions).required('Status is required')
                        })}
                        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                            try {
                                if (values.materialName || values.partNumber) {
                                    values.rawMaterials = [
                                        {
                                            rawMaterialName: values.materialName,
                                            rawMaterialPartNumber: values.partNumber
                                        }
                                    ];
                                }
                                const dataToSubmit = {
                                    ...values,
                                    nextEmailSendTime: dateTimePickerValue || null // 如果时间选择器为空，传递 null
                                };

                                if (scriptedRef.current) {
                                    await addSupplier(dataToSubmit);
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
                                            {errors.supplierName && <FormHelperText error>{errors.supplierName}</FormHelperText>}
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
                                            {errors.contact && <FormHelperText error>{errors.contact}</FormHelperText>}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl fullWidth className={classes.input}>
                                            <InputLabel htmlFor="materialName">Raw Material Name</InputLabel>
                                            <OutlinedInput
                                                id="materialName"
                                                type="text"
                                                value={values.materialName}
                                                name="materialName"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Material Name"
                                            />
                                            {errors.materialName && <FormHelperText error>{errors.materialName}</FormHelperText>}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl fullWidth className={classes.input}>
                                            <InputLabel htmlFor="partNumber">Raw Material Part Number</InputLabel>
                                            <OutlinedInput
                                                id="partNumber"
                                                type="text"
                                                value={values.partNumber}
                                                name="partNumber"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Part Number"
                                            />
                                            {errors.partNumber && <FormHelperText error>{errors.partNumber}</FormHelperText>}
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
                                                        {survey.title}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.chooseSurvey && <FormHelperText error>{errors.chooseSurvey}</FormHelperText>}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl fullWidth className={classes.input}>
                                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                <InputLabel htmlFor="nextEmailSendTime" style={{ paddingLeft: '50%', marginTop: '-5px' }}>
                                                    Email Send Time (Optional) {`—>`}
                                                </InputLabel>
                                                <DateTimePicker
                                                    id="nextEmailSendTime"
                                                    value={dateTimePickerValue}
                                                    onChange={setDateTimePickerValue}
                                                    renderInput={(params) => <TextField {...params} />}
                                                    minDate={new Date()} // 禁止选择过去的时间
                                                    minDateTime={new Date()} // 禁止选择过去的时间
                                                />
                                            </LocalizationProvider>
                                            {errors.nextEmailSendTime && <FormHelperText error>{errors.nextEmailSendTime}</FormHelperText>}
                                        </FormControl>
                                    </MuiGrid>
                                    {/* <MuiGrid item xs={12}>
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
                                    </MuiGrid> */}
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
                        Assign Survey
                    </MenuItem>
                    {surveys.map((survey) => (
                        <MenuItem key={survey._id} value={survey._id}>
                            {survey.title}
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
                                        // [TODO] [FIXME] 特殊处理 Choose Survey 列 和 Feedback 列
                                        const cellValue = (field === 'chooseSurvey') 
                                                            ? surveys.find((s) => s._id === supplier.chooseSurvey)?.name 
                                                            : (field === 'feedback') 
                                                                ? (supplier.feedback.length > 0 ? `Feedbacks (${supplier.feedback.length})`: 'No Feedback')
                                                                : supplier[field];
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
            <Dialog 
                open={openDialogFeedback} 
                onClose={handleCloseDialogFeedback} 
                maxWidth={selectedFeedback.length > 0 ? 'lg' : 'sm'}
                fullWidth>
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
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <div>
                            <Typography variant="body1" style={{ marginBottom: '16px' }}>
                                No Feedback Available. Please select a date and time:
                            </Typography>
                            <DateTimePicker
                                value={dateTimePickerValue}
                                onChange={setDateTimePickerValue}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                                minutesStep={1} // 设置分钟步长为1，精确到分钟
                                minDate={new Date()} // 禁止选择现在之前的时间
                                minDateTime={new Date()} // 除了日期，时间也需要禁止选择当前时间之前
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                style={{ marginTop: '16px' }}
                                onClick={async () => {
                                    await updateSupplier(selectedFeedbackSupplierId, { 
                                        nextEmailSendTime: dateTimePickerValue,
                                        isEmailSent: false
                                    });
                                    handleCloseDialogFeedback();
                                    await loadData();
                                }}
                            >
                                Confirm Timer
                            </Button>
                            </div>
                        </LocalizationProvider>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialogFeedback} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openRawMaterialsDialog}
                onClose={handleCloseRawMaterialsDialog}
                fullWidth
                maxWidth="lg"
                aria-labelledby="add-raw-material-dialog-title"
            >
                <DialogTitle id="add-raw-material-dialog-title">
                    {selectedRawMaterials ? 'Edit Raw Materials' : 'Add Raw Material'}
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseRawMaterialsDialog}
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <DataGrid
                            rows={ selectedRawMaterials || [] }
                            columns={[
                                {
                                    field: 'rawMaterialName',
                                    headerName: 'Raw Material Name',
                                    width: 500,
                                    editable: true,
                                    renderCell: (params) => (
                                        <Tooltip title={params.value || ''} arrow>
                                            <Typography noWrap>{params.value}</Typography>
                                        </Tooltip>
                                    ),
                                },
                                {
                                    field: 'rawMaterialPartNumber',
                                    headerName: 'Raw Material Part Number',
                                    width: 500,
                                    editable: true,
                                    renderCell: (params) => (
                                        <Tooltip title={params.value || ''} arrow>
                                            <Typography noWrap>{params.value}</Typography>
                                        </Tooltip>
                                    ),
                                },
                                {
                                    field: 'actions',
                                    headerName: 'Actions',
                                    width: 200,
                                    filterable: false,
                                    sortable: false,
                                    renderCell: (params) => (
                                        <strong>
                                            <IconButton
                                                onClick={(event) => {
                                                    event.stopPropagation(); // Prevent event bubbling
                                                    handleDeleteSingleRawMaterial(params.row.id);
                                                }}
                                            >
                                                <DeleteOutlined color="secondary" />
                                            </IconButton>
                                        </strong>
                                    ),
                                }
                            ]}
                            pageSize={5}
                            onCellEditCommit={handleRawMaterialsDialogDataGridCellEditCommit}
                            autoHeight
                            disableSelectionOnClick
                            density={'standard'}
                        />
                        <Divider style={{marginTop: "10px", marginBottom: "-10px"}}/>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <TextField
                                label="New Material Name"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                name="rawMaterialName"
                                value={newMaterial.rawMaterialName}
                                onChange={handleAddRawMaterialInputChange}
                            />
                            <TextField
                                label="New Part Number"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                name="rawMaterialPartNumber"
                                value={newMaterial.rawMaterialPartNumber}
                                onChange={handleAddRawMaterialInputChange}
                            />
                            <Button 
                                fullWidth
                                onClick={handleAddRawMaterial} 
                                color="primary"
                                variant="contained"
                                startIcon={<AddOutlined />}   
                                // 上下居中
                                style={{ marginTop: '17px', marginBottom: '10px', width: '50%' }}
                            >
                                Add Raw Material
                            </Button>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRawMaterialsDialog} color="primary">
                        Cancel
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
