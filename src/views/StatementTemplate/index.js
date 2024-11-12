import React, { useState, useEffect } from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { Typography, Tooltip } from '@material-ui/core';
import MainCard from '../../ui-component/cards/MainCard';
import { useTheme } from '@material-ui/styles';
import toast from 'react-hot-toast';

// Import function to fetch compliance data
import { fetchVideos } from '../videos/videos.helper'; // Adjust the path as necessary

const StatementTemplate = () => {
    const theme = useTheme();
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch compliance data
                const complianceResponse = await fetchVideos();
                const complianceFiles = complianceResponse?.results || [];

                // Process compliance data
                const regulationMap = {}; // Key: regulation name, Value: { compliant: [], notCompliant: [], unclear: [] }

                for (const file of complianceFiles) {
                    const fileName = file.title || 'Unknown File';
                    const data = file.json?.data || [];

                    for (const item of data) {
                        const regulation = item['Regulation or substance name'] || '';
                        let complianceStatus = item['Compliant conclusion\n(Compliant, not compliant, not applicable or unclear)'] || item['Compliant conclusion'] || '';

                        // Normalize complianceStatus
                        complianceStatus = complianceStatus.toLowerCase();
                        let statusKey = '';
                        if (complianceStatus.includes('compliant') && !complianceStatus.includes('not compliant')) {
                            statusKey = 'Compliant';
                        } else if (complianceStatus.includes('not compliant')) {
                            statusKey = 'Not Compliant';
                        } else if (complianceStatus.includes('unclear')) {
                            statusKey = 'Unclear';
                        } else {
                            statusKey = 'Unclear'; // Default to 'Unclear' if status is not recognized
                        }

                        if (!regulation) continue; // Skip if regulation is missing

                        if (!regulationMap[regulation]) {
                            regulationMap[regulation] = {
                                'Compliant': new Set(),
                                'Not Compliant': new Set(),
                                'Unclear': new Set(),
                            };
                        }

                        regulationMap[regulation][statusKey].add(fileName);
                    }
                }

                // Build rows
                const rows = Object.entries(regulationMap).map(([regulation, statuses], index) => {
                    const row = {
                        id: index,
                        regName: regulation,
                        Compliant: Array.from(statuses['Compliant']).join(', '),
                        'Not Compliant': Array.from(statuses['Not Compliant']).join(', '),
                        Unclear: Array.from(statuses['Unclear']).join(', '),
                    };
                    return row;
                });

                setRows(rows);

            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Error fetching data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const columns = [
        {
            field: 'regName',
            headerName: 'Regulation Name',
            width: 300,
            renderCell: (params) => (
                <Tooltip title={params.value} arrow>
                    <Typography noWrap>{params.value}</Typography>
                </Tooltip>
            ),
        },
        {
            field: 'Compliant',
            headerName: 'Compliant Files',
            width: 300,
            renderCell: (params) => (
                <Tooltip title={params.value} arrow>
                    <Typography noWrap color={'primary'}>{params.value}</Typography>
                </Tooltip>
            ),
        },
        {
            field: 'Not Compliant',
            headerName: 'Not Compliant Files',
            width: 300,
            renderCell: (params) => (
                <Tooltip title={params.value} arrow>
                    <Typography noWrap color={'second'}>{params.value}</Typography>
                </Tooltip>
            ),
        },
        {
            field: 'Unclear',
            headerName: 'Unclear Files',
            width: 300,
            renderCell: (params) => (
                <Tooltip title={params.value} arrow>
                    <Typography noWrap color={'error'}>{params.value}</Typography>
                </Tooltip>
            ),
        },
    ];

    return (
        <MainCard title="Statement Template" boxShadow shadow={theme.shadows[2]}>
            <div style={{ width: '100%', height: 600 }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={10}
                    autoHeight
                    disableSelectionOnClick
                    loading={isLoading}
                />
            </div>
        </MainCard>
    );
};

export default StatementTemplate;
