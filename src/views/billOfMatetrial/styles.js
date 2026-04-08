import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles((theme) => ({
    shrinkLabel: {
        transform: 'translate(14px, 2px) scale(0.75)', // Adjust to top-left position
        transformOrigin: 'top left', // Set the scaling reference point to top-left
    },
    formContainer: {
        width: '60%'
    },
    subCard: {
        marginBottom: 20
    },
    input: {
        ...theme.typography.customInput
    },
    valueTxt: {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: theme.textDark,
        marginLeft: 10
    },
    selectInput: {
        ...theme.typography.selectInput,
        marginTop: 10
    },
    redButton: {
        fontSize: '1rem',
        fontWeight: 500,
        backgroundColor: theme.palette.grey[50],
        border: '1px solid',
        borderColor: theme.palette.grey[100],
        color: theme.palette.grey[700],
        textTransform: 'none',
        '&:hover': {
            backgroundColor: theme.palette.primary.light
        },
        [theme.breakpoints.down('sm')]: {
            fontSize: '0.875rem'
        }
    }
}));
