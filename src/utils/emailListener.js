// emailListener.js

import React, { useEffect } from 'react';
import io from 'socket.io-client';
import { useDispatch } from 'react-redux'; // 引入 useDispatch
import config from './../configs';
import toast from 'react-hot-toast';

const EmailListener = () => {
    const dispatch = useDispatch(); // 获取 dispatch

    useEffect(() => {
        const socket = io(config[config.env].baseURL, {
            path: '/socket.io',
        });

        // 初始邮件
        socket.on('initialEmails', (initialEmails) => {
            console.log('Received initial emails:', initialEmails);
            for (const email of initialEmails) {
                toast.success(`Initial Email from: ${email.from.text}`, {
                    position: 'top-right',
                });
            }
        });

        // 监听新邮件
        socket.on('newEmail', (email) => {
            console.log('Received new email:', email);
            toast.success(`New Email from: ${email.from.text}`, {
                position: 'top-right',
            });

            // 派发 Redux Action
            dispatch({ type: 'EMAIL_RECEIVED' });
        });

        // 组件卸载时清理
        return () => {
            socket.disconnect();
        };
    }, [dispatch]);

    return null;
};

export default EmailListener;
