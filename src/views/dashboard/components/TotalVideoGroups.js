import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { Avatar, Button, Grid, Typography } from '@material-ui/core';

// project imports
import MainCard from './../../../ui-component/cards/MainCard';
import SkeletonTotalOrderCard from './../../../ui-component/cards/Skeleton/EarningCard';

import { useHistory } from 'react-router-dom';
import { fetchVideoGroupsAction } from '../../video-group/video-groups.actions';
import { connect } from 'react-redux';
import { IconFolders } from '@tabler/icons';

// style constant
const useStyles = makeStyles((theme) => ({
    card: {
        backgroundColor: theme.palette.secondary.dark,
        color: '#fff',
        overflow: 'hidden',
        position: 'relative',
        '&>div': {
            position: 'relative',
            zIndex: 5
        },
        '&:after': {
            content: '""',
            position: 'absolute',
            width: '210px',
            height: '210px',
            background: theme.palette.secondary[800],
            borderRadius: '50%',
            zIndex: 1,
            top: '-85px',
            right: '-95px',
            [theme.breakpoints.down('xs')]: {
                top: '-105px',
                right: '-140px'
            }
        },
        '&:before': {
            content: '""',
            position: 'absolute',
            zIndex: 1,
            width: '210px',
            height: '210px',
            background: theme.palette.secondary[800],
            borderRadius: '50%',
            top: '-125px',
            right: '-15px',
            opacity: 0.5,
            [theme.breakpoints.down('xs')]: {
                top: '-155px',
                right: '-70px'
            }
        }
    },
    content: {
        padding: '20px !important'
    },
    avatar: {
        ...theme.typography.commonAvatar,
        ...theme.typography.largeAvatar,
        backgroundColor: theme.palette.secondary[800],
        color: '#fff',
        marginTop: '8px'
    },
    cardHeading: {
        fontSize: '2.125rem',
        fontWeight: 500,
        marginRight: '8px',
        marginTop: '14px',
        marginBottom: '6px'
    },
    subHeading: {
        fontSize: '1rem',
        fontWeight: 500,
        color: theme.palette.secondary[200]
    },
    avatarCircle: {
        ...theme.typography.smallAvatar,
        cursor: 'pointer',
        backgroundColor: theme.palette.secondary[200],
        color: theme.palette.secondary.dark
    },
    circleIcon: {
        transform: 'rotate3d(1, 1, 1, 45deg)'
    }
}));

const TotalVideoGroups = ({ fetchVideoGroupsAction, isLoading, videoGroups }) => {

    const classes = useStyles();
    const history = useHistory();

    const handleViewDetails = () => {
        history.push('video-groups');
    };

    React.useEffect(() => {
        fetchVideoGroupsAction();
    }, [fetchVideoGroupsAction]);

    return (
        <React.Fragment>
            {isLoading ? (
                <SkeletonTotalOrderCard />
            ) : (
                <MainCard border={false} className={classes.card} contentClass={classes.content}>
                    <Grid container direction='column'>
                        <Grid item>
                            <Grid container justifyContent='space-between'>
                                <Grid item>
                                    <Avatar variant='rounded' className={classes.avatar}>
                                        <IconFolders size='1.7rem' />
                                    </Avatar>
                                </Grid>
                                <Grid item>
                                    <Button
                                        disableElevation
                                        color='secondary'
                                        variant={'outline'}
                                        size='small'
                                        onClick={(e) => handleViewDetails(e, true)}
                                    >
                                        View Details
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Grid container alignItems='center'>
                                <Grid item>
                                    <Grid container alignItems='center'>
                                        <Grid item>
                                            <Typography
                                                className={classes.cardHeading}>{videoGroups?.results?.length || 0}</Typography>
                                        </Grid>
                                        {/*<Grid item>*/}
                                        {/*    <Avatar className={classes.avatarCircle}>*/}
                                        {/*        <ArrowDownwardIcon fontSize='inherit' className={classes.circleIcon} />*/}
                                        {/*    </Avatar>*/}
                                        {/*</Grid>*/}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item sx={{ mb: 1.25 }}>
                            <Typography className={classes.subHeading}>Total Video Groups</Typography>
                        </Grid>
                    </Grid>
                </MainCard>
            )}
        </React.Fragment>
    );
};

const mapStateToProps = (state) => ({
    isLoading: state.videoGroupsReducer.isLoading,
    videoGroups: state.videoGroupsReducer.videoGroups
});

const mapDispatchToProps = (dispatch) => ({
    fetchVideoGroupsAction: (obj) => dispatch(fetchVideoGroupsAction(obj))
});

export default connect(mapStateToProps, mapDispatchToProps)(TotalVideoGroups);
