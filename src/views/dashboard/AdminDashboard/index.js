import React from 'react';
import { connect } from 'react-redux';

// material-ui
import { Grid } from '@material-ui/core';

// project imports
import TotalUsers from '../components/TotalUsers';
import MoreDetailsSideComponent from '../components/MoreDetailsSideComponent';
import TotalVideos from '../components/TotalVideos';
import TotalWatchLogs from '../components/TotalWatchLogs';
import TotalErrorLogs from '../components/TotalErrorLogs';
import InformationComponent from '../components/InformationComponent';

import { gridSpacing } from '../../../store/constant';

//-----------------------|| ADMIN DASHBOARD ||-----------------------//

const Dashboard = ({ isLoading }) => {

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid item lg={4} md={6} sm={6} xs={12}>
                        <TotalUsers isLoading={isLoading} />
                    </Grid>
                    <Grid item lg={4} md={6} sm={6} xs={12}>
                        <TotalVideos isLoading={isLoading} />
                    </Grid>
                    <Grid item lg={4} md={12} sm={12} xs={12}>
                        <Grid container spacing={gridSpacing}>
                            <Grid item sm={6} xs={12} md={6} lg={12}>
                                <TotalWatchLogs isLoading={isLoading} />
                            </Grid>
                            <Grid item sm={6} xs={12} md={6} lg={12}>
                                <TotalErrorLogs isLoading={isLoading} />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12} md={12}>
                        <InformationComponent isLoading={isLoading} />
                    </Grid>
                    {/*<Grid item xs={12} md={12}>*/}
                    {/*    <MoreDetailsSideComponent isLoading={isLoading} />*/}
                    {/*</Grid>*/}
                </Grid>
            </Grid>
        </Grid>
    );
};

const mapStateToProps = (state) => ({
    isLoading: state.authReducer.isLoading
});

export default connect(mapStateToProps, null)(Dashboard);

