import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { Grid, Typography } from '@material-ui/core';

// project imports
import SkeletonTotalGrowthBarChart from './../../../ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from './../../../ui-component/cards/MainCard';
import { gridSpacing } from '../../../store/constant';

const InformationComponent = ({ isLoading }) => {

    return (
        <React.Fragment>
            {isLoading ? (
                <SkeletonTotalGrowthBarChart />
            ) : (
                <MainCard>
                    <Grid container spacing={gridSpacing}>
                        <Grid item xs={12}>
                            <Grid container alignItems='center' justifyContent='space-between'>
                                <Grid item>
                                    <Grid container direction='column' spacing={1}>
                                        <Grid item>
                                            {/* <Typography variant='h2'>Extended Reality Initiative</Typography> */}
                                        </Grid>
                                        <Grid item>
                                            {/* <Typography>The Extended Reality Initiative (XRi) at Kent State
                                                is focused on developing immersive
                                                educational experiences in the realm of extended reality!
                                            </Typography>
                                            <br />
                                            <span>
                                    This project is funded by the National Science Foundation, Grant # 1908159. Any
                                        opinions,
                                        findings, and conclusions or recommendations expressed on this website are those
                                        of the
                                        author(s) and do not necessarily reflect the views of the National Science
                                        Foundation.
                                </span> */}
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </MainCard>
            )}
        </React.Fragment>
    );
};

InformationComponent.propTypes = {
    isLoading: PropTypes.bool
};

export default InformationComponent;
