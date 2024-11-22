const express = require('express');
const app = express();
const PORT = 3000;

app.listen(PORT,()=>{
    console.log(`You can access it on http:://localhost:${PORT}`);
});

app.get("/students", (req,res)=>{
    res.status(200).send({"message" : "Successfully retrieved students information"});
});