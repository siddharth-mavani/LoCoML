from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pycaret.classification import load_model
import os

import sys
sys.path.append('../')
sys.path.append(os.getenv('PROJECT_PATH'))
print(os.getenv('PROJECT_PATH'))
from mongo import db
collection = db['Model_zoo']
app = Flask(__name__)
CORS(app)

model = None
@app.route('/loadModel')
def loadModel():
    global model
    data = request.get_json()
    model_id = data['model_id']

    trained_model = collection.find_one({'model_id': model_id})
    model_path = trained_model['model_path']
    model = load_model(model_path)

    return {'status': 'success', 'message' : 'Model loaded successfully'}

@app.route('/predict', methods=['POST'])
def predict():
    global model
    data = request.get_json()
    data = data['data']
    data = [data]
    predictions = model.predict(data)
    return {'predictions': predictions}

# if __name__ == '__main__':
app.run(port='8080')