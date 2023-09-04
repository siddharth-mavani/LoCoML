from pymongo import MongoClient

client = MongoClient("mongodb+srv://ayushagr:SAR%4012345@automl.kio7h6o.mongodb.net/?retryWrites=true&w=majority")
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

db = client['AutoML_Project']