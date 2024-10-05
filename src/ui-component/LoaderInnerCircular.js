import React from 'react';

// material-ui
import { makeStyles } from '@material-ui/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

// style constant
const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '70%',
        '& > * + *': {
            marginTop: theme.spacing(2)
        }
    }
}));

//-----------------------|| Loader ||-----------------------//

const LoaderInnerCircular = () => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <CircularProgress color='primary' />
        </div>
    );
};

export default LoaderInnerCircular;
