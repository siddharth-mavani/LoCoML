from flask import Flask, Blueprint
from getDatasets import getDatasets
from trainModel import trainModelAPIs
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
app.register_blueprint(getDatasets)
app.register_blueprint(trainModelAPIs)

if __name__ == "__main__":
    app.run()