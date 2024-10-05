import { makeStyles } from '@material-ui/styles';

// style constant
export const useStyles = makeStyles((theme) => ({
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
  },
  signDivider: {
    flexGrow: 1
  },
  signText: {
    cursor: 'unset',
    margin: theme.spacing(2),
    padding: '5px 56px',
    borderColor: theme.palette.grey[100] + ' !important',
    color: theme.palette.grey[900] + '!important',
    fontWeight: 500
  },
  loginIcon: {
    marginRight: '16px',
    [theme.breakpoints.down('sm')]: {
      marginRight: '8px'
    }
  },
  loginInput: {
    ...theme.typography.customInput
  },
  selectInput: {
    ...theme.typography.selectInput
  },
}));
