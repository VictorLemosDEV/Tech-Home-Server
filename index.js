// app.js


const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

import { config } from 'dotenv';

import { MongoClient } from 'mongodb';

config();



app.use(express.json());

app.get('/data', (req, res) => {
    // Retornar banco de dados


    res.send("Banco de dados")
})

app.post('/data', (req, res)=>{
    // Publicar a varíavel "data" no banco de dados

    const {data} = req.body
    
    res.send(`Publicado no banco de dados:  ${data}`);
})
app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

export async function connectToCluster(uri) {
    let mongoClient;
 
    try {
        mongoClient = new MongoClient(uri);
        console.log('Connecting to MongoDB Atlas cluster...');
        await mongoClient.connect();
        console.log('Successfully connected to MongoDB Atlas!');
 
        return mongoClient;
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        process.exit();
    }
 }

await connectToCluster(process.env.DB_URI)