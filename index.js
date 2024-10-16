// app.js

const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get('/data', (req, res) => {
    res.send("Banco de dados")
})

app.post('/data', (req, res)=>{
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