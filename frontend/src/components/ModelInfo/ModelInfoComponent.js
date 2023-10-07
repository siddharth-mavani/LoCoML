import { Typography, Button, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody, Box, Chip } from "@mui/material";
import axios from "axios";
import React, { useEffect } from "react";
import { Col, Row, Button as ReactStrapButton } from "reactstrap";
import { Table as ReactStrapTable } from "reactstrap";
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import ConfusionMatrix from "components/Charts/Classification/ConfusionMatrix";
import FeatureImportance from "components/Charts/Classification/FeatureImportance";
import PrecisionRecall from "components/Charts/Classification/PrecisionRecall";
import RocCurve from "components/Charts/Classification/RocCurve";
import ScatterPlot from "components/Charts/Regression/ScatterPlot";
import ResidualPlot from "components/Charts/Regression/ResidualPlot";

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

function ModelInfoComponent(props) {

    const modelDetails = props.modelDetails;
    console.log(modelDetails)
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <div className="content">
            <Row>
                <Col>
                    <Typography variant="h5" component="h5" gutterBottom>
                        Model Details
                    </Typography>
                </Col>
            </Row>
            <Paper elevation={3}
                style={{
                    padding: "1rem",
                    marginBottom: "1rem",
                    backgroundColor: "transparent",
                }}
            >
                <Typography>
                    <Row style={{ marginBottom: "0.5rem" }}>
                        <Col>
                            Dataset: {modelDetails.dataset_id}
                        </Col>
                    </Row>
                    <Row style={{ marginBottom: "0.5rem" }}>
                        <Col>
                            Model ID: {modelDetails.model_id}
                        </Col>
                    </Row>
                    <Row style={{ marginBottom: "0.5rem" }}>
                        <Col md="6">
                            Model Name: {modelDetails.model_name}
                        </Col>
                        <Col md="6">
                            Model Type: {modelDetails.estimator_type}
                        </Col>
                    </Row>
                    <Row style={{ marginBottom: "0.5rem" }}>
                        <Col md="6">
                            Training Mode: <Chip variant='outlined' label={modelDetails.training_mode} />
                        </Col>
                        <Col md="6">
                            Objective: {modelDetails.objective}
                        </Col>
                    </Row>
                    <Row style={{ marginBottom: "0.5rem" }}>
                        <Col md="6">
                            Target Column: {modelDetails.target_column}
                        </Col>
                        <Col md="6">
                            Metric: {modelDetails.metric_type}
                        </Col>
                    </Row>
                </Typography>
            </Paper>
            <Row>
                <Col>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                            <Tab label="Metrics" {...a11yProps(0)} />
                            <Tab label="Visualizations" {...a11yProps(1)} />
                            <Tab label="Parameters" {...a11yProps(2)} />
                            <Tab label="All Models Results" {...a11yProps(3)} />
                        </Tabs>
                    </Box>
                    <CustomTabPanel value={value} index={2}>
                        <ReactStrapTable striped>
                            <thead>
                                <tr>
                                    <th>Parameter</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <TableBody>
                                {modelDetails.parameters.map((parameter, index) => {
                                    return (
                                        <tr hover size='small' key={index}>
                                            <td>{parameter.parameter_name}</td>
                                            <td>{parameter.parameter_value}</td>
                                        </tr>
                                    );
                                }
                                )}
                            </TableBody>
                        </ReactStrapTable>
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={0}>
                        <ReactStrapTable striped>
                            <thead>
                                <tr>
                                    <th>Metric</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {modelDetails.evaluation_metrics.map((metric, index) => {

                                    if (metric.metric_name != 'classifier') {
                                        return (
                                            <tr key={index}>
                                                <td>{metric.metric_name}</td>
                                                <td>{metric.metric_value}</td>
                                            </tr>)
                                    }
                                    else {
                                        return null;
                                    }
                                    ;
                                })}
                            </tbody>
                        </ReactStrapTable>
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={1}>
                        {
                            modelDetails.objective.toLowerCase() == 'classification' ?
                                <>
                                    <Row

                                    >
                                        <Col md="6">
                                            <ConfusionMatrix cm={modelDetails.graph_data.confusion_matrix} output_mapping={modelDetails.output_mapping} />
                                        </Col>
                                        <Col md="6">
                                            <FeatureImportance fi={modelDetails.graph_data.feature_importance} />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <PrecisionRecall pr_data={modelDetails.graph_data.precision_recall_data} />
                                        </Col>

                                        <Col md="6">
                                            <RocCurve auc_data={modelDetails.graph_data.auc_data} />
                                        </Col>
                                    </Row>
                                </>
                                :
                                <>
                                    <Row
                                        style={{
                                            marginBottom: '1.5rem'
                                        }}
                                    >
                                        <Col md="6">
                                            <FeatureImportance fi={modelDetails.graph_data.feature_importance} />
                                        </Col>
                                        <Col md="6">
                                            <ScatterPlot scatter_plot_data={modelDetails.graph_data.scatter_plot_data} />
                                        </Col>
                                    </Row>
                                    <Row
                                    justify-content="center"
                                    >
                                        <Col>
                                            <ResidualPlot residual_plot_data={modelDetails.graph_data.residual_plot_data} />
                                        </Col>
                                    </Row>
                                </>
                        }

                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={3}>
                        <ReactStrapTable striped>
                            <thead>
                                <tr>
                                    {

                                        Object.keys(modelDetails.all_models_results[0])
                                            .map((metric) => {
                                                return (
                                                    <>
                                                        <th>{metric}</th>
                                                    </>
                                                )
                                            }
                                            )
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                {modelDetails.all_models_results.map((model) => (
                                    <tr>
                                        {
                                            Object.keys(model).map((metric) => {
                                                return (
                                                    <>
                                                        <td>{model[metric]}</td>
                                                    </>
                                                )
                                            }
                                            )
                                        }
                                    </tr>
                                ))}
                            </tbody>
                        </ReactStrapTable>
                    </CustomTabPanel>
                </Col>
            </Row>
        </div>
    )
}

export default ModelInfoComponent;