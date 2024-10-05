import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(0.5)
        }
    },
    deleteButton: {
        // to make a red delete button
        color: theme.palette.getContrastText(theme.palette.error.main),
        background: theme.palette.error.main
    },
    canvasContainer: {
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        height: window.innerHeight - 340,
        borderColor: 'rgba(108, 122, 137, 0.2)',
        border: '1px solid',
        width: '100%'
    },
    progressBarContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15
    },
    videoBtnContainer: {
        marginRight: '5px',
        marginBottom: '10px'
    },
    progressBar: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#003976',
        height: 20,
        borderColor: 'rgba(108, 122, 137, 0.2)',
        border: '1px solid',
        marginBottom: '10px',
        borderRadius: 4,
        // paddingLeft: -20,
        width: '100%',
        '@media screen and (max-width: 600px)': {
            height: 5
        }
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
        paddingLeft: 200,
        paddingTop: 150
    },
    videoTitleContainer: {
        display: 'flex',
        // justifyContent: 'center',
        justifyContent: 'space-between',
        marginBottom: -15
    },
    videoProgressInfoContainer: {
        display: 'flex',
        flex: 1,
        justifyContent: 'space-between',
        marginLeft: 55,
        marginBottom: -55,
        marginRight: 10,
        '@media screen and (max-width: 600px)': {
            margin: 0
        }
    },
    videoSelectorMainContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120
    }
}));

export default useStyles;
