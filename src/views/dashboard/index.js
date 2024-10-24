import React from 'react';
import { connect } from 'react-redux';

import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';

const Dashboard = ({ isLoading, user }) => {
    if (isLoading) {
        return null;
    }
    switch (user.role) {
        case 'user':
            return <StudentDashboard />;
        default:
            return <AdminDashboard />;
    }
};

const mapStateToProps = (state) => ({
    isLoading: state.authReducer.isLoading,
    user: state.authReducer.user
});

export default connect(mapStateToProps, null)(Dashboard);

