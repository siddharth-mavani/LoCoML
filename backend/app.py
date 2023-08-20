from flask import Flask, Blueprint
from getDatasets import getDatasets
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
app.register_blueprint(getDatasets)

if __name__ == "__main__":
    app.run()