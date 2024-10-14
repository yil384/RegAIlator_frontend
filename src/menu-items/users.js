// assets
import { IconUsers, IconUserExclamation } from '@tabler/icons';
import { SupervisorAccountOutlined, PeopleOutline, BallotOutlined, FaceOutlined, ChromeReaderModeOutlined } from '@material-ui/icons';
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
    id: 'users_menu',
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
            id: 'users_menu',
            title: 'Product',
            type: 'collapse',
            icon: BallotOutlined,
            children: [
                {
                    id: 'menu_suppliers',
                    title: 'Suppliers',
                    type: 'item',
                    url: '/students',
                    icon: SupervisorAccountOutlined,
                    breadcrumbs: false
                },
                {
                    id: 'menu_templates',
                    title: 'Survey Templates',
                    type: 'item',
                    url: '/survey-templates',
                    icon: ChromeReaderModeOutlined,
                    breadcrumbs: false
                },
                {
                    id: 'menu_contacts',
                    title: 'Bill of Materials',
                    type: 'item',
                    url: '/instructors',
                    icon: DeliveryOutlined,
                    breadcrumbs: false
                }
            ]
        }
    ]
};
