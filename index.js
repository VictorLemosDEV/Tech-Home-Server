// app.js


import express, { json } from 'express';
const app = express();
const PORT = process.env.PORT || 10000;

import { config } from 'dotenv';

import { MongoClient, ObjectId } from 'mongodb';

config();

let db;

app.use(express.json());

async function GetDataFromMongoDb() {


    var collection = db.collection("App Data");

        let data = await collection.findOne({_id: new ObjectId("66e5d2ebe93fee3b400bf619")})

        return data
    
}

async function PostDataInMongoDb(Data) {

    var collection = db.collection("App Data");

        let data = await collection.findOneAndReplace({_id: new ObjectId("66e5d2ebe93fee3b400bf619")}, Data)

        return data
    
}

app.get('/data', async (req, res) => {
    // Retornar banco de dados

    let data = await GetDataFromMongoDb()

    delete(data["_id"])



    res.send(data)
})

app.post('/data', async (req, res) => {
    // Publicar a varíavel "data" no banco de dados

    const { data } = req.body

    let response = await PostDataInMongoDb(data)
    response = JSON.stringify(response)


    

    res.send(`Publicado no banco de dados:  ${response}`);
})
app.listen(PORT, (error) => {
    if (!error)
        console.log("Server is Successfully Running, and App is listening on port " + PORT)
    else
        console.log("Error occurred, server can't start", error);
}
);

async function connectToCluster(uri) {
    let mongoClient

    try {
         mongoClient = await new MongoClient(uri);
        console.log('Connecting to MongoDB Atlas cluster...');
        let connection = await mongoClient.connect();
        db = connection.db("TechHome")
        console.log('Successfully connected to MongoDB Atlas!');


        

  

        return mongoClient
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        process.exit();
    }


}






await connectToCluster(process.env.DB_URI)