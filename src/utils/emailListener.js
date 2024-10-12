import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import config from './../configs';

const EmailListener = () => {
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    // FIXME: 请将服务器地址替换为实际的服务器地址
    const socket = io(config[config.env].baseURL, {
        path: '/socket.io',  // 确保使用 WebSocket 的路径代理
        });   

    // 监听服务器发送的初始化邮件数据
    socket.on('initialEmails', (initialEmails) => {
      console.log('Received initial emails:', initialEmails);
      setEmails((prevEmails) => {
        // 去重：检查是否已有相同的 _id
        const emailIds = new Set(prevEmails.map(email => email._id));
        const uniqueEmails = initialEmails.filter(email => !emailIds.has(email._id));
        return [...uniqueEmails, ...prevEmails];
      });
    });

    // 监听新邮件的 WebSocket 消息
    socket.on('newEmail', (email) => {
      console.log('Received new email:', email);
      setEmails((prevEmails) => {
        // 去重：如果已有相同的 _id，忽略该邮件
        if (prevEmails.some(existingEmail => existingEmail._id === email._id)) {
          return prevEmails;
        }
        return [email, ...prevEmails]; // 将新邮件添加到顶部
      });
    });

    // 组件卸载时，断开 WebSocket 连接
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>New Emails</h1>
      <ul>
        {emails.map((email, index) => (
          <li key={email._id || index}>
            <strong>From:</strong> {email.from} <br />
            <strong>Subject:</strong> {email.subject} <br />
            <strong>Date:</strong> {new Date(email.date).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmailListener;
