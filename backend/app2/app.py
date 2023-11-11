from flask import Flask, Blueprint, jsonify
import os
from flask_cors import CORS

from inference import inference_blueprint

app = Flask(__name__)
CORS(app)

app.register_blueprint(inference_blueprint)

@app.route('/')
def hello_world():
    return jsonify(message="Model Deployed Successfully!")

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)
