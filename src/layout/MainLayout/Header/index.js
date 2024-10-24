import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';

// material-ui
import { makeStyles } from '@material-ui/styles';
import {
    Avatar, Box,
    ButtonBase, Typography, Grid
} from '@material-ui/core';

// project imports
import LogoSection from '../LogoSection';
// import SearchSection from './SearchSection';
import ProfileSection from './ProfileSection';
import NotificationSection from './NotificationSection';
import { getGreetingTime } from '../../../views/utilities/Greetings';
import Pipeline from './PipelineSection'; // 引入 Pipeline 组件

// assets
import { IconMenu2 } from '@tabler/icons';

// style constant
const useStyles = makeStyles((theme) => ({
    flex: {
        display: 'flex'
    },
    grow: {
        flexGrow: 1
    },
    headerAvatar: {
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        transition: 'all .2s ease-in-out',
        background: theme.palette.secondary.light,
        color: theme.palette.secondary.dark,
        '&:hover': {
            background: theme.palette.secondary.dark,
            color: theme.palette.secondary.light
        }
    },
    boxContainer: {
        width: '228px',
        display: 'flex',
        [theme.breakpoints.down('md')]: {
            width: 'auto'
        }
    },
    name: {
        marginLeft: '2px',
        fontWeight: 400
    }
}));

//-----------------------|| MAIN NAVBAR / HEADER ||-----------------------//

const Header = ({ handleLeftDrawerToggle }) => {
    const classes = useStyles();
    const sessionUser = useSelector((state) => state.authReducer.user);

    return (
        <React.Fragment>
            {/* logo & toggler button */}
            <div className={classes.boxContainer}>
                <Box component='span' sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
                    <LogoSection />
                </Box>
                <ButtonBase sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <Avatar variant='rounded' className={classes.headerAvatar} onClick={handleLeftDrawerToggle}
                            color='inherit'>
                        <IconMenu2 stroke={1.5} size='1.5rem' />
                    </Avatar>
                </ButtonBase>
            </div>

            {/* header search */}
            {/* <SearchSection theme="light" /> */}
            <div className={classes.grow} />
            <div className={classes.grow} />

            {/* Pipeline 组件
            <Grid item>
                <Pipeline activeStep={2} />
            </Grid> */}

            <div className={classes.grow} />
            <div className={classes.grow} />

            <Grid item className={classes.flex}>
                <Typography variant='h4'>{getGreetingTime()}</Typography>
                {!!sessionUser ? (
                    <Typography component='span' variant='h4' className={classes.name}>
                        , {sessionUser.firstname}!
                    </Typography>
                ) : '!'}
            </Grid>
            {/* notification & profile */}
            <NotificationSection />
            <ProfileSection />
        </React.Fragment>
    );
};

Header.propTypes = {
    handleLeftDrawerToggle: PropTypes.func
};

export default Header;
