from flask import Blueprint, jsonify, request
from pandas.api.types import is_numeric_dtype
import pandas as pd
import numpy as np
import os
import subprocess
import sys
sys.path.append(os.getenv('PROJECT_PATH'))

from mongo import db
import re
deployModel = Blueprint('deployModel', __name__)

@deployModel.route('/deployModel', methods=['POST'])
def deployModelAPI():
    data = request.get_json()
    model_id = data['model_id']

    path = os.getenv('PROJECT_PATH') + 'functions/hostModel.py'
    print(path)
    command = f"gnome-terminal -- python3 {path}"
    # process = subprocess.Popen(['python3', '-u', path], stdout=subprocess.PIPE, text=True)

    
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    while True:
        output = process.stdout.readline()
        # output = output.decode('utf-8')
        print(output)
        re_out = re.search('Running on http://', output)
        if re_out:
            break

    print('Model Deployeddd!')
    return {'status': 'success', 'message': 'Model deployed successfully'}