import React from 'react';
import { connect } from 'react-redux';

// material-ui
import { Typography } from '@material-ui/core';

// project imports
import NavGroup from './NavGroup';
import {
    adminMenuItems,
    instructorMenuItems,
    studentMenuItems,
    defaultMenuItems
} from './../../../../menu-items';

//-----------------------|| SIDEBAR MENU LIST ||-----------------------//

const MenuList = ({ session_user }) => {
    let menuItems = defaultMenuItems;

    // FIXME: Uncomment this code when the role is implemented
    // if (session_user.role === 'admin') {
    //     menuItems = adminMenuItems;
    // }

    const navItems = menuItems.items.map((item) => {
        switch (item.type) {
            case 'group':
                return <NavGroup key={item.id} item={item} />;
            default:
                return (
                    <Typography key={item.id} variant="h6" color="error" align="center">
                        Menu Items Error
                    </Typography>
                );
        }
    });

    return navItems;
};

const mapStateToProps = (state) => ({
    session_user: state.authReducer.user,
});

export default connect(mapStateToProps, null)(MenuList);
