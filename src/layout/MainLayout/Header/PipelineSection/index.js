import React from 'react';
import { Stepper, Step, StepLabel, ButtonBase, StepConnector } from '@material-ui/core';
import { makeStyles, withStyles } from '@material-ui/styles';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    root: {
        paddingTop: 16,
        width: '100%',
        backgroundColor: 'transparent',
        height: '100%',
    },
    step: {
        '& .MuiStepLabel-root': {
            display: 'flex',            // Display icon and text side by side
            flexDirection: 'column',    // Arrange icon and text vertically
            alignItems: 'center',       // Center icon and text horizontally
        },
        '& .MuiStepLabel-root .MuiStepIcon-root': {
            fontSize: '2rem',
            transform: 'scale(1.0)',
            color: '#4caf50',
            transition: 'color 0.3s',   // Add transition effect for color change
        },
        '& .MuiStepLabel-root .MuiStepIcon-active': {
            color: '#76ff03',
        },
        // Change color on mouse hover
        '& .MuiStepLabel-root .MuiStepIcon-root:hover': {
            color: '#a5d6a7', // Lighter green on hover
        },
    },
    label: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: '0.875rem',
        textAlign: 'center',  // Center text
        width: '150px',       // Fixed width to ensure each label has the same width
        display: 'inline-block',
    },
    arrow: {
        marginLeft: '18px',
        fontSize: '1rem',
    },
}));

const CustomConnector = withStyles({
    alternativeLabel: {
        top: 16,
    },
    active: {
        '& $line': {
            borderColor: '#76ff03',
        },
    },
    completed: {
        '& $line': {
            borderColor: '#4caf50',
        },
    },
    line: {
        borderTopWidth: 2.5,
        borderRadius: 1,
    },
})(StepConnector);

const Pipeline = ({ activeStep }) => {
    const classes = useStyles();
    const history = useHistory();

    const steps = [
        { label: 'Import data', path: '/import-data' },
        { label: 'Applicable regulation', path: '/applicable-regulations' },
        { label: 'Supplier survey', path: '/supplier-survey' },
        { label: 'Product compliance', path: '/product-compliance' },
    ];

    const handleStepClick = (path) => {
        history.push(path);
    };

    return (
        <Stepper 
            activeStep={activeStep} 
            alternativeLabel 
            className={classes.root} 
            connector={<CustomConnector />}
        >
            {steps.map((step, index) => (
                <Step key={step.label} className={classes.step}>
                    <ButtonBase onClick={() => handleStepClick(step.path)} style={{ width: '100%' }}>
                        <StepLabel className={classes.label}>
                            {step.label}
                        </StepLabel>
                    </ButtonBase>
                </Step>
            ))}
        </Stepper>
    );
};

export default Pipeline;
