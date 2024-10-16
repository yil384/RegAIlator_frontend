import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import config from './../configs';
import toast from 'react-hot-toast'; // Import toast for notifications

const EmailListener = () => {

    useEffect(() => {
        const socket = io(config[config.env].baseURL, {
        path: '/socket.io', // Ensure the WebSocket path
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
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return null;
};

export default EmailListener;
