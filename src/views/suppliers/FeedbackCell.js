// FeedbackCell.jsx
import React, { useState } from 'react';
import { Typography, Tooltip, IconButton, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { NotificationsActive, Add as AddIcon } from '@mui/icons-material';
import { updateSupplier } from './helper'; // 确保路径正确
import Box from '@mui/material/Box';

// 计算剩余时间，返回一个友好的格式
const calculateTimeLeft = (nextSendTime) => {
    const now = new Date();
    let timeDifference = new Date(nextSendTime) - now;

    // 前缀后缀设置为 “in” 或 “ago” 取决于时间差是否小于等于0
    const prefix = timeDifference > 0 ? 'Next email in' : 'Emailed';
    const suffix = timeDifference > 0 ? '' : 'ago';
    timeDifference = Math.abs(timeDifference);

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

    let timeLeft = '';
    if (days === 0 && hours === 0) {
        timeLeft = `${minutes}m`;
    } else if (days === 0) {
        timeLeft = `${hours}h ${minutes}m`;
    } else {
        timeLeft = `${days}d ${hours}h`;
    }
    return prefix + ' ' + timeLeft + ' ' + suffix;
};

// 定义标签列表
let tagList = [];

// // 生成颜色的方法（基于 tagList 的长度）
// const generateColor = (length) => {
//     // 使用长度生成颜色，通过映射长度到 HSL 色彩空间
//     const h = (length * 37) % 360; // 色相 0-360，37 是一个素数，用于均匀分布
//     const s = 70; // 饱和度固定为 70%
//     const l = 50; // 亮度固定为 50%
//     return `hsl(${h}, ${s}%, ${l}%)`; // 返回 HSL 颜色
// };

// 生成颜色的方法
const generateColor = (tag) => {
    // 简单的哈希函数，将字符串转成一个数值
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash); // 左移位
        hash = hash & hash; // 保持 32 位整数
    }
    // 转为 HSL 色彩空间，确保颜色均匀分布
    const h = Math.abs(hash) % 360; // 色相 0-360
    const s = 70 + (hash % 20); // 饱和度 70%-90%
    const l = 50 + (hash % 10); // 亮度 50%-60%
    return `hsl(${h}, ${s}%, ${l}%)`; // 返回 HSL 颜色
};

// 为每个反馈项渲染标签
const renderTags = (tags) => {
    return tags.map((tag, index) => {
        if (!tag) {
            return null;
        }
        const tagText = tagList.find((t) => t.tag === tag)?.text;
        if (!tagText) {
            // generate a new color for the tag based on the length of the tagList
            tagList.push({ tag, text: `${tag}`, color: generateColor(tag) });
        }
        const tagColor = tagList.find((t) => t.tag === tag)?.color;

        return (
            <Box
                key={index}
                style={{
                    display: 'inline-flex', // 使用 inline-flex 使其能在行内显示
                    alignItems: 'center', // 垂直居中
                    justifyContent: 'center', // 水平居中
                    padding: '4px 12px', // 上下左右的内边距，避免文本贴边
                    margin: '0 4px', // 每个标签之间的间距
                    height: '100%',
                    borderRadius: '12px', // 设置圆角
                    backgroundColor: tagColor, // 标签背景颜色
                    color: 'white', // 白色字体
                    fontSize: '12px', // 标签文字大小
                    fontWeight: 'bold', // 标签文字加粗
                    textAlign: 'center' // 确保文字居中
                }}
            >
                {tagText}
            </Box>
        );
    });
};

const FeedbackCell = (props) => {
    const { feedbackArray, nextSendTime, supplierId, isEmailSent, handleOpenDialogFeedback, refreshData } = props;
    const [open, setOpen] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setNewTag('');
        setError('');
    };

    const handleAddTag = async () => {
        if (!newTag.trim()) {
            setError('标签不能为空');
            return;
        }

        setLoading(true);
        try {
            if (feedbackArray.find((f) => f.tags.includes(newTag.trim()))) {
                setError('标签已存在');
                return;
            }
            // 构造新的标签数组
            feedbackArray.forEach((f) => {
                f.tags.push(newTag.trim());
            });
            // 调用后端更新供应商的反馈标签
            await updateSupplier(supplierId, { feedback: feedbackArray });
            // 刷新数据（假设有一个 refreshData 函数传递进来用于刷新表格数据）
            await refreshData();
            handleClose();
        } catch (err) {
            console.error(err);
            setError('添加标签失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ width: '100%', cursor: 'pointer' }}>
            <div onClick={() => handleOpenDialogFeedback(feedbackArray, supplierId, nextSendTime)}>
                {feedbackArray.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" noWrap>
                            {`Feedbacks (${feedbackArray.length})`}
                        </Typography>
                        {/* 加号按钮 */}
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation(); // 阻止触发父级点击事件
                                handleClickOpen();
                            }}
                        >
                            <AddIcon fontSize="small" />
                        </IconButton>
                        <div
                            style={{
                                alignItems: 'center',
                                display: 'flex',
                                height: '30px'
                            }}
                        >
                            {renderTags(feedbackArray[0].tags)}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" noWrap>
                            No Feedback
                        </Typography>
                        {nextSendTime && (
                            <Tooltip title={`${calculateTimeLeft(nextSendTime)}`}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <NotificationsActive style={{ marginLeft: 8, color: isEmailSent ? '#4caf50' : '#ff9800' }} />
                                    <Typography variant="body2" color="textSecondary" style={{ marginLeft: 8 }}>
                                        {`- ${calculateTimeLeft(nextSendTime)}`}
                                    </Typography>
                                </div>
                            </Tooltip>
                        )}
                    </div>
                )}
            </div>
            {/* 添加标签对话框 */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>添加新标签</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="标签"
                        type="text"
                        fullWidth
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        error={!!error}
                        helperText={error}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        取消
                    </Button>
                    <Button onClick={handleAddTag} color="primary" disabled={loading}>
                        添加
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default FeedbackCell;
