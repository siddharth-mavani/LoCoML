import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@mui/material";



function Delete () {
    const [data, setData] = useState("hi")
    // const socket = io("http://localhost:5000")
    const eventSource = new EventSource("http://127.0.0.1:5000/stream?channel=mychannel");
    eventSource.onmessage = (event) => {
        console.log(event.data);
    };
    useEffect(() => {
        // console.log("hell")
        // socket.on('connect', () => {
        //     console.log(socket.id);
        //     // socket.emit('trainModel', 'hello')
        // })
        // socket.on('output', (data) => {
        //     // console.log('HI');
        //     console.log(data);
        //     setData(data);
        // })
    }, [])

    const clickHandler = () => {
        // socket.emit('input', "hello")
        axios.post(process.env.REACT_APP_TRAIN_URL, {
            "model_name": "adult_income123",
            "dataset_name": "adult.csv",
            "target_column" : "income",
            "objective" : "classification",
            "metric_type" : "autoselect",
            "model_type" : "automl"
        })
        .then((response) => {
            console.log(response);
        }
        )
    }

    return (
        <div className="content">
            Hello::
            {data}
            <br />
            <Button onClick={clickHandler}>Click</Button>
        </div>
    )
}

export default Delete;