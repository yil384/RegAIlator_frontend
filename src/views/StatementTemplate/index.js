import React from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { Button, IconButton, Typography, Tooltip } from '@material-ui/core';
import MainCard from '../../ui-component/cards/MainCard';
import { useTheme } from '@material-ui/styles';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import toast from 'react-hot-toast';

const StatementTemplate = () => {
    const theme = useTheme();

    const data = [
        { id: 1, regName: 'Reg 1', complianceStatement: 'Compliance statement for Reg 1', nonComplianceStatement: 'Non-compliance statement for Reg 1' },
        { id: 2, regName: 'Reg 2', complianceStatement: 'Compliance statement for Reg 2', nonComplianceStatement: 'Non-compliance statement for Reg 2' },
    ];

    const columns = [
        {
            field: 'regName',
            headerName: 'Reg Name',
            width: 200,
            renderCell: (params) => (
                <Tooltip title={params.row.regName} arrow>
                    <Typography noWrap>{params.row.regName}</Typography>
                </Tooltip>
            ),
        },
        {
            field: 'complianceStatement',
            headerName: 'Compliance Statement',
            width: 300,
            renderCell: (params) => (
                <Tooltip title={params.row.complianceStatement} arrow>
                    <IconButton
                        color="primary"
                        onClick={() => handleCopy(params.row.complianceStatement)}
                    >
                        <FileCopyIcon />
                    </IconButton>
                </Tooltip>
            ),
        },
        {
            field: 'nonComplianceStatement',
            headerName: 'Non-Compliance Statement',
            width: 300,
            renderCell: (params) => (
                <Tooltip title={params.row.nonComplianceStatement} arrow>
                    <IconButton
                        color="secondary"
                        onClick={() => handleCopy(params.row.nonComplianceStatement)}
                    >
                        <FileCopyIcon />
                    </IconButton>
                </Tooltip>
            ),
        },
    ];

    const handleCopy = (statement) => {
        navigator.clipboard.writeText(statement);
        toast.success('Statement copied to clipboard!');
    };

    return (
        <MainCard title="Statement Template" boxShadow shadow={theme.shadows[2]}>
            <div style={{ width: '100%', height: 400 }}>
                <DataGrid
                    rows={data}
                    columns={columns}
                    pageSize={5}
                    autoHeight
                    disableSelectionOnClick
                    components={{}}
                    loading={false}
                />
            </div>
        </MainCard>
    );
};

export default StatementTemplate;
