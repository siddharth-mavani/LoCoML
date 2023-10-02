from flask import Flask, Blueprint, jsonify, request
import os
import joblib
import sys
sys.path.append(os.getenv('PROJECT_PATH'))

from mongo import db
collection = db['Model_zoo']

deployModel = Blueprint('deployModel', __name__)
deployed_model_id = None
deployed_model = None

@deployModel.route('/deployModel', methods=['POST'])
def deployModelAPI():
    data = request.get_json()
    model_id = data['model_id']
    trained_model = collection.find_one({'model_id': model_id})
    model_path = trained_model['saved_model_path']
    model = joblib.load(model_path)

    global deployed_model_id
    global deployed_model

    deployed_model_id = model_id
    deployed_model = model
    return {'status': 'success', 'message': 'Model deployed successfully', 'endpoint' : 'http://localhost:5000/{model_id}/predict'.format(model_id=model_id)}

import pandas as pd
@deployModel.route('/<model_id>/predict', methods=['POST'])
def predict(model_id):
    global deployed_model_id
    global deployed_model
    if model_id == deployed_model_id:
        data = request.get_json()
        data = data['data']
        data = pd.DataFrame(data)
        predictions = deployed_model.predict(data)
        return {'predictions': predictions}
    else:
        return {'status': 'error', 'message': 'Model not deployed'}