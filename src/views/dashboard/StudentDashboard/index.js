import React from 'react';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import { gridSpacing } from '../../../store/constant';
import LoaderInnerCircular from '../../../ui-component/LoaderInnerCircular';
import { fetchSuppliers } from '../../../views/suppliers/helper';
import { fetchSurveys } from '../../../views/survey-templates/helper'; // 需要实现这个函数
import CompliancePieChart from '../components/CompliancePieChart'; // 导入饼图组件

const StudentDashboard = ({ isLoading }) => {
    const [suppliersData, setSuppliersData] = React.useState([]);
    const [productsData, setProductsData] = React.useState([
        { name: 'Compliant', value: 11 },
        { name: 'Not Compliant', value: 89 },
    ]);
    const [surveysChartData, setSurveysChartData] = React.useState([]); // 新增的状态
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        const getData = async () => {
            try {
                const suppliers = await fetchSuppliers();
                const surveys = await fetchSurveys(); // 需要实现 fetchSurveys 函数

                // 处理供应商数据，用于第一个饼图
                const processedSuppliersData = processSupplierData(suppliers);
                setSuppliersData(processedSuppliersData);

                // 处理调查数据，生成新增的饼图数据
                const processedSurveysChartData = processSurveysChartData(suppliers, surveys);
                setSurveysChartData(processedSurveysChartData);
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

        getData();
        // getProductsData();
    }, []);

    const processSupplierData = (suppliers) => {
        // 示例：统计供应商有无反馈的数量
        const statusCount = suppliers.reduce((acc, supplier) => {
            const status = supplier.feedback?.length ? 'With Feedback' : 'Without Feedback';
            return {
                ...acc,
                [status]: acc[status] ? acc[status] + 1 : 1,
            };
        }, {});

        // 转换为适合 Recharts 的数据格式
        return Object.keys(statusCount).map((key) => ({
            name: key,
            value: statusCount[key],
        }));
    };

    const processSurveysChartData = (suppliers, surveys) => {
        // 创建调查 ID 到调查名称的映射
        const surveyMap = {};
        surveys.forEach((survey) => {
            surveyMap[survey._id] = survey.name;
        });

        // 按照调查 ID 对供应商进行分组
        const surveySuppliersMap = {};
        suppliers.forEach((supplier) => {
            const surveyId = supplier.chooseSurvey;
            if (surveys.find((survey) => survey._id === surveyId)) {
                if (!surveySuppliersMap[surveyId]) {
                    surveySuppliersMap[surveyId] = [];
                }
                surveySuppliersMap[surveyId].push(supplier);
            }
        });

        // 为每个调查生成饼图数据
        const surveysChartData = Object.keys(surveySuppliersMap).map((surveyId) => {
            const suppliersForSurvey = surveySuppliersMap[surveyId];
            const statusCount = suppliersForSurvey.reduce((acc, supplier) => {
                const status = supplier.feedback?.length ? 'With Feedback' : 'Without Feedback';
                return {
                    ...acc,
                    [status]: acc[status] ? acc[status] + 1 : 1,
                };
            }, {});

            const data = Object.keys(statusCount).map((key) => ({
                name: key,
                value: statusCount[key],
            }));

            return {
                surveyId,
                surveyName: surveyMap[surveyId] || 'Unknown Survey',
                data,
            };
        });

        return surveysChartData;
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
                <Grid container spacing={gridSpacing}>
                    {/* 第一个饼图：供应商合规性 */}
                    <Grid item xs={12} md={6}>
                        <CompliancePieChart data={suppliersData} title="Suppliers Compliance" />
                    </Grid>
                    {/* 第二个饼图：产品合规性 */}
                    <Grid item xs={12} md={6}>
                        <CompliancePieChart data={productsData} title="Products Compliance" />
                    </Grid>
                    {/* 新增的 n 个饼图 */}
                    {surveysChartData.map((chartItem) => (
                        <Grid item xs={12} md={6} key={chartItem.surveyId}>
                            <CompliancePieChart data={chartItem.data} title={`Suppliers Compliance (Survey: ${chartItem.surveyName})`} />
                        </Grid>
                    ))}
                </Grid>
            </Grid>
        </Grid>
    );
};

const mapStateToProps = (state) => ({
    isLoading: state.authReducer.isLoading,
});

export default connect(mapStateToProps, null)(StudentDashboard);
