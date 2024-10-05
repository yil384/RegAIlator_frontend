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
            display: 'flex',            // 使图标和文字并排显示
            flexDirection: 'column',    // 垂直排列图标和文字
            alignItems: 'center',       // 图标和文字水平居中
        },
        '& .MuiStepLabel-root .MuiStepIcon-root': {
            fontSize: '2rem',
            transform: 'scale(1.0)',
            color: '#4caf50',
            transition: 'color 0.3s',   // 添加颜色变化的过渡效果
        },
        '& .MuiStepLabel-root .MuiStepIcon-active': {
            color: '#76ff03',
        },
        // 鼠标悬停时改变颜色
        '& .MuiStepLabel-root .MuiStepIcon-root:hover': {
            color: '#a5d6a7', // 悬停时变浅的绿色
        },
    },
    label: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: '0.875rem',
        textAlign: 'center',  // 文字居中
        width: '150px',       // 固定宽度，确保每个 label 一样宽度
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
