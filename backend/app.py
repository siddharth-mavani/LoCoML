from flask import Flask, Blueprint
from flask_cors import CORS

from APIs.getDatasets import getDatasets
from APIs.trainModel import trainModelAPIs
from APIs.preprocess import preprocess
from APIs.getTrainedModels import getTrainedModels

app = Flask(__name__)
CORS(app)

app.register_blueprint(getDatasets)
app.register_blueprint(trainModelAPIs)
app.register_blueprint(preprocess)
app.register_blueprint(getTrainedModels)

if __name__ == "__main__":
    app.run()