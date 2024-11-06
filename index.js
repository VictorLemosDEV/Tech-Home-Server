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

const ValidProductCodes = ["123456", "654321", "314159"]

app.use(express.json());

// Middleware para tratamento de erros
const errorHandler = (err, req, res, next) => {
    console.error(err);
    res.status(500).send({ error: 'Something went wrong!' });
};

async function GetDataFromMongoDb(productId,InitializeData,AllData) {
    try {
        const collection = db.collection(InitializeData ? "Arduino Data" : "App Data");
        const data = await collection.findOne({ _id: new ObjectId(InitializeData ? "67227078a64f60cf8cd66109" : "66e5d2ebe93fee3b400bf619") });

        if (AllData) {

            const Codes = Object.keys(data)

            console.log("List of Codes",Codes)

            for (let index = 0; index < Codes.length; index++) {
                const element = Codes[index];

                const CodeDecoded = Buffer.from(element,"base64").toString("base64")
                
                

                isValid = ValidProductCodes.includes(CodeDecoded)
                console.log("Is my soul valid?", isValid)
                if (isValid) return data

            }

            

        } else {
            const Codes = Object.keys(data)

            console.log("List of Codes",Codes)

            for (let index = 0; index < Codes.length; index++) {
                const element = Codes[index];

                const CodeDecoded = atob(element)
                
                

                isValid = ValidProductCodes.includes(CodeDecoded)
                console.log("Is my soul valid? All Data", isValid)
                if (!isValid) return false


                return data[element]

                
                
            }
        }

       
    } catch (error) {
       

        
    }
}

async function CheckProductCode(params, InitializeData) {

    try {

        const collection = db.collection(InitializeData ? "Arduino Data" : "App Data");
        const data = await collection.findOne({ _id: new ObjectId(InitializeData ? "67227078a64f60cf8cd66109" : "66e5d2ebe93fee3b400bf619") });

        let isValid = false

        if (data) {

            delete data["_id"];
            
            const Codes = Object.keys(data)

            console.log("List of Codes",Codes)

            for (let index = 0; index < Codes.length; index++) {
                const element = Codes[index];

                const CodeDecoded = atob(element)
                
                console.log("Code Decoded", CodeDecoded)
                

                isValid = ValidProductCodes.includes(CodeDecoded)
                if (isValid) return isValid
                
            }


            
        }

        return isValid
        
    } catch (error) {
        throw new Error("Failed to verify code", error)
        
    }
    
}

async function PostDataInMongoDb(Data,productId, InitializeData) {
    try {
        const collection = db.collection(InitializeData ? "Arduino Data" : "App Data");

        const PreviousData = await GetDataFromMongoDb(productId,true,true)

        let newData = Data


            newData = PreviousData
            newData[btoa(productId)] = Data

            console.log("Data to be posted", newData)

       

        const response = await collection.findOneAndReplace(
            { _id: new ObjectId(InitializeData ? "67227078a64f60cf8cd66109" : "66e5d2ebe93fee3b400bf619") },
            newData
        );

        return response;
    } catch (error) {
        throw new Error('Failed to post data to MongoDB', error);
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


    try {
        const data = await GetDataFromMongoDb(req.params.productid,true,false);
        console.log(data)
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
            const response = await PostDataInMongoDb(data,productId, true);
            res.send(`Chegou as informações: ${JSON.stringify(response)}`);
        } else {
            res.status(422).send('Data parameter not found or code invalid');
            console.log("Product ID",productId, "Is Code Valid",IsCodeValid)
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
