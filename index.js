// app.js

import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 10000;
config();

let db;

// Configuração geral de CORS para todas as rotas
app.use(cors())



app.use(express.json());

// Middleware para tratamento de erros
const errorHandler = (err, req, res, next) => {
    console.error(err);
    res.status(500).send({ error: 'Something went wrong!' });
};

async function GetDataFromMongoDb(InitializeData) {
    try {
        const collection = db.collection(InitializeData ? "Arduino Data" : "App Data");
        const data = await collection.findOne({ _id: new ObjectId(InitializeData ? "67227078a64f60cf8cd66109" : "66e5d2ebe93fee3b400bf619") });
        return data;
    } catch (error) {
        throw new Error('Failed to fetch data from MongoDB');

        
    }
}

async function CheckProductCode(params, InitializeData) {

    try {

        const collection = db.collection(InitializeData ? "Arduino Data" : "App Data");
        const data = await collection.findOne({ _id: new ObjectId(InitializeData ? "67227078a64f60cf8cd66109" : "66e5d2ebe93fee3b400bf619") });

        if (data) {
            
            const Codes = Object.keys(data)

            for (let index = 0; index < Codes.length; index++) {
                const element = Codes[index];

                const CodeDecoded = Buffer.from(element,"base64")

                console.log(CodeDecoded)
                
            }


            
            return true
        }
        
    } catch (error) {
        throw new Error("Failed to verify code")
        
    }
    
}

async function PostDataInMongoDb(Data, InitializeData) {
    try {
        const collection = db.collection(InitializeData ? "Arduino Data" : "App Data");
        const response = await collection.findOneAndReplace(
            { _id: new ObjectId(InitializeData ? "67227078a64f60cf8cd66109" : "66e5d2ebe93fee3b400bf619") },
            Data
        );

        return response;
    } catch (error) {
        throw new Error('Failed to post data to MongoDB');
    }
}

app.get('/data', async (req, res, next) => {
    try {
        const data = await GetDataFromMongoDb(false);
        delete data["_id"];
        res.send(data);
    } catch (error) {
        next(error);
    }
});

app.post('/data', async (req, res, next) => {
    try {
        const { data } = req.body;
        const response = await PostDataInMongoDb(data, false);
        res.send(`Publicado no banco de dados: ${JSON.stringify(response)}`);
    } catch (error) {
        next(error);
    }
});

app.get('/initializedata/:productid', async (req, res, next) => 
    {

        console.log(req.socket.remoteAddress)
        console.log(req.params.productid)

    try {
        const data = await GetDataFromMongoDb(true);
        if (data && data["_id"]) {
            delete data["_id"];
        }
        res.send(data);
    } catch (error) {
        next(error);
    }
});

app.post('/initializedata/:productid', async (req, res, next) => {
    try {
        const data = req.body;
        const productId = req.params.productid

        const IsCodeValid = await CheckProductCode(productId,true)

        
        if (data && IsCodeValid) {
            console.log("Someone tried to post this data: ", data)
            const response = await PostDataInMongoDb(data, true);
            res.send(`Chegou as informações: ${JSON.stringify(response)}`);
        } else {
            res.status(422).send('Data parameter not found or code invalid');
        }
    } catch (error) {
        console.log(error); 
        next(error);
    }
});

app.use(errorHandler);

app.listen(PORT, (error) => {
    if (!error)
        console.log(`Server is Successfully Running, and App is listening on port ${PORT}`);
    else
        console.log("Error occurred, server can't start", error);
});

async function connectToCluster(uri) {
    let mongoClient;
    try {
        mongoClient = await new MongoClient(uri);
        console.log('Connecting to MongoDB Atlas cluster...');
        const connection = await mongoClient.connect();
        db = connection.db("TechHome");
        console.log('Successfully connected to MongoDB Atlas!');
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        process.exit();
    }
}

await connectToCluster(process.env.DB_URI);
