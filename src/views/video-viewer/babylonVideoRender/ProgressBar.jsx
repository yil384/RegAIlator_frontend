import Slider from '@material-ui/core/Slider';
import { withStyles } from '@material-ui/styles';

export const PrettoSlider = withStyles(theme => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#003976',
        height: 18,
        borderColor: 'rgba(108, 122, 137, 0.2)',
        border: '1px solid',
        marginBottom: '10px',
        borderRadius: 4
    },
    thumb: {
        height: 10,
        width: 10,
        backgroundColor: '#fff',
        border: '2px solid currentColor',
        // marginLeft: 2,
        marginTop: 4,
        '&:focus, &:hover, &$active': {
            boxShadow: 'inherit'
        }
    },
    active: {},
    disabled: {
        color: '#003976'
    },
    valueLabel: {
        // left: 'calc(-50% + 0px)',
    },
    track: {
        height: 8,
        borderRadius: 4,
        color: '#003976',
        marginTop: 4
        // marginLeft: -10
        // marginBottom: '3px',
    },
    rail: {
        height: 8,
        borderRadius: 4,
        marginTop: 4,
        color: '#003976'
        // marginBottom: '3px',
    }
}))(Slider);
