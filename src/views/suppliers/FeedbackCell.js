import React, { useState } from 'react';
import {
    Typography,
    Tooltip,
    IconButton,
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    OutlinedInput,
    FormHelperText,
    Grid
} from '@mui/material';
import { NotificationsActive, Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { updateSupplier } from './helper'; // Make sure the path is correct
import Box from '@mui/material/Box';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';

// Calculate the remaining time, return a friendly format
const calculateTimeLeft = (nextSendTime) => {
    const now = new Date();
    let timeDifference = new Date(nextSendTime) - now;

    // Prefix and suffix are set to "in" or "ago" depending on whether the time difference is less than or equal to 0
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

// Define the tag list
let tagList = [];

// Generate color method based on tag
const generateColor = (tag) => {
    // Simple hash function to convert a string into a numeric value
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash); // Left shift
        hash = hash & hash; // Keep 32-bit integer
    }
    // Convert to HSL color space to ensure even color distribution
    const h = Math.abs(hash) % 360; // Hue 0-360
    const s = 70 + (hash % 20); // Saturation 70%-90%
    const l = 50 + (hash % 10); // Lightness 50%-60%
    return `hsl(${h}, ${s}%, ${l}%)`; // Return HSL color
};

// Render tags for each feedback item
const renderTags = (tags) => {
    return tags.map((tag, index) => {
        if (!tag) {
            return null;
        }
        const tagText = tagList.find((t) => t.tag === tag)?.text;
        if (!tagText) {
            // Generate a new color for the tag based on the length of the tag list
            tagList.push({ tag, text: `${tag}`, color: generateColor(tag) });
        }
        const tagColor = tagList.find((t) => t.tag === tag)?.color;

        return (
            <Box
                key={index}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px 12px',
                    margin: '0 4px',
                    height: '100%',
                    borderRadius: '12px',
                    backgroundColor: tagColor,
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}
            >
                {tagText}
            </Box>
        );
    });
};

// Add Feedback Dialog Component
const AddFeedbackDialog = ({ open, handleClose, supplierId, refreshData }) => {
    const handleSubmitFeedback = async (values) => {
        try {
            // Call API to add feedback
            const newFeedback = {
                content: values.feedbackContent,
                tags: values.tags.split(',').map((tag) => tag.trim()), // Split tags by comma
                date: new Date().toISOString(), // Add current date
                to: values.to, // Add "to" field
                from: values.from, // Add "from" field
                subject: values.subject // Add "subject" field
            };

            // Update supplier with new feedback
            await updateSupplier(supplierId, { feedback: [newFeedback] });
            refreshData(); // Refresh data after adding feedback
            handleClose();
        } catch (err) {
            console.error('Failed to add feedback:', err);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>
                Add Feedback
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    style={{
                        position: 'absolute',
                        right: 8,
                        top: 8
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Formik
                    initialValues={{
                        feedbackContent: '',
                        tags: '',
                        to: '',
                        from: '',
                        subject: ''
                    }}
                    validationSchema={Yup.object().shape({
                        feedbackContent: Yup.string().required('Feedback content is required'),
                        tags: Yup.string(),
                        to: Yup.string().required('To is required'),
                        from: Yup.string().required('From is required'),
                        subject: Yup.string().required('Subject is required')
                    })}
                    onSubmit={handleSubmitFeedback}
                >
                    {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="subject">Subject</InputLabel>
                                        <OutlinedInput
                                            id="subject"
                                            type="text"
                                            value={values.subject}
                                            name="subject"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            label="Subject"
                                        />
                                        {touched.subject && errors.subject && <FormHelperText error>{errors.subject}</FormHelperText>}
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="from">From</InputLabel>
                                        <OutlinedInput
                                            id="from"
                                            type="text"
                                            value={values.from}
                                            name="from"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            label="From"
                                        />
                                        {touched.from && errors.from && <FormHelperText error>{errors.from}</FormHelperText>}
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="to">To</InputLabel>
                                        <OutlinedInput
                                            id="to"
                                            type="text"
                                            value={values.to}
                                            name="to"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            label="To"
                                        />
                                        {touched.to && errors.to && <FormHelperText error>{errors.to}</FormHelperText>}
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="feedbackContent">Feedback Content</InputLabel>
                                        <OutlinedInput
                                            id="feedbackContent"
                                            type="text"
                                            value={values.feedbackContent}
                                            name="feedbackContent"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            label="Feedback Content"
                                            multiline
                                            rows={4}
                                        />
                                        {touched.feedbackContent && errors.feedbackContent && (
                                            <FormHelperText error>{errors.feedbackContent}</FormHelperText>
                                        )}
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="tags">Tags (comma separated)</InputLabel>
                                        <OutlinedInput
                                            id="tags"
                                            type="text"
                                            value={values.tags}
                                            name="tags"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            label="Tags (comma separated)"
                                        />
                                        {touched.tags && errors.tags && <FormHelperText error>{errors.tags}</FormHelperText>}
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                style={{ marginTop: 16 }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </Button>
                        </form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
};

const FeedbackCell = (props) => {
    const { feedbackArray, nextSendTime, supplierId, isEmailSent, handleOpenDialogFeedback, refreshData } = props;
    const [open, setOpen] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [openFeedback, setOpenFeedback] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setNewTag('');
        setError('');
    };

    const handleAddTag = async () => {
        if (!newTag.trim()) {
            setError('Tag cannot be empty');
            return;
        }

        setLoading(true);
        try {
            if (feedbackArray.find((f) => f.tags.includes(newTag.trim()))) {
                setError('Tag already exists');
                return;
            }
            // Construct a new tag array
            feedbackArray.forEach((f) => {
                f.tags.push(newTag.trim());
            });
            handleClose();
            // Call backend to update the supplier feedback tags
            await updateSupplier(supplierId, { feedback: feedbackArray });
            // Refresh data (assumed that a refreshData function is passed in to refresh the table data)
            await refreshData();
        } catch (err) {
            console.error(err);
            setError('Failed to add tag, please try again');
        } finally {
            setLoading(false);
        }
    };

    const handleAddFeedback = () => {
        setOpenFeedback(true);
    };

    return (
        <div style={{ width: '100%', cursor: 'pointer' }}>
            <div onClick={() => handleOpenDialogFeedback(feedbackArray, supplierId, nextSendTime)}>
                {feedbackArray.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" noWrap>
                            {`Feedbacks (${feedbackArray.length})`}
                        </Typography>
                        {/* Add button */}
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering the parent click event
                                handleClickOpen();
                            }}
                        >
                            <AddIcon fontSize="small" />
                        </IconButton>
                        <div
                            style={{
                                alignItems: 'center',
                                display: 'flex',
                                height: '30px'
                            }}
                        >
                            {renderTags(feedbackArray[0].tags)}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" noWrap>
                            No Feedback
                        </Typography>
                        {/* Add button for adding feedback */}
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering the parent click event
                                handleAddFeedback();
                            }}
                        >
                            <AddIcon fontSize="small" />
                        </IconButton>
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

            {/* Add Feedback Dialog */}
            <AddFeedbackDialog
                open={openFeedback}
                handleClose={() => setOpenFeedback(false)}
                supplierId={supplierId}
                refreshData={refreshData}
            />

            {/* Add Tag Dialog */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add New Tag</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Tag"
                        type="text"
                        fullWidth
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        error={!!error}
                        helperText={error}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddTag} color="primary" disabled={loading}>
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default FeedbackCell;
