from flask import Blueprint, current_app, request
from flask_sse import sse
import time
import subprocess
import sys
import pickle 
import os

trainModelAPIs = Blueprint('trainModel', __name__)

@trainModelAPIs.route('/trainModel', methods=['GET', 'POST'])
def trainModel():
    print("hit")
    data = request.get_json()
    dataset_id = data['dataset_id']
    model_name = data['model_name']
    target_column = data['target_column']
    objective = data['objective']
    metric_mode = data['metric_mode']
    metric_type = data['metric_type']
    training_mode = data['training_mode']
    model_type = data['model_type']

    # if metric_type.lower() != 'autoselect':
    #     metric_type = data['custom_metric_type']

    if training_mode.lower() == 'automl':
        process_path = os.getenv('PROJECT_PATH') + 'functions/trainModelAutoML.py'
    else:
        process_path = os.getenv('PROJECT_PATH') + 'functions/trainModelCustom.py'
    
    process = subprocess.Popen(['python3', '-u', process_path, dataset_id, model_name, target_column, metric_mode, metric_type, objective, model_type], stderr=subprocess.PIPE, bufsize=1, text=True)
    

    status = 'Loading'
    current_model = 'Initialising'
    progress_percent = 0
    estimated_time_left = 'Calculating'

    while True:
        output = process.stderr.readline()
        print(output)
        if process.poll() is not None:
            break

        if output:
            # print(output)
            if output.find('Status: ') != -1:
                status = output[output.find('Status: ')+8:output.find('Current Classifier: ')]
                status = status.strip()
                print(status)

            if output.find("Current Classifier: ") != -1:
                current_model = output[output.find("Current Classifier: ")+20:output.find("Processing: ")]
                current_model = current_model.strip()
                print(current_model)

            if output.find("Processing: ") != -1:
                progress_percent = output[output.find("Processing: ")+12:output.find("Processing: ")+15]
                progress_percent = int(progress_percent.strip())
                print(progress_percent)

            if output.find("<") != -1:
                idx = output.find("<")
                time_left = output[idx+1:idx+6]
                if time_left[0] == '?':
                    estimated_time_left = 'Calculating'
                else:
                    # convert it to mins and secs from MM:SS format
                    estimated_time_left = ''
                    # print("time_left", time_left)
                    # check if time_left[:2] can be converted to int
                    if time_left[:2].isdigit() == False:
                        estimated_time_left = 'Calculating'
                        continue
                    
                    if int(time_left[:2]) > 0:
                        estimated_time_left = str(int(time_left[:2])) + ' mins '
                    estimated_time_left += str(int(time_left[3:])) + ' secs'
                print(estimated_time_left)
            
            if training_mode.lower() != 'automl':
                current_model = model_type
                
            sse.publish({
                'progress': progress_percent,
                'model': current_model,
                'status': status,
                'estimated_time_left': estimated_time_left
            }, channel='mychannel')

    
    details_path = os.getenv('PROJECT_PATH') + 'Usage/details.pkl'
    with open(details_path, 'rb') as f:
        details = pickle.load(f)
    return details

    if model_type.lower() == 'automl':
        return trainModelAutoML(dataset_name, model_name, target_column, metric_type, objective)
    else:
        model_type = data['custom_model_type']
        return trainModelCustom(dataset_name, model_name, target_column, model_type, metric_type, objective)
