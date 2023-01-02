//set up and configuration to call openAI's API 
//need API key --> .env file

import express from 'express';
import * as dotenv from 'dotenv'; //allow us to get the data from the env file
import cors from 'cors';  //to make those cross origin requests
import { Configuration, OpenAIApi } from 'openai';

dotenv.config(); //to use dotenv variables

console.log(process.env.OPENAI_API_KEY)
//function which accepts an object
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

//instance of openAI
const openai = new OpenAIApi(configuration);

//initialize express application
const app = express();
//setting some middlewares
app.use(cors()); //allow our server to be called from the frontend
app.use(express.json()); //allow to pass json from the frontend to the backend

//dummy root route
//request and response
app.get('/', async (req, res) => { //get route --> receive a lot of data from the frontend
    res.status(200).send({
        message: 'Hello, world!',
    })
});

//post route --> allows us to have a body or a payload
app.post('/', async (req, res) => {
    try {
        const prompt = req.body.prompt;

        //function that accepts an object
        const response = await openai.createCompletion ({ //getting a request from the openai
        //parameters that we can pass into the model openAI -> Examples -> code -> NLP -> text_davinci03
        model: "text-davinci-003", 
        prompt: `${prompt}`, //textArea data, the variable above 
        temperature: 0, //higher temp --> more risks //here we just want it to answer what it knows so --> 0
        max_tokens: 3000,  //longer responses --> 3000
        top_p: 1, 
        frequency_penalty: 0.5, //not repeating similar sentences often //0.5 --> less likely to say a similar thing
        presence_penalty: 0,
        });

        //once we get the response we want to send it back to the frontend
        res.status(200).send({
            bot: response.data.choices[0].text
        })
    } catch (error) { //if something goes wrong 
        console.log(error);
        res.status(500).send({ error }) //to know what happened 
    }
})

//to make sure our server always listen to our requests
app.listen(5000, () => console.log('Server is running on port http://localhost:5000'));
