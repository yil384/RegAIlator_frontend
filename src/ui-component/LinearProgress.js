import React from 'react';

// material-ui
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { makeStyles, withStyles } from '@material-ui/styles';
import Box from '@mui/material/Box';

// style constant
const useStyles = makeStyles((theme) => ({
    root: {
        // display: 'flex',
        // justifyContent: 'center',
        // alignItems: 'center',
        // width: '100%',
    }
}));

const BorderLinearProgress = withStyles((theme) => ({
    root: {
        height: 15,
        borderRadius: 5
    },
    colorPrimary: {
        background: theme.palette.success.light
    },
    bar: {
        borderRadius: 5,
        backgroundColor: theme.palette.success.main
    }
}))(LinearProgress);


//-----------------------|| Loader ||-----------------------//

const LinearProgressBar = ({ progress }) => {
    const classes = useStyles();

    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
                <BorderLinearProgress variant='determinate' value={parseFloat(progress || '0')} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
                <Typography variant='body2' color='text.secondary'>{`${Math.round(
                    progress
                )}%`}
                </Typography>
            </Box>
        </Box>
    );
};

export default LinearProgressBar;
