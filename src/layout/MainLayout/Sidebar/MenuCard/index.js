import React from 'react';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { Button, Card, CardContent, Grid, Link, Stack, Typography } from '@material-ui/core';

// project imports
import AnimateButton from './../../../../ui-component/extended/AnimateButton';

// style constant
const useStyles = makeStyles((theme) => ({
    card: {
        background: theme.palette.warning.light,
        overflow: 'hidden',
        position: 'relative',
        marginTop: '16px',
        marginBottom: '16px',
        bottom: 0,
        left: 0,
        right: 0,
        '&:after': {
            content: '""',
            position: 'absolute',
            width: '200px',
            height: '200px',
            border: '7px solid ',
            borderColor: theme.palette.warning.main,
            borderRadius: '80%',
            top: '65px',
            right: '-180px'
        },
        '&:before': {
            content: '""',
            position: 'absolute',
            width: '200px',
            height: '200px',
            border: '3px solid ',
            borderColor: theme.palette.warning.main,
            borderRadius: '50%',
            top: '145px',
            right: '-70px'
        }
    },
    tagLine: {
        color: theme.palette.grey[900],
        opacity: 0.6
    },
    button: {
        color: theme.palette.grey[800],
        backgroundColor: theme.palette.warning.main,
        textTransform: 'capitalize',
        boxShadow: 'none',
        '&:hover': {
            backgroundColor: theme.palette.warning.dark
        }
    }
}));

//-----------------------|| PROFILE MENU - UPGRADE PLAN CARD ||-----------------------//

const SideBarInfoCard = () => {
    const classes = useStyles();

    return (
        <Card className={classes.card}>
            <CardContent>
                <Grid container direction="column" spacing={2}>
                    <Grid item>
                        <Typography variant="h4">Extended Reality Initiative</Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="subtitle2" className={classes.tagLine}>
                            The Extended Reality Initiative (XRi) at Kent State is focused on developing immersive educational experiences in the realm of extended reality.
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Stack direction="row">
                            <AnimateButton>
                                <Button
                                    component={Link}
                                    href="https://xr.kent.edu/"
                                    target="_blank"
                                    variant="contained"
                                    className={classes.button}
                                >
                                    Project Details
                                </Button>
                            </AnimateButton>
                        </Stack>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default SideBarInfoCard;
