// emailListener.js

import React, { useEffect } from 'react';
import io from 'socket.io-client';
import { useDispatch } from 'react-redux'; // Import useDispatch
import config from './../configs';
import toast from 'react-hot-toast';

const EmailListener = () => {
    const dispatch = useDispatch(); // Get dispatch

    useEffect(() => {
        const socket = io(config[config.env].baseURL, {
            path: '/socket.io',
        });

        // Initial emails
        socket.on('initialEmails', (initialEmails) => {
            console.log('Received initial emails:', initialEmails);
            for (const email of initialEmails) {
                toast.success(`Initial Email from: ${email.from.text}`, {
                    position: 'top-right',
                });
            }
        });

        // Listen for new emails
        socket.on('newEmail', (email) => {
            console.log('Received new email:', email);
            toast.success(`New Email from: ${email.from.text}`, {
                position: 'top-right',
            });

            // Dispatch Redux Action
            dispatch({ type: 'EMAIL_RECEIVED' });
        });

        // Cleanup on component unmount
        return () => {
            socket.disconnect();
        };
    }, [dispatch]);

    return null;
};

export default EmailListener;
