import React from 'react';
import PropTypes from 'prop-types';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { Avatar, Button, Grid, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@material-ui/core';
import { IconAlertTriangle } from '@tabler/icons';

// project imports
import MainCard from './../../../ui-component/cards/MainCard';
import TotalIncomeCard from './../../../ui-component/cards/Skeleton/TotalIncomeCard';

import { fetchErrorLogs } from '../../error-logs/error-logs.helper';
import { useHistory } from 'react-router-dom';

// style constant
const useStyles = makeStyles((theme) => ({
    card: {
        overflow: 'hidden',
        position: 'relative',
        '&:after': {
            content: '""',
            position: 'absolute',
            width: '210px',
            height: '210px',
            background: 'linear-gradient(210.04deg, ' + theme.palette.warning.dark + ' -50.94%, rgba(144, 202, 249, 0) 83.49%)',
            borderRadius: '50%',
            top: '-30px',
            right: '-180px'
        },
        '&:before': {
            content: '""',
            position: 'absolute',
            width: '210px',
            height: '210px',
            background: 'linear-gradient(140.9deg, ' + theme.palette.warning.dark + ' -14.02%, rgba(144, 202, 249, 0) 70.50%)',
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
        backgroundColor: theme.palette.warning.light,
        color: theme.palette.warning.dark
    },
    secondary: {
        color: theme.palette.grey[500],
        marginTop: '5px'
    },
    padding: {
        paddingTop: 0,
        paddingBottom: 0
    }
}));

//-----------------------|| DASHBOARD - TOTAL INCOME LIGHT CARD ||-----------------------//

const TotalErrorLogs = () => {
    const history = useHistory();
    const classes = useStyles();

    const [isLoading, setIsLoading] = React.useState(false);
    const [errorLogs, setErrorLogs] = React.useState([]);

    const loadData = React.useCallback(async () => {
        try {
            await setIsLoading(true);
            const response = await fetchErrorLogs();
            setErrorLogs(response?.results || []);
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
                <MainCard className={classes.card} contentClass={classes.content}>
                    <Grid container direction='column'>
                        <Grid item>
                            <Grid container justifyContent='space-between'>
                                <Grid item>
                                    <List className={classes.padding}>
                                        <ListItem alignItems='center' disableGutters className={classes.padding}>
                                            <ListItemAvatar>
                                                <Avatar variant='rounded' className={classes.avatar}>
                                                    <IconAlertTriangle size='1.7rem' />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                sx={{
                                                    mt: 0.45,
                                                    mb: 0.45
                                                }}
                                                className={classes.padding}
                                                primary={<Typography variant='h4'>{errorLogs?.length || 0}</Typography>}
                                                secondary={
                                                    <Typography variant='subtitle2' className={classes.secondary}>
                                                        Total Error logs
                                                    </Typography>
                                                }
                                            />
                                        </ListItem>
                                    </List>
                                </Grid>
                                <Grid item>
                                    <Button
                                        disableElevation
                                        color={'secondary'}
                                        variant={'contained'}
                                        size='small'
                                        onClick={() => {
                                            history.push('logs/error-logs');
                                        }}
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

TotalErrorLogs.propTypes = {
    isLoading: PropTypes.bool
};

export default TotalErrorLogs;
