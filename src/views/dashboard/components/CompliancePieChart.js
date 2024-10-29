import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import styled from 'styled-components';
import tinycolor from 'tinycolor2';

// Styled-components for better style management
const ChartContainer = styled.div`
    width: 100%;
    max-width: 500px;
    height: 400px;
    margin: 0 auto;
    text-align: center;
    background: #f9f9f9; // Added background color
    border: 1px solid #ccc; // Added border
    border-radius: 10px;
    padding: 20px; // Added padding to prevent content from touching edges
    overflow: visible; // Allow overflow for labels
`;

const Title = styled.h3`
    font-family: 'Arial, sans-serif';
    color: #333;
    margin-bottom: 0;
    bottom: 0;
`;

// Custom tooltip style
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div
                style={{
                    background: '#ffffff',
                    border: '1px solid #cccccc',
                    padding: '10px',
                    borderRadius: '5px',
                }}
            >
                <p style={{ margin: 0 }}>{`${payload[0].name}: ${payload[0].value}`}</p>
            </div>
        );
    }

    return null;
};

// Custom label renderer to adjust label positioning and color
const renderCustomizedLabel = (props) => {
    const {
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
        name,
        payload,
    } = props;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) / 2;
    const x = cx + 1.7 * radius * Math.cos(-midAngle * RADIAN);
    const y = cy + 1.7 * radius * Math.sin(-midAngle * RADIAN);

    // Access the original color from the payload
    const originalColor = payload.color;

    // Compute a darker shade of the color
    const labelColor = tinycolor(originalColor).darken(20).toString();

    return (
        <text
            x={x}
            y={y}
            fill={labelColor}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="14px"
        >
            {`${name}: ${payload.value} (${(percent * 100).toFixed(0)}%)`}
        </text>
    );    
};

const CompliancePieChart = ({ data, title }) => {
    // Enhanced color palette
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

    // Prepare the data with associated colors
    const preparedData = data.map((entry, index) => ({
        ...entry,
        color: COLORS[index % COLORS.length],
    }));

    // Fixed total to keep size consistent
    const total = 100;

    return (
        <ChartContainer>
            <Title>{title}</Title>
            <ResponsiveContainer>
                <PieChart margin={{ top: 0, right: 40, bottom: 40, left: 40 }}>
                    <Pie
                        data={preparedData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={total} // Adjusted to a fixed size
                        fill="#8884d8"
                        labelLine={false}
                        label={renderCustomizedLabel} // Using custom label renderer
                        stroke="#fff" // Added stroke for borders between slices
                        strokeWidth={1}
                        animationDuration={800}
                    >
                        {preparedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
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
