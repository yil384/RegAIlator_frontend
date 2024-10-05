import React from 'react';

// material-ui
// import { makeStyles } from '@material-ui/styles';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

// style constant
// const useStyles = makeStyles((theme) => ({
//     root: {
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         zIndex: 1301,
//         width: '100%',
//         '& > * + *': {
//             marginTop: theme.spacing(2)
//         }
//     }
// }));

//-----------------------|| Loader ||-----------------------//

const LoaderBackdrop = ({ isLoading }) => {
    // const classes = useStyles();

    return (
        <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={isLoading}
        >
            <CircularProgress color="inherit" />
        </Backdrop>
    );
};

export default LoaderBackdrop;
