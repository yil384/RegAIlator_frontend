import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import config from '../../configs';

import MainCard from '../../ui-component/cards/MainCard';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { DataGrid } from '@material-ui/data-grid';
import { CustomToolbar } from '../../ui-component/CustomNoRowOverlay';
import { useTheme } from '@material-ui/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { fetchSurveys, addSurvey, deleteSurveys, updateSurvey, addSurveyAttachment } from './helper';
import { CustomLoadingOverlay, CustomNoRowsOverlay } from '../../ui-component/CustomNoRowOverlay';
import Typography from '@material-ui/core/Typography';
import { DeleteOutlined, DownloadOutlined, ImportContactsOutlined, FileUpload as FileUploadIcon } from '@material-ui/icons';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';

import Checkbox from '@material-ui/core/Checkbox';

import * as XLSX from 'xlsx';
import { useStyles } from './styles';
import AnimateButton from '../../ui-component/extended/AnimateButton';
import useScriptRef from '../../hooks/useScriptRef';
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

import { useDropzone } from 'react-dropzone';
import ClearIcon from '@material-ui/icons/Clear';
import LinearProgressBar from '../../ui-component/LinearProgress';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

import EmailEditor from 'react-email-editor'; // Import EmailEditor
import nullTemplate from './null.json'; // Import nullTemplate

// Set PDF Worker
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

    // State for Attachments Dialog
    const [openAttachmentsDialog, setOpenAttachmentsDialog] = React.useState(false);
    const [currentAttachments, setCurrentAttachments] = React.useState([]);
    const [currentSurveyId, setCurrentSurveyId] = React.useState(null); // Added state for current survey ID

    const loadData = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetchSurveys();
            const surveysData = response.map((survey, index) => ({
                ...survey,
                id: survey._id || index + 1, // Ensure each survey has a unique 'id'
            }));
            setSurveys(surveysData);
            setFilterIds(surveysData.map((survey) => survey.id));
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

    // 新增 useEffect，监听 surveys 的变化，并更新 currentAttachments
    React.useEffect(() => {
        if (openAttachmentsDialog && currentSurveyId) {
            const updatedSurvey = surveys.find(survey => survey.id === currentSurveyId);
            if (updatedSurvey) {
                setCurrentAttachments(updatedSurvey.attachments || []);
            }
        }
    }, [surveys, openAttachmentsDialog, currentSurveyId]);

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
        const allRowIds = filterIds.length > 0 ? filterIds : surveys.map((survey) => survey.id);
        if (allRowIds.every((id) => selectedIds.includes(id))) {
            setSelectedIds(selectedIds.filter((id) => !allRowIds.includes(id)));
        } else {
            setSelectedIds([...new Set([...selectedIds, ...allRowIds])]);
        }
    };

    // Open Attachments Dialog and set current survey ID and attachments
    const handleOpenAttachmentsDialog = (id, attachments) => {
        setCurrentSurveyId(id);
        setCurrentAttachments(attachments);
        setOpenAttachmentsDialog(true);
    };

    // Close Attachments Dialog and clear current attachments and survey ID
    const handleCloseAttachmentsDialog = () => {
        setOpenAttachmentsDialog(false);
        setCurrentAttachments([]);
        setCurrentSurveyId(null);
    };

    // Define columns including attachments column
    const columns = [
        // Selection Checkbox Column
        {
            field: 'select',
            headerName: (
                <Checkbox
                    checked={filterIds.length > 0 && filterIds.every((id) => selectedIds.includes(id))}
                    indeterminate={
                        filterIds.length > 0 &&
                        filterIds.some((id) => selectedIds.includes(id)) &&
                        !filterIds.every((id) => selectedIds.includes(id))
                    }
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
                            {isSelected ? <CheckCircleIcon style={{ color: 'green' }} /> : <RadioButtonUncheckedIcon />}
                        </IconButton>
                    </div>
                );
            }
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
            )
        },
        // Email Template Column (New)
        {
            field: 'emailTemplate',
            headerName: 'Email Template',
            width: 200,
            sortable: false,
            editable: false,
            valueGetter: (params) => params.row?.emailTemplate || '',
            renderCell: (params) => (
                <Tooltip title="View Email Template" arrow>
                    <Button variant="outlined" color="primary" onClick={() => handleOpenEmailTemplatePreview(params.row.json, params.row.id)}>
                        View Template
                    </Button>
                </Tooltip>
            )
        },
        // Attachments Column
        {
            field: 'attachments',
            headerName: 'Attachments',
            width: 200,
            sortable: false,
            valueGetter: (params) =>
                params.row?.attachments && params.row.attachments.length > 0
                    ? 'Attachments (' + params.row.attachments.length + ')'
                    : 'No Attachments',
            renderCell: (params) => {
                const attachments = params.row.attachments || [];
                const count = attachments.length;
                return count > 0 ? (
                    <Button variant="outlined" color="primary" onClick={() => handleOpenAttachmentsDialog(params.row.id, attachments)}>
                        Attachments ({count})
                    </Button>
                ) : (
                    <Button variant="outlined" color="secondary" onClick={() => handleOpenAttachmentsDialog(params.row.id, attachments)}>
                        No Attachments
                    </Button>
                );
            }
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
            )
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
            )
        },
        // Updated At Column
        {
            field: 'updatedAt',
            headerName: 'Updated At',
            width: 180,
            sortable: true,
            valueFormatter: (params) => new Date(params.value).toLocaleString(),
            valueGetter: (params) => params.row?.updatedAt || '',
            renderCell: (params) => (
                <Tooltip title={new Date(params.row?.updatedAt).toLocaleString()} arrow>
                    <Typography variant="body2" noWrap>
                        {new Date(params.row?.updatedAt).toLocaleString()}
                    </Typography>
                </Tooltip>
            )
        },
        // Actions Column
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <strong>
                    {/* <Button
                        variant='contained'
                        color='primary'
                        size='small'
                        startIcon={<ImportContactsOutlined />}
                        style={{ marginRight: 16 }}
                        onClick={() => handleOpenDetailsDialog(params.row)}
                    >
                        Details
                    </Button> */}
                    <IconButton
                        onClick={(event) => {
                            event.stopPropagation(); // Prevent event bubbling
                            handleDeleteSingleSurvey(params.row.id);
                        }}
                    >
                        <DeleteOutlined color="secondary" />
                    </IconButton>
                </strong>
            )
        }
    ];

    const [openEmailTemplateDialog, setOpenEmailTemplateDialog] = React.useState(false);
    const [emailTemplate, setEmailTemplate] = React.useState(null);
    const [emailTemplateSurveyId, setEmailTemplateSurveyId] = React.useState(null);
    // Function to handle previewing the email template
    const handleOpenEmailTemplatePreview = (emailTemplate, surveyId) => {
        setEmailTemplateSurveyId(surveyId);
        setEmailTemplate(emailTemplate);
        setOpenEmailTemplateDialog(true);
    };
    const handleCloseEmailTemplateDialog = () => {
        setOpenEmailTemplateDialog(false);
        setEmailTemplate(null);
        setEmailTemplateSurveyId(null);
    };

    const EmailTemplateDialog = ({ open, handleClose, emailTemplate, surveyId }) => {
        const emailEditorRef = useRef(null);
        const [sampleTemplate, setSampleTemplate] = React.useState(emailTemplate);

        const exportJson = () => {
            return new Promise((resolve, reject) => {
                if (emailEditorRef.current) {
                    emailEditorRef.current.editor.saveDesign((data) => {
                        resolve(data);
                    });
                } else {
                    reject(new Error('Email editor not initialized'));
                }
            });
        };

        const onLoad = (unlayer) => {
            unlayer.loadDesign(JSON.parse(emailTemplate));
        };

        return (
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
                <DialogTitle id="add-survey-dialog-title">
                    Email Template Preview
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        style={{ position: 'absolute', right: theme.spacing(1), top: theme.spacing(1) }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <MuiGrid container spacing={2}>
                        <MuiGrid item xs={12} sm={6}>
                            <FormControl fullWidth className={classes.input} style={{ height: '60%' }}>
                                <Select
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: '100%'
                                    }}
                                    value={sampleTemplate}
                                    onChange={(e) => {
                                        // 解析 JSON 字符串并加载到 EmailEditor
                                        emailEditorRef.current.editor.loadDesign(JSON.parse(e.target.value));
                                        setSampleTemplate(e.target.value);
                                    }}
                                    displayEmpty
                                    color="primary"
                                    size="large"
                                >
                                    <MenuItem value={null} disabled>
                                        Load from another Survey
                                    </MenuItem>
                                    {surveys.map((survey) => (
                                        <MenuItem key={survey.id} value={survey.json}>
                                            {survey.title}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </MuiGrid>
                        <MuiGrid item xs={12} sm={2}>
                            <FormControl fullWidth className={classes.input} style={{ height: '60%' }}>
                                <Button
                                    style={{ height: '100%' }}
                                    variant="contained"
                                    color="primary"
                                    onClick={() => {
                                        // Reset the Email Editor
                                        emailEditorRef.current.editor.loadDesign(JSON.parse(emailTemplate));
                                        setSampleTemplate(emailTemplate);
                                    }}
                                >
                                    Reset
                                </Button>
                            </FormControl>
                        </MuiGrid>
                        <MuiGrid item xs={12} sm={4}>
                            <FormControl fullWidth className={classes.input} style={{ height: '60%' }}>
                                <Button
                                    style={{ height: '100%' }}
                                    variant="contained"
                                    color="secondary"
                                    onClick={async () => {
                                        const json = await exportJson();
                                        const formData = new FormData();
                                        formData.append('json', JSON.stringify(json));
                                        await updateSurvey(surveyId, formData);
                                        handleClose();
                                        toast.success('Survey updated successfully');
                                        loadData();
                                    }}
                                >
                                    Update Email Template
                                </Button>
                            </FormControl>
                        </MuiGrid>
                        <MuiGrid item xs={12}>
                            {/* <Typography variant="h6">Email Template</Typography> */}
                            <div style={{ border: '1px solid #ccc', minHeight: '300px', marginTop: "-2%" }}>
                                <EmailEditor ref={emailEditorRef} onLoad={onLoad} />
                            </div>
                        </MuiGrid>
                    </MuiGrid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    // Modify handleDownloadAttachments to handle individual attachment download
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

    // Add Survey Dialog Component with Attachment Upload Capability and Email Editor
    const AddSurveyDialog = ({ open, handleClose, loadData }) => {
        const emailEditorRef = useRef(null);
        const [selectedFiles, setSelectedFiles] = React.useState([]);
        const [sampleTemplate, setSampleTemplate] = React.useState(null);

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

        // Function to export the email template from the editor
        const exportHtml = () => {
            return new Promise((resolve, reject) => {
                if (emailEditorRef.current) {
                    emailEditorRef.current.editor.exportHtml((data) => {
                        resolve(data);
                    });
                } else {
                    reject(new Error('Email editor not initialized'));
                }
            });
        };
        const exportJson = () => {
            return new Promise((resolve, reject) => {
                if (emailEditorRef.current) {
                    emailEditorRef.current.editor.saveDesign((data) => {
                        resolve(data);
                    });
                } else {
                    reject(new Error('Email editor not initialized'));
                }
            });
        };

        const onLoad = (unlayer) => {
            unlayer.loadDesign(nullTemplate);
        };

        return (
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="xl" // Increased width to accommodate EmailEditor
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
                            revision: 1
                        }}
                        validationSchema={Yup.object().shape({
                            title: Yup.string().required('Subject is required'),
                            revision: Yup.number().integer().min(1).required('Revision is required')
                        })}
                        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                            try {
                                // Export the email template
                                const emailTemplateHtml = await exportHtml();
                                const emailTemplateJson = await exportJson();

                                const formData = new FormData();
                                formData.append('title', values.title);
                                formData.append('revision', values.revision);
                                formData.append('html', emailTemplateHtml.html);
                                formData.append('json', JSON.stringify(emailTemplateJson));

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
                                    <MuiGrid item xs={12} sm={6}>
                                        <FormControl fullWidth className={classes.input}>
                                            <InputLabel htmlFor="title">Survey Subject</InputLabel>
                                            <OutlinedInput
                                                id="title"
                                                type="text"
                                                value={values.title}
                                                name="title"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Subject"
                                            />
                                            {errors.title && <FormHelperText error>{errors.title}</FormHelperText>}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12} sm={1}>
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
                                            {errors.revision && <FormHelperText error>{errors.revision}</FormHelperText>}
                                        </FormControl>
                                    </MuiGrid>
                                    {/* Load from another Survey */}
                                    <MuiGrid item xs={12} sm={4}>
                                        <FormControl fullWidth className={classes.input} style={{ height: '80%' }}>
                                            <Select
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    height: '100%',
                                                }}
                                                value={sampleTemplate}
                                                onChange={(e) => {
                                                    // 解析 JSON 字符串并加载到 EmailEditor
                                                    emailEditorRef.current.editor.loadDesign(JSON.parse(e.target.value));
                                                    setSampleTemplate(e.target.value);
                                                }}
                                                displayEmpty
                                                color="primary"
                                                size="large"
                                            >
                                                <MenuItem value={null} disabled>
                                                    Load from another Survey
                                                </MenuItem>
                                                {surveys.map((survey) => (
                                                    <MenuItem key={survey.id} value={survey.json}>
                                                        {survey.title}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12} sm={1}>
                                        <FormControl fullWidth className={classes.input} style={{ height: '80%' }}>
                                            <Button
                                                style={{ height: '100%' }}
                                                variant="contained"
                                                color="primary"
                                                onClick={() => {
                                                    // Reset the Email Editor
                                                    emailEditorRef.current.editor.loadDesign(nullTemplate);
                                                    setSampleTemplate(null);
                                                }}
                                            >
                                                Reset
                                            </Button>
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        {/* <Typography variant="h6">Email Template</Typography> */}
                                        <div style={{ border: '1px solid #ccc', minHeight: '300px' }}>
                                            <EmailEditor ref={emailEditorRef} onLoad={onLoad} />
                                        </div>
                                    </MuiGrid>
                                </MuiGrid>

                                {/* Attachment Upload Section */}
                                <section className="container">
                                    <div
                                        {...getRootProps({ className: 'dropzone' })}
                                        style={{
                                            border: '2px dashed #cccccc',
                                            padding: '20px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            marginTop: '20px',
                                            borderRadius: '5px',
                                            backgroundColor: '#fafafa'
                                        }}
                                    >
                                        <input {...getInputProps()} />
                                        <FileUploadIcon style={{ fontSize: '48px', color: '#aaaaaa' }} />
                                        <p>Drag and drop files here, or click to select files (PDF, DOCX, XLSX, TXT, Images)</p>
                                    </div>
                                    {!!selectedFiles.length && (
                                        <aside style={{ marginTop: '20px' }}>
                                            <Typography variant="h6">Selected Files</Typography>
                                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                                {selectedFiles.map((file) => (
                                                    <li
                                                        key={file.path}
                                                        style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}
                                                    >
                                                        <Typography variant="body2">
                                                            {file.path} - {(file.size / 1024).toFixed(2)} KB
                                                        </Typography>
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

    // Updated Attachments Dialog Component with Add/Delete Functionality
    const AttachmentsDialog = ({ open, handleClose, surveyId, attachments, handleDownloadAttachment, loadData }) => {
        const theme = useTheme();
        const classes = useStyles();

        const [selectedDocument, setSelectedDocument] = React.useState(null);
        const [numPages, setNumPages] = React.useState(null);
        const [previewingFileType, setPreviewingFileType] = React.useState('');
        const [selectedFiles, setSelectedFiles] = React.useState([]);
        const [isUploading, setIsUploading] = React.useState(false);
        const [isDeleting, setIsDeleting] = React.useState(false);

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

        const handleDocumentClick = (attachment) => {
            setSelectedDocument(attachment);
            const fileExtension = attachment.filename.split('.').pop().toLowerCase();
            setPreviewingFileType(fileExtension);
        };

        const handleDocumentClose = () => {
            setSelectedDocument(null);
            setPreviewingFileType('');
        };

        // Handle deleting an attachment
        const handleDeleteAttachment = async (attachmentId) => {
            setIsDeleting(true);
            
            try {
                // Assuming updateSurvey can handle removing an attachment by its ID
                const updatedAttachments = attachments.filter(att => att._id !== attachmentId);
                await updateSurvey(surveyId, { attachments: updatedAttachments });
                toast.success('Attachment deleted successfully');
                loadData();
            } catch (error) {
                console.error('Failed to delete attachment:', error);
                toast.error('Failed to delete attachment');
            } finally {
                setIsDeleting(false);
            }
        };

        // Handle adding new attachments
        const handleAddAttachments = async () => {
            if (selectedFiles.length === 0) {
                toast.error('No files selected for upload');
                return;
            }

            setIsUploading(true);

            try {
                const formData = new FormData();
                selectedFiles.forEach((file) => {
                    formData.append('file', file);
                });

                // Assuming addSurveyAttachment handles adding attachments via FormData
                await addSurveyAttachment(surveyId, formData);
                toast.success('Attachments added successfully');
                setSelectedFiles([]);
                loadData();
            } catch (error) {
                console.error('Failed to upload attachments:', error);
                toast.error('Failed to upload attachments');
            } finally {
                setIsUploading(false);
            }
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
                    {/* Attachments List */}
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
                                    <IconButton
                                        color="secondary"
                                        onClick={() => handleDeleteAttachment(attachment._id)}
                                        title="Delete Attachment"
                                        disabled={isDeleting}
                                    >
                                        <DeleteOutlined />
                                    </IconButton>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* File Preview Area */}
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
                <DialogContent dividers>
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
                            <p>Drag and drop files here, or click to select files (PDF, DOCX, XLSX, TXT, Images)</p>
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
                                <div style={{ marginTop: '10px' }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleAddAttachments}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? 'Uploading...' : 'Upload Attachments'}
                                    </Button>
                                </div>
                            </aside>
                        )}
                    </section>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    // Updated Attachments Dialog Component with Add/Delete Functionality
    // ... (AttachmentsDialog remains unchanged)

    const handleCellEditCommit = React.useCallback(
        async (params) => {
            const { id, field, value } = params;
            // 如果没有变化，不执行任何操作
            if (surveys.find((survey) => survey.id === id)[field] === value) {
                return;
            }
            // Update Survey
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
            console.log(`Row with id ${id} updated. Field: ${field}, New Value: ${value}`);
        }, [surveys] 
    );

    return (
        <MainCard title="Surveys" boxShadow shadow={theme.shadows[2]}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    style={{ top: -70 }} // Adjust button position to align with the table
                    onClick={handleOpenDialog}
                    startIcon={<ImportContactsOutlined />}
                >
                    Add Survey
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
                        Toolbar: () => <CustomToolbar title={"Surveys"} length={surveys.length} />,
                        LoadingOverlay: CustomLoadingOverlay,
                        NoRowsOverlay: CustomNoRowsOverlay,
                    }}
                    onCellEditCommit={handleCellEditCommit}
                    onFilterModelChange={(model) => {
                        const filter = model.items.map((item) => {
                            return [item.columnField, item.operatorValue, item.value];
                        });
                        const filterIds = surveys
                            .filter((survey) => {
                                return filter.every(([field, operator, value]) => {
                                    // [TODO] [FIXME] 特殊处理 Attachments 列
                                    // const cellValue = survey[field];
                                    const cellValue = field === 'attachments' 
                                                        ? survey.attachments.length===0?'No Attachments':`Attachments (${survey.attachments.length})` 
                                                        : survey[field];
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
            <EmailTemplateDialog open={openEmailTemplateDialog} handleClose={handleCloseEmailTemplateDialog} emailTemplate={emailTemplate} surveyId={emailTemplateSurveyId} />
            <AttachmentsDialog
                open={openAttachmentsDialog}
                handleClose={handleCloseAttachmentsDialog}
                surveyId={currentSurveyId}
                attachments={currentAttachments}
                handleDownloadAttachment={handleDownloadAttachment}
                loadData={loadData}
            />
        </MainCard>
    );
};

// Function to map Redux state to component props
const mapStateToProps = (state) => ({
    user: state.authReducer.user,
});

export default connect(mapStateToProps, null)(SurveysComponent);
