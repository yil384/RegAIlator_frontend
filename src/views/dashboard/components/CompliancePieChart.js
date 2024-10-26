import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const CompliancePieChart = ({ data, title }) => {
    const COLORS = ['#0088FE', '#FF8042'];

    return (
        <div style={{ textAlign: 'center' }}>
            <h3>{title}</h3>
            <PieChart width={250} height={250}>
                <Pie
                    data={data}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </div>
    );
};

export default CompliancePieChart;
