import React from 'react';
import { connect } from 'react-redux';

import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';

const Dashboard = ({ isLoading, user }) => {
    // const userRole = user.role;
    // switch (userRole) {
    //     case 'student':
    //         return <StudentDashboard />;
    //     default:
    //         return <AdminDashboard />;
    // }

    return <AdminDashboard/ >;
};

const mapStateToProps = (state) => ({
    isLoading: state.authReducer.isLoading,
    user: state.authReducer.user
});

export default connect(mapStateToProps, null)(Dashboard);

