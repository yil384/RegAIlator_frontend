import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { Avatar, Button, Grid, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@material-ui/core';

// project imports
import MainCard from './../../../ui-component/cards/MainCard';
import TotalIncomeCard from './../../../ui-component/cards/Skeleton/TotalIncomeCard';

// assets
import TableChartOutlinedIcon from '@material-ui/icons/TableChartOutlined';
import { fetchAuditLogs } from '../../watch-logs/watch-logs.helper';
import { IconListSearch } from '@tabler/icons';

// style constant
const useStyles = makeStyles((theme) => ({
    card: {
        backgroundColor: theme.palette.primary.dark,
        color: theme.palette.primary.light,
        overflow: 'hidden',
        position: 'relative',
        '&:after': {
            content: '""',
            position: 'absolute',
            width: '210px',
            height: '210px',
            background: 'linear-gradient(210.04deg, ' + theme.palette.primary[200] + ' -50.94%, rgba(144, 202, 249, 0) 83.49%)',
            borderRadius: '50%',
            top: '-30px',
            right: '-180px'
        },
        '&:before': {
            content: '""',
            position: 'absolute',
            width: '210px',
            height: '210px',
            background: 'linear-gradient(140.9deg, ' + theme.palette.primary[200] + ' -14.02%, rgba(144, 202, 249, 0) 77.58%)',
            borderRadius: '50%',
            top: '-160px',
            right: '-130px'
        }
    },
    content: {
        padding: '16px !important'
    },
    avatar: {
        ...theme.typography.commonAvatar,
        ...theme.typography.largeAvatar,
        backgroundColor: theme.palette.primary[800],
        color: '#fff'
    },
    primary: {
        color: '#fff'
    },
    secondary: {
        color: theme.palette.primary.light,
        marginTop: '5px'
    },
    padding: {
        paddingTop: 0,
        paddingBottom: 0
    }
}));


const TotalWatchLogs = () => {
    const classes = useStyles();
    const history = useHistory();

    const [watchLogs, setWatchLogs] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleViewDetails = () => {
        history.push('logs/watch-logs');
    };

    const loadData = React.useCallback(async () => {
        try {
            await setIsLoading(true);
            const response = await fetchAuditLogs({
                limit: 1
            });
            setWatchLogs(response?.totalResults || []);
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
        }
    });

    React.useEffect(() => {
        loadData();
    }, []);

    return (
        <React.Fragment>
            {isLoading ? (
                <TotalIncomeCard />
            ) : (
                <MainCard border={false} className={classes.card} contentClass={classes.content}>
                    <Grid container direction='column'>
                        <Grid item>
                            <Grid container justifyContent='space-between'>
                                <Grid item>
                                    <List className={classes.padding}>
                                        <ListItem alignItems='center' disableGutters className={classes.padding}>
                                            <ListItemAvatar>
                                                <Avatar variant='rounded' className={classes.avatar}>
                                                    <IconListSearch size='1.7rem' />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                className={classes.padding}
                                                sx={{
                                                    mt: 0.45,
                                                    mb: 0.45
                                                }}
                                                primary={
                                                    <Typography variant='h4' className={classes.primary}>
                                                        {watchLogs}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography variant='subtitle2' className={classes.secondary}>
                                                        Total Audit Logs
                                                    </Typography>
                                                }
                                            />
                                        </ListItem>
                                    </List>
                                </Grid>
                                <Grid item>
                                    <Button
                                        disableElevation
                                        color={'primary'}
                                        variant={'contained'}
                                        size='small'
                                        onClick={handleViewDetails}
                                    >
                                        View Details
                                    </Button>
                                </Grid>
                            </Grid>

                        </Grid>
                    </Grid>
                </MainCard>
            )}
        </React.Fragment>
    );
};

TotalWatchLogs.propTypes = {
    isLoading: PropTypes.bool
};

export default TotalWatchLogs;
