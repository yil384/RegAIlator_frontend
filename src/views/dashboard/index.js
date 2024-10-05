import React from 'react';
import { connect } from 'react-redux';

import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';
import InstructorDashboard from './InstructorDashboard';

const Dashboard = ({ isLoading, user }) => {
    const userRole = user.role;

    switch (userRole) {
        case 'student':
            return <StudentDashboard />;
        case 'instructor':
            return <InstructorDashboard />;
        default:
            return <AdminDashboard />;
    }
};

const mapStateToProps = (state) => ({
    isLoading: state.authReducer.isLoading,
    user: state.authReducer.user
});

export default connect(mapStateToProps, null)(Dashboard);

