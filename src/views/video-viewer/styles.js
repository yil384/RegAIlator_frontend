import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
    mainCardContainer: {
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh'
    },
    root: {
        '& > *': {
            margin: theme.spacing(0.5)
        },
        width: '100%'
    },
    deleteButton: {
        // to make a red delete button
        color: theme.palette.getContrastText(theme.palette.error.main),
        background: theme.palette.error.main
    },
    progressBarContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        width: '100%'
    },
    videoBtnContainer: {
        marginRight: '5px',
        marginBottom: '10px'
    },
    progressBar: {
        paddingLeft: -20
    },
    videoProgressInfoContainer: {
        display: 'flex',
        flex: 1
    }
}));

export default useStyles;
