import React, { useState, useCallback } from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { Button, IconButton, Checkbox, Typography, Tooltip } from '@material-ui/core';
import MainCard from '../../ui-component/cards/MainCard';
import { useTheme } from '@material-ui/styles';
import toast from 'react-hot-toast';

const RMAssessment = () => {
    const theme = useTheme();
    const [selectedIds, setSelectedIds] = useState([]);

    const data = [
        { id: 1, product: 'Product XX', reg1: '❌', reg2: '✅', reg3: '❌', action: 'Statement' },
        { id: 2, product: 'RM1', reg1: '✅', reg2: '❌', reg3: '❌', action: 'Summary' },
        { id: 3, product: 'RM2', reg1: '❌', reg2: '✅', reg3: '✅', action: 'Summary' },
        { id: 4, product: 'RM3', reg1: '✅', reg2: '✅', reg3: '✅', action: 'Summary' }
    ];

    const handleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSelectAll = () => {
        if (selectedIds.length === data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(data.map((row) => row.id));
        }
    };

    const columns = [
        {
            field: 'select',
            headerName: (
                <Checkbox
                    checked={selectedIds.length === data.length}
                    indeterminate={selectedIds.length > 0 && selectedIds.length < data.length}
                    onChange={handleSelectAll}
                />
            ),
            width: 60,
            sortable: false,
            renderCell: (params) => (
                <Checkbox
                    checked={selectedIds.includes(params.row.id)}
                    onChange={() => handleSelect(params.row.id)}
                />
            ),
        },
        {
            field: 'product',
            headerName: 'Product',
            width: 200,
            renderCell: (params) => (
                <Tooltip title={params.row.product}>
                    <Typography noWrap>{params.row.product}</Typography>
                </Tooltip>
            ),
        },
        { field: 'reg1', headerName: 'Reg 1', width: 100 },
        { field: 'reg2', headerName: 'Reg 2', width: 100 },
        { field: 'reg3', headerName: 'Reg 3', width: 100 },
        {
            field: 'action',
            headerName: 'Action',
            width: 150,
            renderCell: (params) => (
                <Button variant="contained" color="primary">
                    {params.row.action}
                </Button>
            ),
        },
    ];

    const handleSendSurvey = () => {
        if (selectedIds.length === 0) {
            toast.error('Please select at least one product or raw material.');
            return;
        }
        toast.success('Surveys sent successfully!');
    };

    const handleDownloadStatement = () => {
        if (selectedIds.length === 0) {
            toast.error('Please select at least one product or raw material.');
            return;
        }
        toast.success('Statements downloaded successfully!');
    };

    return (
        <MainCard title="RM Assessment" boxShadow shadow={theme.shadows[2]}>
            <div style={{ width: '100%', height: 400 }}>
                <DataGrid
                    rows={data}
                    columns={columns}
                    pageSize={5}
                    autoHeight
                    checkboxSelection={false}
                    disableSelectionOnClick
                    components={{}}
                    loading={false}
                />
            </div>
            <div style={{ display: 'flex', marginTop: 16 }}>
                <Button
                    variant="contained"
                    color="primary"
                    style={{ marginRight: 10 }}
                    onClick={handleSendSurvey}
                >
                    Send out survey
                </Button>
                <Button variant="contained" color="secondary" onClick={handleDownloadStatement}>
                    Download Statement
                </Button>
            </div>
        </MainCard>
    );
};

export default RMAssessment;
