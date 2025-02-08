import React, { useState } from 'react';
import { Typography, Tooltip, IconButton, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { NotificationsActive, Add as AddIcon } from '@mui/icons-material';
import { updateSupplier } from './helper'; // Make sure the path is correct
import Box from '@mui/material/Box';

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

const FeedbackCell = (props) => {
    const { feedbackArray, nextSendTime, supplierId, isEmailSent, handleOpenDialogFeedback, refreshData } = props;
    const [open, setOpen] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            // Call backend to update the supplier feedback tags
            await updateSupplier(supplierId, { feedback: feedbackArray });
            // Refresh data (assumed that a refreshData function is passed in to refresh the table data)
            await refreshData();
            handleClose();
        } catch (err) {
            console.error(err);
            setError('Failed to add tag, please try again');
        } finally {
            setLoading(false);
        }
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
            {/* Add tag dialog */}
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
