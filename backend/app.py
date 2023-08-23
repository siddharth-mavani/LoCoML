from flask import Flask, Blueprint
from flask_cors import CORS

from getDatasets import getDatasets
from preprocess import preprocess

app = Flask(__name__)
CORS(app)

app.register_blueprint(getDatasets)
app.register_blueprint(preprocess)

if __name__ == "__main__":
    app.run()