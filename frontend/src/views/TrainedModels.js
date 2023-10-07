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
import { IconButton } from "@mui/material";
import { CircularProgress, Typography } from "@mui/material";
function TrainedModels() {
    const [loading, setLoading] = React.useState(true);
    const [trainedModels, setTrainedModels] = React.useState([]);
    const [datasets, setDatasets] = React.useState({});
    React.useEffect(() => {
        // wait for 3 seconds
        const timer = setTimeout(() => {
            
        }, 1000);

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
        


        return () => clearTimeout(timer);
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
                <Table striped bordered hover>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Dataset</TableCell>
                            <TableCell>Model ID</TableCell>
                            <TableCell>Model Name</TableCell>
                            <TableCell>Training Type</TableCell>
                            <TableCell>Model Type</TableCell>
                            <TableCell>Objective</TableCell>
                            <TableCell>Metric</TableCell>
                            <TableCell>Value</TableCell>
                            <TableCell>Download</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {trainedModels.map((model, index) => {
                            return (
                                <TableRow key={index}>
                                    <TableCell>{getDateFromTimestamp(model.time)}</TableCell>
                                    <TableCell>{getTimeIn12Hours(model.time)}</TableCell>
                                    <TableCell>{datasets[model.dataset_id]} (id: {model.dataset_id} )</TableCell>
                                    <TableCell>{model.model_id}</TableCell>
                                    <TableCell
                                        style={{
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => window.location.href = `/models/${model.model_id}`}
                                    >

                                        <Typography variant="body1" style={{ color: '#007bff' }}>
                                            {model.model_name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{model.training_mode}</TableCell>
                                    <TableCell>{model.estimator_type}</TableCell>
                                    <TableCell>{model.objective.charAt(0).toUpperCase() + model.objective.slice(1)}</TableCell>
                                    <TableCell>{model.metric_type}</TableCell>
                                    <TableCell>{getMetricValue(model.evaluation_metrics, model.metric_type)}</TableCell>
                                    <TableCell><IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => downloadModel(model.pickled_model)}
                                    >
                                        <FileDownloadIcon />
                                    </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            }
        </div>
    );
}

export default TrainedModels;