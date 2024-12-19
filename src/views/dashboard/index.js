import React from 'react';
import { connect } from 'react-redux';

import AdminDashboard from './AdminDashboard';
import RegAllatorDashboard from './RegAllatorDashboard';

const Dashboard = ({ isLoading, user }) => {
    if (isLoading) {
        return null;
    }
    switch (user.role) {
        case 'user':
            return <RegAllatorDashboard />;
        default:
            return <AdminDashboard />;
    }
};

const mapStateToProps = (state) => ({
    isLoading: state.authReducer.isLoading,
    user: state.authReducer.user
});

export default connect(mapStateToProps, null)(Dashboard);
