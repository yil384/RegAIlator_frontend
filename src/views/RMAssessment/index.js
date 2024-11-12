import React, { useState, useEffect } from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { Typography, Tooltip } from '@material-ui/core';
import MainCard from '../../ui-component/cards/MainCard';
import { useTheme } from '@material-ui/styles';
import toast from 'react-hot-toast';

// Import functions to fetch materials and compliance data
import { fetchBillOfMaterials } from '../billOfMatetrial/helper'; // Adjust the path as necessary
import { fetchVideos } from '../videos/videos.helper'; // Adjust the path as necessary

const RMAssessment = () => {
    const theme = useTheme();
    const [selectedIds, setSelectedIds] = useState([]);

    // State variables
    const [materials, setMaterials] = useState([]);
    const [complianceData, setComplianceData] = useState([]);
    const [regulations, setRegulations] = useState([]);
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch materials and compliance data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch materials
                const materialsResponse = await fetchBillOfMaterials();
                const materialsData = materialsResponse?.results || [];

                // Fetch compliance data
                const complianceResponse = await fetchVideos(); // Assuming fetchVideos fetches the files data
                const complianceDataTemp = complianceResponse?.results || [];

                // 从 complianceDataTemp 中提取出需要的数据
                let complianceData = [];
                for (let i = 0; i < complianceDataTemp.length; i++) {
                    const file = complianceDataTemp[i];
                    const data = file.json?.data || [];
                    complianceData = complianceData.concat(data);
                }

                setMaterials(materialsData);
                setComplianceData(complianceData);

                console.log('Materials:', materialsData);
                console.log('Compliance Data:', complianceData);

                // Process complianceData
                const regulationsSet = new Set();
                const complianceMap = {}; // Key: materialKey (Product Name + Material Name), Value: {regulation: status}

                complianceData.forEach(item => {
                    const supplierName = item['Supplier name'] || item['supplierName'] || '';
                    const materialName = item['Raw material name'] || item['rawMaterialName'] || item['Raw Material Name'] || '';
                    const regulation = item['Regulation or substance name'] || '';
                    const complianceStatus = item['Compliant conclusion\n(Compliant, not compliant, not applicable or unclear)'] || item['Compliant conclusion'] || '';

                    // 遇到不合法的数据就跳过这个数据
                    if (!supplierName || !materialName || !regulation || !complianceStatus) {
                        console.log('Invalid data:', item);
                        return;
                    }

                    // Build materialKey
                    // const materialKey = `${supplierName}||${materialName}`;
                    const materialKey = materialName; // 只用 materialName 作为 key

                    if (!complianceMap[materialKey]) {
                        complianceMap[materialKey] = {};
                    }
                    complianceMap[materialKey][regulation] = complianceStatus;

                    // Add to regulationsSet
                    if (regulation) {
                        regulationsSet.add(regulation);
                    }
                });

                // console.log('Compliance Map:', complianceMap);

                const regulationsArray = Array.from(regulationsSet);

                // Now build rows
                const rows = materialsData.map((material, index) => {
                    const productName = material.productName || '';
                    const supplierName = material.supplierName || '';
                    const materialName = material.rawMaterialName || '';

                    // const materialKey = `${supplierName}||${materialName}`;
                    const materialKey = materialName; // 只用 materialName 作为 key

                    const row = {
                        id: material.id || index,
                        productName: productName,
                        materialName: materialName,
                    };

                    regulationsArray.forEach(regulation => {
                        const status = complianceMap[materialKey]?.[regulation] || '';
                        row[regulation] = status;
                    });

                    return row;
                });

                setRegulations(regulationsArray);
                setRows(rows);

                console.log('Regulations:', regulationsArray);
                console.log('Rows:', rows);

            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Error fetching data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Build columns
    const columns = [
        {
            field: 'productName',
            headerName: 'Product Name',
            width: 200,
            renderCell: (params) => (
                <Tooltip title={params.value}>
                    <Typography noWrap>{params.value}</Typography>
                </Tooltip>
            ),
        },
        {
            field: 'materialName',
            headerName: 'Material Name',
            width: 200,
            renderCell: (params) => (
                <Tooltip title={params.value}>
                    <Typography noWrap>{params.value}</Typography>
                </Tooltip>
            ),
        },
        // Dynamically add columns for each regulation
        ...regulations.map(regulation => ({
            field: regulation,
            headerName: regulation,
            // width 和 regulation 的长度有关，可以根据需要调整
            width: regulation.length * 8 + 80,
            renderCell: (params) => {
                const status = params.value;
                let color = 'textPrimary';
                if (status.toLowerCase().includes('compliant')) {
                    color = 'primary';
                } else if (status.toLowerCase().includes('not compliant')) {
                    color = 'secondary';
                } else if (status.toLowerCase().includes('unclear')) {
                    color = 'error';
                }
                return (
                    <Typography color={color}>{status}</Typography>
                );
            },
        })),
    ];

    return (
        <MainCard title="RM Assessment" boxShadow shadow={theme.shadows[2]}>
            <div style={{ width: '100%', height: 600 }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={10}
                    autoHeight
                    checkboxSelection={false}
                    disableSelectionOnClick
                    loading={isLoading}
                />
            </div>
        </MainCard>
    );
};

export default RMAssessment;
