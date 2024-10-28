import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';

// 使用 styled-components 进行更好的样式管理
const ChartContainer = styled.div`
    width: 100%;
    max-width: 500px;
    height: 400px;
    margin: 0 auto;
    text-align: center;
`;

const Title = styled.h3`
    font-family: 'Arial, sans-serif';
    color: #333;
    margin-bottom: 20px;
`;

// 自定义工具提示样式
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: '#ffffff',
                border: '1px solid #cccccc',
                padding: '10px',
                borderRadius: '5px',
            }}>
                <p style={{ margin: 0 }}>{`${payload[0].name}: ${payload[0].value}`}</p>
            </div>
        );
    }

    return null;
};

const CompliancePieChart = ({ data, title }) => {
    // 更丰富的颜色调色板
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

    // 计算总数以动态调整大小
    // const total = data.reduce((acc, cur) => acc + cur.value, 0);
    const total = 60; // 大小不变

    return (
        <ChartContainer>
            <Title>{title}</Title>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={Math.min(200, total > 0 ? 80 + total * 0.5 : 80)}
                        fill="#8884d8"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        animationDuration={800}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
};

export default CompliancePieChart;
