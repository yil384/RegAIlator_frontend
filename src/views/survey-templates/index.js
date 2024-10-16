import React from 'react';
import { connect } from 'react-redux';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

import MainCard from '../../ui-component/cards/MainCard';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { DataGrid, GridToolbar } from '@material-ui/data-grid';
import { useTheme } from '@material-ui/styles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip'; // 导入 Tooltip 组件

import { fetchSurveys, addSurvey } from './helper'; // 根据路径进行调整
import { CustomLoadingOverlay, CustomNoRowsOverlay } from '../../ui-component/CustomNoRowOverlay';
import Typography from '@material-ui/core/Typography';
import { DownloadOutlined, ImportContactsOutlined, ImportExportOutlined, NotificationsActive } from '@material-ui/icons';
import EmailListener from '../../utils/emailListener';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import Checkbox from '@material-ui/core/Checkbox';

import { mentionUsers } from '../../views/authentication/session/auth.helper';
import * as XLSX from 'xlsx';  // 导入 xlsx 库

import { useStyles } from './styles'; // 创建一个 styles 文件，或者根据需要调整样式
import AnimateButton from '../../ui-component/extended/AnimateButton';
import useScriptRef from '../../hooks/useScriptRef';
import { Dialog, DialogContent, DialogTitle, FormControl, FormHelperText, Grid as MuiGrid, InputLabel, OutlinedInput, TextField } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { Formik } from 'formik';
import * as Yup from 'yup';
import LoaderInnerCircular from '../../ui-component/LoaderInnerCircular';

const SurveysComponent = ({ user }) => {
    const theme = useTheme();

    const [surveys, setSurveys] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [selectedIds, setSelectedIds] = React.useState([]);
    const [filterIds, setFilterIds] = React.useState([]);
    const [openDialog, setOpenDialog] = React.useState(false);

    const classes = useStyles();
    const scriptedRef = useScriptRef();

    const loadData = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetchSurveys();
            const surveysData = response || [];

            surveysData.forEach((survey, index) => {
                if (!survey._id) survey.id = index + 1; // 确保每个调查都有一个 'id' 字段
                else survey.id = survey._id;
            });

            setSurveys(surveysData);
            setFilterIds(surveysData.map((survey) => survey.id));
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
            console.error('Failed to load surveys:', e);
        }
    }, []);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    // 处理打开和关闭弹出窗口
    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleAddSuccess = () => {
        loadData(); // 新增调查后重新加载数据
    };

    // 切换某一行的选中状态
    const handleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // 全选/取消全选功能
    const handleSelectAll = () => {
        const allRowIds = filterIds.map((id) => id);
        if (filterIds.every((id) => selectedIds.includes(id))) {
            setSelectedIds(selectedIds.filter((id) => !filterIds.includes(id)));
        } else {
            setSelectedIds([...new Set([...selectedIds, ...allRowIds])]);
        }
    };

    const columns = [
        // 选择框列
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
        // 标题列
        {
            field: 'title',
            headerName: 'Title',
            sortable: true,
            width: 200,
            renderCell: (params) => (
                <Tooltip title={params.row?.title || ''} arrow>
                    <Typography variant="body2" noWrap>
                        {params.row?.title}
                    </Typography>
                </Tooltip>
            ),
        },
        // 名称列
        {
            field: 'name',
            headerName: 'Name',
            sortable: true,
            width: 160,
            renderCell: (params) => (
                <Tooltip title={params.row?.name || ''} arrow>
                    <Typography variant="body2" noWrap>
                        {params.row?.name}
                    </Typography>
                </Tooltip>
            ),
        },
        // 内容列
        {
            field: 'content',
            headerName: 'Content',
            sortable: false,
            width: 300,
            renderCell: (params) => (
                <Tooltip title={params.row?.content || ''} arrow>
                    <Typography variant="body2" noWrap>
                        {params.row?.content}
                    </Typography>
                </Tooltip>
            ),
        },
        // 描述列
        {
            field: 'description',
            headerName: 'Description',
            sortable: false,
            width: 200,
            renderCell: (params) => (
                <Tooltip title={params.row?.description || ''} arrow>
                    <Typography variant="body2" noWrap>
                        {params.row?.description}
                    </Typography>
                </Tooltip>
            ),
        },
        // 附件列
        {
            field: 'attachment',
            headerName: 'Attachment',
            sortable: false,
            width: 200,
            renderCell: (params) => (
                <Tooltip title={params.row?.attachment || ''} arrow>
                    <Typography variant="body2" noWrap>
                        {params.row?.attachment}
                    </Typography>
                </Tooltip>
            ),
        },
        // 版本号列
        {
            field: 'revision',
            headerName: 'Revision',
            sortable: true,
            width: 120,
            renderCell: (params) => (
                <Tooltip title={params.row?.revision?.toString() || ''} arrow>
                    <Typography variant="body2" noWrap>
                        {params.row?.revision}
                    </Typography>
                </Tooltip>
            ),
        },
        // 创建时间列
        {
            field: 'createdAt',
            headerName: 'Created At',
            sortable: true,
            width: 180,
            valueFormatter: (params) => new Date(params.value).toLocaleString(),
            renderCell: (params) => (
                <Tooltip title={new Date(params.row?.createdAt).toLocaleString()} arrow>
                    <Typography variant="body2" noWrap>
                        {new Date(params.row?.createdAt).toLocaleString()}
                    </Typography>
                </Tooltip>
            ),
        },
        // 更新时间列
        {
            field: 'updatedAt',
            headerName: 'Updated At',
            sortable: true,
            width: 180,
            valueFormatter: (params) => new Date(params.value).toLocaleString(),
            renderCell: (params) => (
                <Tooltip title={new Date(params.row?.updatedAt).toLocaleString()} arrow>
                    <Typography variant="body2" noWrap>
                        {new Date(params.row?.updatedAt).toLocaleString()}
                    </Typography>
                </Tooltip>
            ),
        },
    ];

    // 处理 Excel 文件的上传
    const handleExcelUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0]; // 获取第一个工作表
            const worksheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            jsonData.forEach(row => {
                const email = row.email; // 读取邮箱
                if (email) {
                    mentionUsers({ email, mention: 'Hello' });
                }
            });

            toast.success('Successfully mentioned users from Excel!');
        };

        reader.readAsArrayBuffer(file);
    };

    // 添加调查弹出窗口组件
    const AddSurveyDialog = ({ open, handleClose }) => {
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
                            attachment: '',
                            revision: 1
                        }}
                        validationSchema={Yup.object().shape({
                            title: Yup.string().required('Title is required'),
                            name: Yup.string().required('Name is required'),
                            content: Yup.string().required('Content is required'),
                            description: Yup.string(),
                            attachment: Yup.string(),
                            revision: Yup.number().integer().min(1).required('Revision is required')
                        })}
                        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                            try {
                                if (scriptedRef.current) {
                                    await addSurvey(values);
                                    setStatus({ success: true });
                                    setSubmitting(false);
                                    handleClose(); // 成功后关闭对话框
                                    handleAddSuccess(); // 重新加载数据
                                    toast.success('Survey added successfully');
                                }
                            } catch (err) {
                                console.error(err);
                                if (scriptedRef.current) {
                                    setStatus({ success: false });
                                    setErrors({ submit: err.message });
                                    setSubmitting(false);
                                    toast.error('Failed to add survey');
                                }
                            }
                        }}
                    >
                        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                            <form onSubmit={handleSubmit}>
                                <MuiGrid container spacing={2}>
                                    <MuiGrid item xs={12}>
                                        <FormControl fullWidth className={classes.input}>
                                            <InputLabel htmlFor="title">Title</InputLabel>
                                            <OutlinedInput
                                                id="title"
                                                type="text"
                                                value={values.title}
                                                name="title"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Title"
                                            />
                                            {errors.title && (
                                                <FormHelperText error>{errors.title}</FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
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
                                            <TextField
                                                id="content"
                                                label="Content"
                                                multiline
                                                rows={4}
                                                value={values.content}
                                                name="content"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
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
                                            />
                                            {errors.description && (
                                                <FormHelperText error>{errors.description}</FormHelperText>
                                            )}
                                        </FormControl>
                                    </MuiGrid>
                                    <MuiGrid item xs={12}>
                                        <FormControl fullWidth className={classes.input}>
                                            <InputLabel htmlFor="attachment">Attachment</InputLabel>
                                            <OutlinedInput
                                                id="attachment"
                                                type="text"
                                                value={values.attachment}
                                                name="attachment"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Attachment"
                                            />
                                            {errors.attachment && (
                                                <FormHelperText error>{errors.attachment}</FormHelperText>
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
        <MainCard title='Surveys' boxShadow shadow={theme.shadows[2]}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    style={{ top: -70 }} // 调整按钮位置, 使其与表格对齐, 70-31=39
                    startIcon={<DownloadOutlined />}
                    component="label"
                    onClick={handleOpenDialog}
                >
                    Add Survey
                </Button>
                <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    style={{ top: -70, marginLeft: '10px' }}
                    startIcon={<DownloadOutlined />}
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
                    loading={isLoading}
                    components={{
                        Toolbar: GridToolbar,
                        // LoadingOverlay: CustomLoadingOverlay,
                        // NoRowsOverlay: CustomNoRowsOverlay,
                    }}
                    onFilterModelChange={(model) => {
                        const filter = model.items.map((item) => {
                            return [item.columnField, item.operatorValue, item.value];
                        });
                        const filterIds = surveys
                            .filter((survey) => {
                                return filter.every(([field, operator, value]) => {
                                    const cellValue = survey[field];
                                    if (operator === 'contains') {
                                        return cellValue?.toString().toLowerCase().includes(value.toLowerCase());
                                    }
                                    // 处理其他操作符，如 'equals'，'startsWith'，'endsWith' 等
                                    return true;
                                });
                            })
                            .map((survey) => survey.id);
                        setFilterIds(filterIds);
                    }}
                />
            </div>
            {/* <EmailListener /> */}
            <AddSurveyDialog open={openDialog} handleClose={handleCloseDialog} />
        </MainCard>
    );
};

const mapStateToProps = (state) => ({
    user: state.authReducer.user,
});

export default connect(mapStateToProps, null)(SurveysComponent);
