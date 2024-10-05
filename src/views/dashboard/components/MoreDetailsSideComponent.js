import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { CardContent, Grid, Typography } from '@material-ui/core';

// project imports
import MainCard from './../../../ui-component/cards/MainCard';
import SkeletonPopularCard from './../../../ui-component/cards/Skeleton/PopularCard';
import { gridSpacing } from '../../../store/constant';

// style constant
// const useStyles = makeStyles((theme) => ({
//     cardAction: {
//         padding: '10px',
//         paddingTop: 0,
//         justifyContent: 'center'
//     },
//     primaryLight: {
//         color: theme.palette.primary[200],
//         cursor: 'pointer'
//     },
//     divider: {
//         marginTop: '12px',
//         marginBottom: '12px'
//     },
//     avatarSuccess: {
//         width: '16px',
//         height: '16px',
//         borderRadius: '5px',
//         backgroundColor: theme.palette.success.light,
//         color: theme.palette.success.dark,
//         marginLeft: '15px'
//     },
//     successDark: {
//         color: theme.palette.success.dark
//     },
//     avatarError: {
//         width: '16px',
//         height: '16px',
//         borderRadius: '5px',
//         backgroundColor: theme.palette.orange.light,
//         color: theme.palette.orange.dark,
//         marginLeft: '15px'
//     },
//     errorDark: {
//         color: theme.palette.orange.dark
//     }
// }));

//-----------------------|| DASHBOARD DEFAULT - POPULAR CARD ||-----------------------//

const MoreDetailsSideComponent = ({ isLoading }) => {
    // const classes = useStyles();

    return (
        <React.Fragment>
            {isLoading ? (
                <SkeletonPopularCard />
            ) : (
                <MainCard content={false}>
                    <CardContent>
                        <Grid container spacing={gridSpacing}>
                            <Grid item xs={12}>
                                <Grid container alignContent='center' justifyContent='space-between'>
                                    <Grid item>
                                        <Typography variant='h4'>More Details</Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12} sx={{ pt: '16px !important' }}>
                                <span>
                                    This project is funded by the National Science Foundation, Grant # 1908159. Any
                                        opinions,
                                        findings, and conclusions or recommendations expressed on this website are those
                                        of the
                                        author(s) and do not necessarily reflect the views of the National Science
                                        Foundation.
                                </span>
                            </Grid>
                        </Grid>
                    </CardContent>
                </MainCard>
            )}
        </React.Fragment>
    );
};

MoreDetailsSideComponent.propTypes = {
    isLoading: PropTypes.bool
};

export default MoreDetailsSideComponent;
