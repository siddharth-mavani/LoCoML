from flask import Flask, Blueprint
from getDatasets import getDatasets
from flask_cors import CORS
app = Flask(__name__)
CORS(app, origins="http://localhost:3000/")
app.register_blueprint(getDatasets)

if __name__ == "__main__":
    app.run()