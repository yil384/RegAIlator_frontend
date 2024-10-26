import React from 'react';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import { gridSpacing } from '../../../store/constant';
import CompliancePieChart from '../components/CompliancePieChart'; // Import the pie chart component

const StudentDashboard = ({ isLoading }) => {
    // Sample data for pie charts
    const suppliersData = [
        { name: 'Compliant', value: 40 },
        { name: 'Not Compliant', value: 60 },
    ];

    const productsData = [
        { name: 'Compliant', value: 45 },
        { name: 'Not Compliant', value: 55 },
    ];

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Grid item xs={12}>
                    <Grid container spacing={gridSpacing}>
                        <Grid item xs={12} md={6}>
                            <CompliancePieChart data={suppliersData} title="Suppliers Compliance" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <CompliancePieChart data={productsData} title="Products Compliance" />
                        </Grid>
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
