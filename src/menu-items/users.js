// assets
import { IconUsers, IconUserExclamation } from '@tabler/icons';
import { SupervisorAccountOutlined, PeopleOutline, BallotOutlined, FaceOutlined, ChromeReaderModeOutlined, ProductionQuantityLimitsOutlined } from '@material-ui/icons';
import SvgIcon from '@mui/material/SvgIcon';
import React from 'react';
import {ReactComponent as DeliveryIconSvg} from '../assets/images/delivery.svg';

function DeliveryIcon(props) {
    return (
      <SvgIcon {...props}>
        {/* 在这里嵌入你的 SVG */}
        <DeliveryIconSvg />
      </SvgIcon>
    );
  }
  
export function DeliveryOutlined() {
return <DeliveryIcon />;
}

export const adminMenu = {
    id: 'admin_users_menu',
    title: 'Accounts',
    caption: 'Praxi Users',
    type: 'group',
    children: [
        {
            id: 'users_menu',
            title: 'Explorer Users',
            type: 'collapse',
            icon: IconUsers,
            children: [
                {
                    id: 'users_menu_all',
                    title: 'All Users',
                    type: 'item',
                    url: '/users',
                    icon: PeopleOutline,
                    breadcrumbs: false
                },
            ]
        }
    ]
};

export const usersMenu = {
    id: 'users_menu',
    title: 'Accounts',
    caption: 'Praxi Users',
    type: 'group',
    children: [
        {
            id: 'menu_contacts',
            title: 'Contacts',
            type: 'item',
            url: '/users',
            icon: PeopleOutline,
            breadcrumbs: false
        }
    ]
};

export const productsMenu = {
    id: 'products_menu',
    title: 'Accounts',
    caption: 'Praxi Users',
    type: 'group',
    children: [
        {
            id: 'users_menu',
            title: 'Product',
            type: 'collapse',
            icon: ProductionQuantityLimitsOutlined,
            children: [
                {
                    id: 'menu_bill_of_materials',
                    title: 'Bill of Materials',
                    type: 'item',
                    url: '/bill-of-materials',
                    icon: DeliveryOutlined,
                    breadcrumbs: false
                }
            ]
        }
    ]
};
