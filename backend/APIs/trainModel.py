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
    


    current_model = 'Initialising'
    progress_percent = 0
    estimated_time_left = 'Calculating'
    while True:
        progress = process.stderr.readline()
        print(progress)
        if process.poll() is not None:
            break

        if progress:
            # print(progress)
            if progress.find("Processing: ") != -1:
                progress_percent = progress[progress.find("Processing: ")+12:15]
                progress_percent = int(progress_percent.strip())
            if progress.find("Current Model: ") != -1:
                current_model = progress[progress.find("Current Model: ")+15:]
                current_model = current_model.strip()
                # print(progress_percent)
            if progress.find("<") != -1:
                idx = progress.find("<")
                print("progress", progress)
                time_left = progress[idx+1:idx+6]
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
            if progress.find("Saving Model") != -1:
                sse.publish({
                    'progress': 100,
                    'model' : 'Completed Training',
                    'status': 'Saving Model',
                    'estimated_time_left': '0 secs'
                })
                continue
            
            if training_mode.lower() != 'automl':
                current_model = model_type
                
            sse.publish({
                'progress': progress_percent,
                'model': current_model,
                'status': 'Training',
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
