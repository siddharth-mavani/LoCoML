from flask import Flask, Blueprint
import os
from flask_cors import CORS
from flask_sse import sse
from dotenv import load_dotenv
from APIs.getDatasets import getDatasets
from APIs.trainModel import trainModelAPIs
from APIs.preprocess import preprocess
from APIs.getTrainedModels import getTrainedModels
from APIs.storeDataset import storeDataset
from APIs.deployModel import deployModel
from APIs.inference import inference_blueprint
from APIs.eda import eda

app = Flask(__name__)
CORS(app)
load_dotenv()

app.register_blueprint(sse, url_prefix="/stream")
app.register_blueprint(getDatasets)
app.register_blueprint(trainModelAPIs)
app.register_blueprint(preprocess)
app.register_blueprint(getTrainedModels)
app.register_blueprint(storeDataset)
app.register_blueprint(deployModel)
app.register_blueprint(inference_blueprint)
app.register_blueprint(eda)


app.config['REDIS_URL'] = os.getenv('REDIS_URL')

if __name__ == "__main__":
    app.run(debug=True)