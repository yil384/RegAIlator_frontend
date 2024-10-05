import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { Avatar, Button, Grid, Typography } from '@material-ui/core';

// project imports
import MainCard from './../../../ui-component/cards/MainCard';
import SkeletonEarningCard from './../../../ui-component/cards/Skeleton/EarningCard';

// assets
import { IconUsers } from '@tabler/icons';
// import EarningIcon from './../../../assets/images/icons/earning.svg';
// import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
// import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
// import GetAppTwoToneIcon from '@material-ui/icons/GetAppOutlined';
// import FileCopyTwoToneIcon from '@material-ui/icons/FileCopyOutlined';
// import PictureAsPdfTwoToneIcon from '@material-ui/icons/PictureAsPdfOutlined';
// import ArchiveTwoToneIcon from '@material-ui/icons/ArchiveOutlined';
import { connect } from 'react-redux';

import { useHistory } from 'react-router-dom';
import { fetchStudents } from '../../students/helper';

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
    avatarRight: {
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        backgroundColor: theme.palette.secondary.dark,
        color: theme.palette.secondary[200],
        zIndex: 1
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
        cursor: 'pointer',
        ...theme.typography.smallAvatar,
        backgroundColor: theme.palette.secondary[200],
        color: theme.palette.secondary.dark
    },
    circleIcon: {
        transform: 'rotate3d(1, 1, 1, 45deg)'
    },
    menuItem: {
        marginRight: '14px',
        fontSize: '1.25rem'
    }
}));

//===========================|| DASHBOARD DEFAULT - EARNING CARD ||===========================//

const TotalStudents = () => {
    const classes = useStyles();
    const history = useHistory();


    const [students, setStudents] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const loadData = React.useCallback(async () => {
        try {
            await setIsLoading(true);
            const response = await fetchStudents();
            setStudents(response?.results || []);
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
        }
    });

    React.useEffect(() => {
        loadData();
    }, []);

    const handleClick = () => {
        history.push('students');
    };

    return (
        <React.Fragment>
            {isLoading ? (
                <SkeletonEarningCard />
            ) : (
                <MainCard border={false} className={classes.card} contentClass={classes.content}>
                    <Grid container direction='column'>
                        <Grid item>
                            <Grid container justifyContent='space-between'>
                                <Grid item>
                                    <Avatar variant='rounded' className={classes.avatar}>
                                        <IconUsers size='1.7rem' />
                                    </Avatar>
                                </Grid>
                                <Grid item>
                                    <Button
                                        disableElevation
                                        color={'secondary'}
                                        variant={'outline'}
                                        size='small'
                                        onClick={handleClick}
                                    >
                                        View Details
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Grid container alignItems='center'>
                                <Grid item>
                                    <Typography className={classes.cardHeading}>{students?.length}</Typography>
                                </Grid>
                                {/*<Grid item>*/}
                                {/*    <Avatar className={classes.avatarCircle}>*/}
                                {/*        <ArrowUpwardIcon fontSize='inherit' className={classes.circleIcon} />*/}
                                {/*    </Avatar>*/}
                                {/*</Grid>*/}
                            </Grid>
                        </Grid>
                        <Grid item sx={{ mb: 1.25 }}>
                            <Typography className={classes.subHeading}>Total Students</Typography>
                        </Grid>
                    </Grid>
                </MainCard>
            )}
        </React.Fragment>
    );
};

const mapStateToProps = (state) => ({
    isLoading: state.usersReducer.isLoading,
    users: state.usersReducer.users
});

TotalStudents.propTypes = {
    isLoading: PropTypes.bool
};

export default connect(mapStateToProps, null)(TotalStudents);

