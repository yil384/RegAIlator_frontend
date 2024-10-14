import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { DataGrid, GridToolbar } from '@material-ui/data-grid';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { CustomLoadingOverlay, CustomNoRowsOverlay } from '../../ui-component/CustomNoRowOverlay';

import MainCard from '../../ui-component/cards/MainCard';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
// import { addSurveyTemplate, updateSurveyTemplate, getSurveyTemplateById } from './surveyHelper'; // helper functions for API calls
import Typography from '@material-ui/core/Typography';

const AddSurveyTemplate = ({ user }) => {
    const history = useHistory();
    const { templateId } = useParams(); // Get the templateId from the route if we are editing
    const [name, setName] = useState('');
    const [initialContent, setInitialContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const columns = [
        {
            field: 'id', width: 200, headerName: 'ID', hide: false
        },
        {
            field: 'name',
            headerName: 'Survey Template Name',
            width: 270,
            editable: false,
            resizable: false,
            disableClickEventBubbling: true
        },
    ];

    const [students, setStudents] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const loadData = React.useCallback(async () => {
        try {
            await setIsLoading(true);
            // const response = await fetchSu({
            //     deepPopulate: 'userId'
            // });
            // setStudents(response?.results || []);
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
        }
    });

    React.useEffect(() => {
        loadData();
    }, []);

    // Load existing survey template if templateId is present (for editing)
    useEffect(() => {
        if (templateId) {
            setIsEditing(true);
            const loadTemplate = async () => {
                try {
                    const response = await getSurveyTemplateById(templateId);
                    if (response) {
                        setName(response.name);
                        setInitialContent(response.initialContent);
                    }
                } catch (error) {
                    toast.error('Failed to load the survey template');
                }
            };
            loadTemplate();
        }
    }, [templateId]);

    const handleSave = async () => {
        if (!name || !initialContent) {
            toast.error('Name and Initial Content are required');
            return;
        }

        const templateData = {
            name,
            initialContent
        };

        try {
            if (isEditing) {
                await updateSurveyTemplate(templateId, templateData); // Update existing template
                toast.success('Survey Template updated successfully');
            } else {
                await addSurveyTemplate(templateData); // Add new template
                toast.success('Survey Template added successfully');
            }
            history.push('/survey-templates'); // Redirect to the survey templates list after saving
        } catch (error) {
            toast.error('Failed to save the survey template');
        }
    };

    return (
        <MainCard title={'Survey Templates'}>
            <DataGrid
                rows={[]}
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
            />

            <Typography variant="h6" gutterBottom>
                {isEditing ? 'Edit the Survey Template details below' : 'Fill in the details to create a new Survey Template'}
            </Typography>

            <TextField
                label="Survey Template Name"
                variant="outlined"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                margin="normal"
            />

            <TextField
                label="Initial Content"
                variant="outlined"
                fullWidth
                multiline
                rows={6}
                value={initialContent}
                onChange={(e) => setInitialContent(e.target.value)}
                margin="normal"
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                >
                    {isEditing ? 'Update Template' : 'Add Template'}
                </Button>
            </div>
        </MainCard>
    );
};

// Helper functions for API calls
const addSurveyTemplate = async (templateData) => {
    // Call your backend API to add the survey template
    // Example:
    // return await axios.post('/api/survey-templates', templateData);
};

const updateSurveyTemplate = async (templateId, templateData) => {
    // Call your backend API to update the survey template
    // Example:
    // return await axios.put(`/api/survey-templates/${templateId}`, templateData);
};

const getSurveyTemplateById = async (templateId) => {
    // Call your backend API to fetch the survey template by ID
    // Example:
    // return await axios.get(`/api/survey-templates/${templateId}`);
};

export default connect(null, null)(AddSurveyTemplate);
