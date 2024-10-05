import React from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { connect, useSelector } from 'react-redux';

// material-ui
import { makeStyles, useTheme } from '@material-ui/styles';
import {
    Avatar,
    Card,
    CardContent,
    Chip,
    ClickAwayListener,
    Divider,
    Grid,
    List,
    ListItemIcon,
    ListItemText,
    Paper,
    Popper,
    Typography
    // InputAdornment,
    // OutlinedInput,
    // Switch,
} from '@material-ui/core';
import ListItemButton from '@material-ui/core/ListItemButton';

// third-party
// import PerfectScrollbar from 'react-perfect-scrollbar';

// project imports
import MainCard from '../../../../ui-component/cards/MainCard';
import Transitions from '../../../../ui-component/extended/Transitions';
// import UpgradePlanCard from './UpgradePlanCard';

// assets
import {
    // IconSearch,
    IconLogout, IconSettings, IconUser
} from '@tabler/icons';

// import UserProfile from './../../../../assets/images/users/user-round.svg';
import UserProfile from './../../../../assets/images/users/no_profile.png';

import { clearSession } from './../../../../services/authService';
import { getGreetingTime } from '../../../../views/utilities/Greetings';

// style const
const useStyles = makeStyles((theme) => ({
    navContainer: {
        width: '100%',
        maxWidth: '350px',
        minWidth: '300px',
        backgroundColor: theme.palette.background.paper,
        borderRadius: '10px',
        [theme.breakpoints.down('sm')]: {
            minWidth: '100%'
        }
    },
    headerAvatar: {
        cursor: 'pointer',
        ...theme.typography.mediumAvatar,
        margin: '8px 0px 8px 8px !important'
    },
    profileChip: {
        height: '48px',
        alignItems: 'center',
        borderRadius: '27px',
        transition: 'all .2s ease-in-out',
        borderColor: theme.palette.primary.light,
        backgroundColor: theme.palette.primary.light,
        '&[aria-controls="menu-list-grow"], &:hover': {
            borderColor: theme.palette.primary.main,
            background: theme.palette.primary.main + '!important',
            color: theme.palette.primary.light,
            '& svg': {
                stroke: theme.palette.primary.light
            }
        }
    },
    profileLabel: {
        lineHeight: 0,
        padding: '12px'
    },
    listItem: {
        marginTop: '5px'
    },
    cardContent: {
        padding: '16px !important'
    },
    card: {
        backgroundColor: theme.palette.primary.light,
        marginBottom: '16px',
        marginTop: '16px'
    },
    searchControl: {
        width: '100%',
        paddingRight: '8px',
        paddingLeft: '16px',
        marginBottom: '16px',
        marginTop: '16px'
    },
    startAdornment: {
        fontSize: '1rem',
        color: theme.palette.grey[500]
    },
    flex: {
        display: 'flex'
    },
    name: {
        marginLeft: '2px',
        fontWeight: 400
    },
    ScrollHeight: {
        height: '100%',
        maxHeight: 'calc(100vh - 250px)',
        overflow: 'hidden'
    },
    badgeWarning: {
        backgroundColor: theme.palette.warning.dark,
        color: '#fff'
    }
}));

//-----------------------|| PROFILE MENU ||-----------------------//
function getLocationId({ pathname, search, hash }) {
    return pathname + (search ? '?' + search : '') + (hash ? '#' + hash : '');
}

const ProfileSection = ({ user }) => {
    const history = useHistory();
    const classes = useStyles();
    const theme = useTheme();
    const customization = useSelector((state) => state.customization);
    const sessionUser = useSelector((state) => state.authReducer.user);

    // const [sdm, setSdm] = React.useState(true);
    // const [value, setValue] = React.useState('');
    // const [notification, setNotification] = React.useState(false);
    const [selectedIndex, setSelectedIndex] = React.useState(1);

    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);

    const handleLogout = async () => {
        clearSession();
        history.replace('/session/login');
    };

    const handleListItemClick = (event, index) => {
        setSelectedIndex(index);
        handleClose(event);
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };
    const prevOpen = React.useRef(open);

    React.useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus();
        }

        prevOpen.current = open;
    }, [open]);

    return (
        <React.Fragment>
            <Chip
                classes={{ label: classes.profileLabel }}
                className={classes.profileChip}
                icon={
                    <Avatar
                        src={UserProfile}
                        className={classes.headerAvatar}
                        ref={anchorRef}
                        aria-controls={open ? 'menu-list-grow' : undefined}
                        aria-haspopup='true'
                        color='inherit'
                    />
                }
                label={<IconSettings stroke={1.5} size='1.5rem' color={theme.palette.primary.main} />}
                variant='outlined'
                ref={anchorRef}
                aria-controls={open ? 'menu-list-grow' : undefined}
                aria-haspopup='true'
                onClick={handleToggle}
                color='primary'
            />
            <Popper
                placement='bottom-end'
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                popperOptions={{
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 14]
                            }
                        }
                    ]
                }}
            >
                {({ TransitionProps }) => (
                    <Transitions in={open} {...TransitionProps}>
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MainCard border={false} elevation={16} content={false} boxShadow
                                          shadow={theme.shadows[16]}>
                                    <CardContent className={classes.cardContent}>
                                        <Card className={classes.card}>
                                            <CardContent>
                                                <Grid container direction='column' spacing={0}>
                                                    <Grid item className={classes.flex}>
                                                        <Typography variant='h4'>{getGreetingTime()}</Typography>
                                                        {!!sessionUser ? (
                                                            <Typography component='span' variant='h4'
                                                                        className={classes.name}>
                                                                , {sessionUser.firstname}!
                                                            </Typography>
                                                        ) : '!'}
                                                    </Grid>
                                                    {!!sessionUser && (
                                                        <Grid container spacing={1}>
                                                            <Grid item>
                                                                <Typography
                                                                    variant='subtitle2'>{sessionUser.role.toUpperCase()}</Typography>
                                                            </Grid>
                                                        </Grid>

                                                    )}
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                        {/* <OutlinedInput
                                            className={classes.searchControl}
                                            id="input-search-profile"
                                            value={value}
                                            onChange={(e) => setValue(e.target.value)}
                                            placeholder="Search profile options"
                                            startAdornment={
                                                <InputAdornment position="start">
                                                    <IconSearch stroke={1.5} size="1.3rem" className={classes.startAdornment} />
                                                </InputAdornment>
                                            }
                                            aria-describedby="search-helper-text"
                                            inputProps={{
                                                'aria-label': 'weight'
                                            }}
                                        /> */}
                                        <Divider />
                                        <Grid className={classes.ScrollHeight}>
                                            {/*  <UpgradePlanCard />
                                            <Divider />
                                            <Card className={classes.card}>
                                                <CardContent>
                                                    <Grid container spacing={3} direction="column">
                                                        <Grid item>
                                                            <Grid item container alignItems="center" justifyContent="space-between">
                                                                <Grid item>
                                                                    <Typography variant="subtitle1">Start DND Mode</Typography>
                                                                </Grid>
                                                                <Grid item>
                                                                    <Switch
                                                                        color="primary"
                                                                        checked={sdm}
                                                                        onChange={(e) => setSdm(e.target.checked)}
                                                                        name="sdm"
                                                                        size="small"
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid item>
                                                            <Grid item container alignItems="center" justifyContent="space-between">
                                                                <Grid item>
                                                                    <Typography variant="subtitle1">Allow Notifications</Typography>
                                                                </Grid>
                                                                <Grid item>
                                                                    <Switch
                                                                        checked={notification}
                                                                        onChange={(e) => setNotification(e.target.checked)}
                                                                        name="sdm"
                                                                        size="small"
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                </CardContent>
                                            </Card> */}
                                            <Divider />
                                            <List component='nav' className={classes.navContainer}>
                                                {/*<ListItemButton*/}
                                                {/*    className={classes.listItem}*/}
                                                {/*    sx={{ borderRadius: customization.borderRadius + 'px' }}*/}
                                                {/*    selected={selectedIndex === 0}*/}
                                                {/*    onClick={(event) => handleListItemClick(event, 0)}*/}
                                                {/*    component={React.forwardRef((props, ref) => (*/}
                                                {/*        <RouterLink {...props} to='#' />*/}
                                                {/*    ))}*/}
                                                {/*>*/}
                                                {/*    <ListItemIcon>*/}
                                                {/*        <IconSettings stroke={1.5} size='1.3rem' />*/}
                                                {/*    </ListItemIcon>*/}
                                                {/*    <ListItemText primary={<Typography variant='body2'>Account*/}
                                                {/*        Settings</Typography>} />*/}
                                                {/*</ListItemButton>*/}
                                                <ListItemButton
                                                    className={classes.listItem}
                                                    sx={{ borderRadius: customization.borderRadius + 'px' }}
                                                    selected={selectedIndex === 1}
                                                    onClick={(event) => handleListItemClick(event, 1)}
                                                    component={React.forwardRef((props, ref) => (
                                                        <RouterLink {...props} to={`/users/${user?.id}`} />
                                                    ))}
                                                >
                                                    <ListItemIcon>
                                                        <IconUser stroke={1.5} size='1.3rem' />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={
                                                            <Grid container spacing={1} justifyContent='space-between'>
                                                                <Grid item>
                                                                    <Typography variant='body2'>User
                                                                        Profile</Typography>
                                                                </Grid>
                                                                {/* <Grid item>
                                                                    <Chip label="02" size="small" className={classes.badgeWarning} />
                                                                </Grid> */}
                                                            </Grid>
                                                        }
                                                    />
                                                </ListItemButton>
                                                <ListItemButton
                                                    className={classes.listItem}
                                                    sx={{ borderRadius: customization.borderRadius + 'px' }}
                                                    selected={selectedIndex === 4}
                                                    onClick={handleLogout}
                                                >
                                                    <ListItemIcon>
                                                        <IconLogout stroke={1.5} size='1.3rem' />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={<Typography variant='body2'>Logout</Typography>} />
                                                </ListItemButton>
                                            </List>
                                        </Grid>
                                    </CardContent>
                                </MainCard>
                            </ClickAwayListener>
                        </Paper>
                    </Transitions>
                )}
            </Popper>
        </React.Fragment>
    );
};

const mapStateToProps = (state) => ({
    isLoading: state.authReducer.isLoading,
    user: state.authReducer.user
});

export default connect(mapStateToProps, null)(ProfileSection);

