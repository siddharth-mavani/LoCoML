from flask import Blueprint, request, send_file
import sys
sys.path.append('../functions')

from functions.trainModelAutoML import trainModelAutoML
from functions.trainModelCustom import trainModelCustom

trainModelAPIs = Blueprint('trainModel', __name__)

@trainModelAPIs.route('/trainModel', methods=['POST'])
def trainModel():

    
    data = request.get_json()
    dataset_name = data['dataset_name']
    model_name = data['model_name']
    target_column = data['target_column']
    objective = data['objective']
    metric_type = data['metric_type']
    model_type = data['model_type']

    if metric_type.lower() != 'autoselect':
        metric_type = data['custom_metric_type']

    if model_type.lower() == 'automl':
        return trainModelAutoML(dataset_name, model_name, target_column, metric_type, objective)
    else:
        model_type = data['custom_model_type']
        return trainModelCustom(dataset_name, model_name, target_column, model_type, metric_type, objective)
