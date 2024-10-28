import React from 'react';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import { gridSpacing } from '../../../store/constant';
import LoaderInnerCircular from '../../../ui-component/LoaderInnerCircular';
import { fetchSuppliers } from '../../../views/suppliers/helper';
import CompliancePieChart from '../components/CompliancePieChart'; // Import the pie chart component

const StudentDashboard = ({ isLoading }) => {
    const [suppliersData, setSuppliersData] = React.useState([
        { name: 'With Feedback', value: 45 },
        { name: 'Without Feedback', value: 55 },
    ]);
    const [productsData, setProductsData] = React.useState([
        { name: 'Compliant', value: 11 },
        { name: 'Not Compliant', value: 89 },
    ]);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        const getSuppilersData = async () => {
            try {
                const suppliers = await fetchSuppliers();
                // 处理数据以适应饼图（例如按类别或状态统计）
                const processedData = processSupplierData(suppliers);
                setSuppliersData(processedData);
            } catch (error) {
                console.error('Error:', error);
                setError(error);
            }
        };

        // const getProductsData = async () => {
        //     try {
        //         const response = await fetch(`${config.httpURL}/compliance/products`);
        //         const data = await response.json();
        //         setProductsData(data);
        //         setIsLoading(false);
        //     } catch (error) {
        //         console.error('Error:', error);
        //         setError(error);
        //     } finally {
        //         setIsLoading(false);
        //     }
        // };

        getSuppilersData();
        // getProductsData();

    }, []);

    const processSupplierData = (suppliers) => {
        console.log('suppliers:', suppliers);
        // 示例：按是否有feedback统计
        const statusCount = suppliers.reduce((acc, supplier) => {
            const status = supplier.feedback?.length ? 'With Feedback' : 'Without Feedback';
            return {
                ...acc,
                [status]: acc[status] ? acc[status] + 1 : 1,
            };
        }, {});

        // 转换为适合 Recharts 的数组格式
        return Object.keys(statusCount).map((key) => ({
            name: key,
            value: statusCount[key],
        }));
    };

    if (isLoading) {
        return <LoaderInnerCircular />;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Grid item xs={12}>
                    <Grid container spacing={gridSpacing}>
                        <Grid item xs={12} md={6}>
                            <CompliancePieChart data={suppliersData} title="Suppliers Compliance" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <CompliancePieChart data={productsData} title="Products Compliance" />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

const mapStateToProps = (state) => ({
    isLoading: state.authReducer.isLoading
});

export default connect(mapStateToProps, null)(StudentDashboard);
