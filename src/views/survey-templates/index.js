import React from 'react';
import { connect } from 'react-redux';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import config from '../../configs';

import MainCard from '../../ui-component/cards/MainCard';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { DataGrid, GridToolbar } from '@material-ui/data-grid';
import { useTheme } from '@material-ui/styles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';

import { fetchSurveys, addSurvey, deleteSurveys, updateSurvey } from './helper'; // Adjust the path as needed
import { CustomLoadingOverlay, CustomNoRowsOverlay } from '../../ui-component/CustomNoRowOverlay';
import Typography from '@material-ui/core/Typography';
import { DeleteOutlined, DownloadOutlined, ImportContactsOutlined, FileUpload as FileUploadIcon } from '@material-ui/icons';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import Checkbox from '@material-ui/core/Checkbox';

import { mentionUsers } from '../../views/authentication/session/auth.helper';
import * as XLSX from 'xlsx';  // Import xlsx library

import { useStyles } from './styles'; // Create a styles file or adjust styles as needed
import AnimateButton from '../../ui-component/extended/AnimateButton';
import useScriptRef from '../../hooks/useScriptRef';
import { Dialog, DialogContent, DialogTitle, DialogActions, FormControl, FormHelperText, Grid as MuiGrid, InputLabel, OutlinedInput, TextField } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { Formik } from 'formik';
import * as Yup from 'yup';
import LoaderInnerCircular from '../../ui-component/LoaderInnerCircular';

import { useDropzone } from 'react-dropzone';
import ClearIcon from '@material-ui/icons/Clear';
import LinearProgressBar from '../../ui-component/LinearProgress'; // Assuming this is a custom progress bar component
import { data } from 'jquery';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// 设置 PDF Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const SurveysComponent = ({ user }) => {
    const theme = useTheme();
    const classes = useStyles();
    const scriptedRef = useScriptRef();

    const [surveys, setSurveys] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [loadingUpdate, setLoadingUpdate] = React.useState(false);
    const [selectedIds, setSelectedIds] = React.useState([]);
    const [filterIds, setFilterIds] = React.useState([]);
    const [openDialog, setOpenDialog] = React.useState(false);

    // Delete surveys
    const [deletingSurveys, setDeletingSurveys] = React.useState(false);

    const loadData = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetchSurveys();
            const surveysData = response.map((survey, index) => ({
                ...survey,
                id: survey._id || index + 1, // Ensure each survey has a unique 'id'
            }));
            setSurveys(surveysData);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error('Failed to load surveys:', error);
            toast.error('Failed to load surveys');
        }
    }, []);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    // Open and close dialog
    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);

    // Delete surveys handler
    const handleDeleteSurveys = async () => {
        if (selectedIds.length === 0) {
            toast.error('No surveys selected');
            return;
        }

        // Use SweetAlert2 for confirmation
        const result = await Swal.fire({
            title: 'Confirm Deletion',
            text: `Are you sure you want to delete the selected ${selectedIds.length} surveys?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete them!',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) {
            return;
        }

        setDeletingSurveys(true);

        try {
            await deleteSurveys(selectedIds);
            toast.success('Surveys deleted successfully');
            // Reload survey list
            await loadData();
            // Clear selected IDs
            setSelectedIds([]);
        } catch (error) {
            console.error('Error deleting surveys:', error);
            toast.error('Failed to delete surveys');
        } finally {
            setDeletingSurveys(false);
        }
    };

    // Handle Excel file upload
    const handleExcelUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return; // Handle no file selected

        const reader = new FileReader();
        
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0]; // Get the first sheet
            const worksheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            jsonData.forEach(row => {
                const email = row.email; // Read email
                if (email) {
                    mentionUsers({ email, mention: 'Hello' });
                }
            });

            toast.success('Successfully mentioned users from Excel!');
        };

        reader.readAsArrayBuffer(file);
    };

    // Toggle selection of a row
    const handleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Handle select all
    const handleSelectAll = () => {
        const allRowIds = filterIds.map((id) => id);
        if (filterIds.every((id) => selectedIds.includes(id))) {
            setSelectedIds(selectedIds.filter((id) => !filterIds.includes(id)));
        } else {
            setSelectedIds([...new Set([...selectedIds, ...allRowIds])]);
        }
    };

    // 状态管理 for Attachments Dialog
    const [openAttachmentsDialog, setOpenAttachmentsDialog] = React.useState(false);
    const [currentAttachments, setCurrentAttachments] = React.useState([]);

    // 打开附件对话框并设置当前附件
    const handleOpenAttachmentsDialog = (attachments) => {
        setCurrentAttachments(attachments);
        setOpenAttachmentsDialog(true);
    };

    // 关闭附件对话框并清空当前附件
    const handleCloseAttachmentsDialog = () => {
        setOpenAttachmentsDialog(false);
        setCurrentAttachments([]);
    };

    // Define columns including attachments column
    const columns = [
        // Selection Checkbox Column
        {
            field: 'select',
            headerName: (
                <Checkbox
                    checked={surveys.length > 0 && selectedIds.length === surveys.length}
                    indeterminate={selectedIds.length > 0 && selectedIds.length < surveys.length}
                    onChange={handleSelectAll}
                    style={{ padding: 0 }}
                    color="primary"
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
        // Survey Name Column
        {
            field: 'name',
            headerName: 'Survey Name',
            width: 190,
            sortable: true,
            editable: true, // 可编辑
            valueGetter: (params) => params.row?.name || '',
            renderCell: (params) => (
                <Tooltip title={params.row.name || ''} arrow>
                    <Typography variant="body2" noWrap>
                        {params.row.name}
                    </Typography>
                </Tooltip>
            ),
        },
        // Survey Subject Column
        {
            field: 'title',
            headerName: 'Survey Subject',
            width: 200,
            sortable: true,
            editable: true, // 可编辑
            valueGetter: (params) => params.row?.title || '',
            renderCell: (params) => (
                <Tooltip title={params.row.title || ''} arrow>
                    <Typography variant="body2" noWrap>
                        {params.row.title}
                    </Typography>
                </Tooltip>
            ),
        },
        // Survey Content Column
        {
            field: 'content',
            headerName: 'Survey Content',
            width: 300,
            sortable: false,
            editable: true, // 可编辑
            valueGetter: (params) => params.row?.content || '',
            renderCell: (params) => (
                <Tooltip title={params.row.content || ''} arrow>
                    <Typography variant="body2" noWrap>
                        {params.row.content}
                    </Typography>
                </Tooltip>
            ),
        },
        // Description Column
        {
            field: 'description',
            headerName: 'Description',
            width: 200,
            sortable: false,
            editable: true, // 可编辑
            valueGetter: (params) => params.row?.description || '',
            renderCell: (params) => (
                <Tooltip title={params.row.description || ''} arrow>
                    <Typography variant="body2" noWrap>
                        {params.row.description}
                    </Typography>
                </Tooltip>
            ),
        },
        // Attachments Column
        {
            field: 'attachments',
            headerName: 'Attachments',
            width: 200,
            sortable: false,
            valueGetter: (params) => params.row?.attachment || '',
            renderCell: (params) => {
                const attachments = params.row.attachments || [];
                const count = attachments.length;
                return count > 0 ? (
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleOpenAttachmentsDialog(attachments)}
                    >
                        Attachments ({count})
                    </Button>
                ) : (
                    <Typography variant="body2">No Attachments</Typography>
                );
            },
        },
        // Revision Column
        {
            field: 'revision',
            headerName: 'Revision',
            width: 150,
            sortable: true,
            valueGetter: (params) => params.row?.revision || '',
            renderCell: (params) => (
                <Tooltip title={params.row.revision?.toString() || ''} arrow>
                    <Typography variant="body2" noWrap>
                        {params.row.revision}
                    </Typography>
                </Tooltip>
            ),
        },
        // Created At Column
        {
            field: 'createdAt',
            headerName: 'Created At',
            width: 180,
            sortable: true,
            valueFormatter: (params) => new Date(params.value).toLocaleString(),
            valueGetter: (params) => params.row?.createdAt || '',
            renderCell: (params) => (
                <Tooltip title={new Date(params.row?.createdAt).toLocaleString()} arrow>
                    <Typography variant="body2" noWrap>
                        {new Date(params.row?.createdAt).toLocaleString()}
                    </Typography>
                </Tooltip>
            ),
        },
        // Updated At Column
        {
            field: 'updatedAt',
            headerName: 'Updated At',
            width: 180,
            sortable: true,
            valueFormatter: (params) => new Date(params.value).toLocaleString(),
            valueGetter: (params) => params.row?.updatedAt || '',
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
                            handleDeleteSingleSurvey(params.row.id);
                        }}
                    >
                        <DeleteOutlined color="secondary" />
                    </IconButton>
                </strong>
            ),
        },
    ];

    // 修改 handleDownloadAttachments 函数为 handleDownloadAttachment
    const handleDownloadAttachment = async (attachment) => {
        try {
            console.log('Downloading attachment:', attachment);
            const response = await fetch(config[config.env].baseURL + attachment.content, {
                method: 'GET',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', attachment.filename || `attachment`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download attachment:', error);
            toast.error(`Failed to download attachment: ${attachment.filename}`);
        }
    };

    // Handle single survey deletion
    const handleDeleteSingleSurvey = async (id) => {
        const result = await Swal.fire({
            title: 'Confirm Deletion',
            text: 'Are you sure you want to delete this survey?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) {
            return;
        }

        setDeletingSurveys(true);

        try {
            await deleteSurveys([id]);
            toast.success('Survey deleted successfully');
            await loadData();
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } catch (error) {
            console.error('Error deleting survey:', error);
            toast.error('Failed to delete survey');
        } finally {
            setDeletingSurveys(false);
        }
    };

    // Details Dialog (Optional, implement as needed)
    const handleOpenDetailsDialog = (survey) => {
        // Implement survey details dialog logic here
        // For example, set a state with survey details and open a new Dialog component
    };

    // Add Survey Dialog Component with Attachment Upload Capability
    const AddSurveyDialog = ({ open, handleClose, loadData }) => {
        // Move file upload states into the dialog
        const [selectedFiles, setSelectedFiles] = React.useState([]);
        const [uploadPercentage, setUploadPercentage] = React.useState(null);
        const [processingSurvey, setProcessingSurvey] = React.useState(false);

        // Using react-dropzone for file drag-and-drop upload
        const { getRootProps, getInputProps } = useDropzone({
            onDrop: (acceptedFiles) => {
                setSelectedFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
            },
            maxFiles: 10,
            minSize: 1,
            multiple: true,
        });

        const removeFile = (file) => () => {
            setSelectedFiles(prevFiles => prevFiles.filter(f => f !== file));
        };

        const removeAllFiles = () => {
            setSelectedFiles([]);
        };

        return (
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="sm"
                aria-labelledby="add-survey-dialog-title"
            >
                <DialogTitle id="add-survey-dialog-title">
                    Add Survey
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
                            title: '',
                            name: '',
                            content: '',
                            description: '',
                            revision: 1,
                        }}
                        validationSchema={Yup.object().shape({
                            title: Yup.string().required('Subject is required'),
                            name: Yup.string().required('Name is required'),
                            content: Yup.string().required('Content is required'),
                            revision: Yup.number().integer().min(1).required('Revision is required'),
                        })}
                        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                            try {
                                const formData = new FormData();
                                formData.append('title', values.title);
                                formData.append('name', values.name);
                                formData.append('content', values.content);
                                formData.append('description', values.description);
                                formData.append('revision', values.revision);
                        
                                selectedFiles.forEach((file) => {
                                    formData.append('file', file);
                                });
                        
                                await addSurvey(formData);
                                setStatus({ success: true });
                                setSubmitting(false);
                                handleClose();
                                loadData();
                                toast.success('Survey added successfully!');
                            } catch (error) {
                                console.error(error);
                                setStatus({ success: false });
                                setErrors({ submit: error.message });
                                setSubmitting(false);
                                toast.error('Failed to add survey');
                            }
                        }}                        
                    >
                        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                            <form onSubmit={handleSubmit}>
                                <MuiGrid container spacing={2}>
                                    <MuiGrid item xs={12}>
                                        <FormControl fullWidth className={classes.input}>
                                            <InputLabel htmlFor="name">Name</InputLabel>
                                            <OutlinedInput
                                                id="name"
                                                type="text"
                                                value={values.name}
                                                name="name"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Name"
                                            />
                                            {errors.name && (
                                                <FormHelperText error>{errors.name}</FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl fullWidth className={classes.input}>
                                            <InputLabel htmlFor="title">Subject</InputLabel>
                                            <OutlinedInput
                                                id="title"
                                                type="text"
                                                value={values.title}
                                                name="title"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Subject"
                                            />
                                            {errors.title && (
                                                <FormHelperText error>{errors.title}</FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl fullWidth className={classes.input}>
                                            <TextField
                                                id="content"
                                                label="Content"
                                                multiline
                                                rows={5}
                                                value={values.content}
                                                name="content"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                InputLabelProps={{
                                                    classes: {
                                                        shrink: classes.shrinkLabel
                                                    }
                                                }}
                                            />
                                            {errors.content && (
                                                <FormHelperText error>{errors.content}</FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl fullWidth className={classes.input}>
                                            <TextField
                                                id="description"
                                                label="Description"
                                                multiline
                                                rows={2}
                                                value={values.description}
                                                name="description"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                InputLabelProps={{
                                                    classes: {
                                                        shrink: classes.shrinkLabel
                                                    }
                                                }}
                                            />
                                            {errors.description && (
                                                <FormHelperText error>{errors.description}</FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl fullWidth className={classes.input}>
                                            <InputLabel htmlFor="revision">Revision</InputLabel>
                                            <OutlinedInput
                                                id="revision"
                                                type="number"
                                                value={values.revision}
                                                name="revision"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Revision"
                                                inputProps={{ min: 1 }}
                                            />
                                            {errors.revision && (
                                                <FormHelperText error>{errors.revision}</FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                </MuiGrid>

                                {/* Attachment Upload Section */}
                                <section className="container">
                                    <div {...getRootProps({ className: 'dropzone' })} style={{
                                        border: '2px dashed #cccccc',
                                        padding: '20px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        marginTop: '20px',
                                        borderRadius: '5px',
                                        backgroundColor: '#fafafa',
                                    }}>
                                        <input {...getInputProps()} />
                                        <FileUploadIcon style={{ fontSize: '48px', color: '#aaaaaa' }} />
                                        <p>Drag and drop files here, or click to select files (PDF, DOCX, XLSX, TXT)</p>
                                    </div>
                                    {!!selectedFiles.length && (
                                        <aside style={{ marginTop: '20px' }}>
                                            <Typography variant="h6">Selected Files</Typography>
                                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                                {selectedFiles.map((file) => (
                                                    <li key={file.path} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                        <Typography variant="body2">{file.path} - {(file.size / 1024).toFixed(2)} KB</Typography>
                                                        <IconButton onClick={removeFile(file)} style={{ marginLeft: '10px' }}>
                                                            <ClearIcon />
                                                        </IconButton>
                                                    </li>
                                                ))}
                                            </ul>
                                            {selectedFiles.length > 1 && (
                                                <Button variant="outlined" color="secondary" onClick={removeAllFiles}>
                                                    Remove All
                                                </Button>
                                            )}
                                        </aside>
                                    )}
                                </section>

                                {/* Submit Button */}
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

    const AttachmentsDialog = ({ open, handleClose, attachments, handleDownloadAttachment }) => {
        const [selectedDocument, setSelectedDocument] = React.useState(null);
        const [numPages, setNumPages] = React.useState(null);
        const [previewingFileType, setPreviewingFileType] = React.useState('');
    
        const handleDocumentClick = (attachment) => {
            setSelectedDocument(attachment);
            const fileExtension = attachment.filename.split('.').pop().toLowerCase();
            setPreviewingFileType(fileExtension);
        };
    
        const handleDocumentClose = () => {
            setSelectedDocument(null);
            setPreviewingFileType('');
        };
    
        return (
            <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
                <DialogTitle>
                    Attachments
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        style={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers style={{ display: 'flex', height: '600px' }}>
                    {/* 附件列表 */}
                    <div style={{ flex: 1, overflowY: 'auto', borderRight: `1px solid #ddd`, paddingRight: '10px' }}>
                        <Typography variant="h6">Attachments List</Typography>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {attachments.map((attachment, index) => (
                                <li key={index} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleDocumentClick(attachment)}
                                        style={{ flexGrow: 1, textTransform: 'none' }}
                                    >
                                        {attachment.filename}
                                    </Button>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleDownloadAttachment(attachment)}
                                        title="Download Attachment"
                                    >
                                        <DownloadOutlined />
                                    </IconButton>
                                </li>
                            ))}
                        </ul>
                    </div>
    
                    {/* 文件预览区域 */}
                    <div style={{ flex: 2, paddingLeft: '10px', position: 'relative' }}>
                        {selectedDocument ? (
                            <>
                                <IconButton
                                    aria-label="close"
                                    onClick={handleDocumentClose}
                                    style={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
                                >
                                    <CloseIcon />
                                </IconButton>
                                <div style={{ height: '100%', overflowY: 'auto' }}>
                                    {previewingFileType === 'pdf' ? (
                                        <Document
                                            file={config[config.env].baseURL + selectedDocument.content}
                                            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                            loading={<LoaderInnerCircular />}
                                        >
                                            {Array.from(new Array(numPages), (el, index) => (
                                                <Page key={`page_${index + 1}`} pageNumber={index + 1} width={600} />
                                            ))}
                                        </Document>
                                    ) : previewingFileType === 'txt' ? (
                                        <iframe
                                            src={config[config.env].baseURL + selectedDocument.content}
                                            style={{ width: '100%', height: '100%', border: 'none' }}
                                            title="Text Document Preview"
                                        />
                                    ) : previewingFileType === 'xlsx' || previewingFileType === 'docx' ? (
                                        <Typography variant="body1">
                                            {`Cannot preview ${previewingFileType.toUpperCase()} files. Please download to view.`}
                                        </Typography>
                                    ) : (
                                        <Typography variant="body1">Unsupported file type for preview.</Typography>
                                    )}
                                </div>
                            </>
                        ) : (
                            <Typography variant="h6" color="textSecondary">
                                Select an attachment to preview
                            </Typography>
                        )}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    const handleCellEditCommit = React.useCallback(
        async (params) => {
            const { id, field, value } = params;
            // 更新Survey
            try {
                setLoadingUpdate(true);
                await updateSurvey(id, { [field]: value });
                setSurveys((prevSurveys) =>
                    prevSurveys.map((survey) =>
                        survey.id === id 
                            ? { ...survey, [field]: value } 
                            : survey
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
        }, [] 
    );

    return (
        <MainCard title="Surveys" boxShadow shadow={theme.shadows[2]}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    style={{ top: -70 }} // 调整按钮位置, 使其与表格对齐, 70-31=39
                    onClick={handleOpenDialog}
                    startIcon={<ImportContactsOutlined />}
                >
                    Add Survey
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    style={{ top: -70, marginLeft: '10px' }}
                    startIcon={<FileUploadIcon />}
                    component="label"
                >
                    Batch Import Surveys from Excel
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
                    onClick={handleDeleteSurveys}
                    disabled={deletingSurveys || selectedIds.length === 0}
                >
                    {deletingSurveys ? 'Deleting...' : 'Delete Surveys'}
                </Button>
            </div>
            <div style={{ width: '100%', marginTop: -31 }}>
                <DataGrid
                    rows={surveys}
                    columns={columns}
                    pageSize={10}
                    checkboxSelection={false}
                    autoHeight
                    autoPageSize
                    density={'standard'}
                    disableSelectionOnClick
                    loading={isLoading || loadingUpdate}
                    components={{
                        Toolbar: GridToolbar,
                    }}
                    onCellEditCommit={handleCellEditCommit}
                    onFilterModelChange={(model) => {
                        const filter = model.items.map((item) => {
                            return [item.columnField, item.operatorValue, item.value];
                        });
                        const filterIds = surveys
                            .filter((survey) => {
                                return filter.every(([field, operator, value]) => {
                                    const cellValue = survey[field];
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
                            })
                            .map((survey) => survey.id);
                        setFilterIds(filterIds);
                    }}
                />
            </div>
            <AddSurveyDialog open={openDialog} handleClose={handleCloseDialog} loadData={loadData} />
            <AttachmentsDialog
                open={openAttachmentsDialog}
                handleClose={handleCloseAttachmentsDialog}
                attachments={currentAttachments}
                handleDownloadAttachment={handleDownloadAttachment}
            />
        </MainCard>
    );
};

// Function to map Redux state to component props
const mapStateToProps = (state) => ({
    user: state.authReducer.user,
});

export default connect(mapStateToProps, null)(SurveysComponent);
