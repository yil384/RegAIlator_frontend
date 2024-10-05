import React from 'react';
import { connect } from 'react-redux';

import { Grid } from '@material-ui/core';

import { gridSpacing } from '../../../store/constant';

import TotalVideos from '../components/TotalVideos';
import TotalVideoGroups from '../components/TotalVideoGroups';
import InformationComponent from '../components/InformationComponent';
import TotalWatchLogs from '../components/TotalWatchLogs';
import MoreDetailsSideComponent from '../components/MoreDetailsSideComponent';
// import MoreDetailsSideComponent from '../components/MoreDetailsSideComponent';

const StudentDashboard = ({ isLoading }) => {

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                {/*<Grid container spacing={gridSpacing}>*/}
                {/*    <Grid item lg={4} md={6} sm={6} xs={12}>*/}
                {/*        <TotalVideoGroups isLoading={isLoading} />*/}
                {/*    </Grid>*/}
                {/*    <Grid item lg={4} md={6} sm={6} xs={12}>*/}
                {/*        <TotalVideos isLoading={isLoading} />*/}
                {/*    </Grid>*/}
                {/*    <Grid item xs={12} md={4}>*/}
                {/*        <MoreDetailsSideComponent isLoading={isLoading} />*/}
                {/*    </Grid>*/}
                {/*</Grid>*/}
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
        </Grid>
    );
};

const mapStateToProps = (state) => ({
    isLoading: state.authReducer.isLoading
});

export default connect(mapStateToProps, null)(StudentDashboard);
