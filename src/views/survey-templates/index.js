import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Button, TextField } from '@material-ui/core';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import MainCard from '../../ui-component/cards/MainCard';
import Typography from '@material-ui/core/Typography';
import { addSurvey, updateSurvey, deleteSurvey, getSurveyById } from './helper';

const SurveyForm = () => {
  const history = useHistory();
  const { surveyId } = useParams(); // Get surveyId from URL if editing
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [suppliers, setSuppliers] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (surveyId) {
      setIsEditing(true);
      const loadSurvey = async () => {
        try {
          const response = await getSurveyById(surveyId);
          setTitle(response.title);
          setContent(response.content);
          setSuppliers(response.suppliers.join(', '));
        } catch (error) {
          toast.error('Failed to load survey');
        }
      };
      loadSurvey();
    }
  }, [surveyId]);

  const handleSave = async () => {
    if (!title || !content) {
      toast.error('Title and content are required');
      return;
    }

    const surveyData = {
      title,
      content,
      suppliers: suppliers.split(',').map(s => s.trim()),
    };

    try {
      if (isEditing) {
        await updateSurvey(surveyId, surveyData);
        toast.success('Survey updated successfully');
      } else {
        console.log('surveyData', surveyData);
        await addSurvey(surveyData);
        toast.success('Survey created successfully');
      }
      history.push('/survey-templates');
    } catch (error) {
      toast.error('Failed to save survey');
    }
  };

  const handleDelete = async () => {
    if (isEditing) {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteSurvey(surveyId);
            toast.success('Survey deleted successfully');
            history.push('/surveys');
          } catch (error) {
            toast.error('Failed to delete survey');
          }
        }
      });
    }
  };

  return (
    <MainCard title={isEditing ? 'Edit Survey' : 'Create Survey'}>
      <Typography variant="h6" gutterBottom>
        {isEditing ? 'Edit the survey details' : 'Fill in the details to create a new survey'}
      </Typography>

      <TextField
        label="Survey Title"
        variant="outlined"
        fullWidth
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        margin="normal"
      />

      <TextField
        label="Content"
        variant="outlined"
        fullWidth
        multiline
        rows={6}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        margin="normal"
      />

      <TextField
        label="Suppliers (comma separated)"
        variant="outlined"
        fullWidth
        value={suppliers}
        onChange={(e) => setSuppliers(e.target.value)}
        margin="normal"
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
        {isEditing && (
          <Button variant="contained" color="secondary" onClick={handleDelete}>
            Delete Survey
          </Button>
        )}
        <Button variant="contained" color="primary" onClick={handleSave}>
          {isEditing ? 'Update Survey' : 'Create Survey'}
        </Button>
      </div>
    </MainCard>
  );
};

export default SurveyForm;
