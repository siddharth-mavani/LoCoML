import React, { useEffect } from "react";
import axios from "axios";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import UpdateIcon from '@mui/icons-material/Update';
import PublishIcon from '@mui/icons-material/Publish';
import { IconButton } from "@mui/material";
import { CircularProgress, Typography } from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import MyComponent from "./OpenAPISpec";


import ModelCard from "components/ModelInfo/ModelInfoCard";
import { Row, Col } from "reactstrap";

function TrainedModels() {
    const [loading, setLoading] = React.useState(true);
    const [datasets, setDatasets] = React.useState({});
    const [trainedModels, setTrainedModels] = React.useState([{
        "time": "2021-10-10T12:00:00.000Z",
        "dataset_id": 1,
        "model_id": "1L3JE5",
        "training_mode": "auto",
        "estimator_type": "RandomForestClassifier",
        "objective": "classification",
        "metric_type": "accuracy",
        "evaluation_metrics": [{"metric_name": "accuracy", "metric_value": 0.9}],
        "model_name": "Test",
    }]);
    const [deployLoading, setDeployLoading] = React.useState(false);
    const [modelDeployed, setModelDeployed] = React.useState(false);
    const [deployedModel, setDeployedModel] = React.useState();

    React.useEffect(() => {
        axios.get(process.env.REACT_APP_GET_ALL_DATASETS_URL)
            .then((response) => {
                console.log(response.data);
                var dataset_map = {}
                for (var i = 0; i < response.data.dataset_list.length; i++) {
                    dataset_map[response.data.dataset_list[i].dataset_id] = response.data.dataset_list[i].dataset_name;
                }
                setDatasets(dataset_map);
            }).catch((error) => {
                console.log(error);
            })

        axios.get("http://localhost:5000/getTrainedModels")
            .then(async (response) => {
                console.log(response.data);
                var temp = [];
                for (var i = 0; i < response.data.trained_models.length; i++) {
                    try {
                        var parsed_model = JSON.parse(response.data.trained_models[i]);
                        temp.push(parsed_model);
                    } catch (error) {
                        console.log(error);
                        console.error(`Invalid JSON in response.data.trained_models[${i}]:`, response.data.trained_models[i]);
                    }
                }
                setTrainedModels(temp);
                setLoading(false)
                // console.log(temp);
                // setLoading(false);
            })
            .catch((error) => {
                console.log(error);
            })
    }, []);

    function getDateFromTimestamp(timestamp) {
        console.log(timestamp.$date)
        // get local timestamp
        var utc = new Date(timestamp.$date);
        var date = new Date(utc.getTime() + utc.getTimezoneOffset() * 60 * 1000);
        var dateString = date.toLocaleDateString();
        return dateString;
    }

    function getTimeIn12Hours(timestamp) {
        var utc = new Date(timestamp.$date);
        var date = new Date(utc.getTime() + utc.getTimezoneOffset() * 60 * 1000);
        // get timestring in 12 hours format (get only hours and minutes)
        var timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return timeString;
    }

    function getMetricValue(metric_arr, metric_type) {
        for (var i = 0; i < metric_arr.length; i++) {
            if (metric_arr[i].metric_name === metric_type) {
                return metric_arr[i].metric_value;
            }
        }
    }

    function downloadModel(pickled_model) {
        const blob = new Blob([pickled_model], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'model.pkl');
        document.body.appendChild(link);
        link.click();

        // remove the link when done
        // url.revokeObjectURL(url);
        document.body.removeChild(link);
    }

    async function handleDeploy(model) {
        console.log(model)
        let model_id = model.model_id;
        setDeployLoading(true);
        // try {
        //     const response = await axios.post("http://127.0.0.1:5000/deploy", {
        //         // "model_id": "1L3JE5"
        //         "model_id": model_id
        //     });
        //     console.log(response);
        //     setDeployedModel(model_id);
        //     setModelDeployed(true);
        // } catch (error) {
        //     console.log(error);
        // }
        setDeployedModel(model_id);
        setModelDeployed(true);
        setDeployLoading(false);
        
}

    

    return (
        <div className="content">
            {loading ?
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                    <CircularProgress /> <br />
                    <Typography variant="h6" style={{ marginLeft: '10px' }}>
                        Fetching Trained Models <br />
                    </Typography>
                    <Typography variant="subtitle1" style={{ marginLeft: '10px' }}>
                        Please wait...
                    </Typography>
                </div> :
                <>
                    <Row>
                        {
                            trainedModels.map((model, index) => {

                                return (
                                    <Col md="4">
                                        <ModelCard modelDetails={model} dataset_map={datasets} key={index} />
                                    </Col>
                                );

                            })
                        }
                    </Row>
                </>  
            }
        </div>
    );
}

export default TrainedModels;