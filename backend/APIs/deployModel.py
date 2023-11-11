from flask import Flask, Blueprint, jsonify, request
import os
import joblib
import sys
import pandas as pd
import shutil
import subprocess
from docker import from_env
sys.path.append(os.getenv('PROJECT_PATH'))

from mongo import db
collection = db['Model_zoo']

cli = from_env()

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


@deployModel.route('/deploy', methods=['POST'])
def test():
    # Get Model ID
    data = request.get_json()
    model_id = data['model_id']

    src = "./Models/" + model_id + ".pkl"
    dst = "./app2/Model/"

    print(src)

    # Check if model exists
    if not os.path.exists(src):
        return jsonify(message="Model not found"), 250
    else:
        shutil.copy2(src, dst)

    # Build Docker image
    image, build_log = cli.images.build(path="./", tag="app2")
    print("Image built")

    # Run Docker container
    container = cli.containers.run("app2", detach=True, ports={'5000/tcp': 8080})
    print("Container running")

    return jsonify(message="Model Deployed"), 200
