import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form'); //getting form by tag name
const chatContainer = document.querySelector('#chat_container'); //by ID name

let loadInterval; //variable in outer scope

function loader(element) { //function that loads are message //returns ...
    element.textContent = '';

    loadInterval = setInterval(() => {
        element.textContent += '.';
        
        if (element.textContent === '....'){
            element.textContent = '';
        }    
    }, 300) //every 300ms we want to do the thing in the curly bracket
}

//AI typing letter by letter 
//implementing typing functionality because we want it as if the AI is thinking and typing, we don't want the whole answer at once --> User Experience

function typeText(element, text){
    let index = 0;

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }

    }, 20)
}

//generate unique ID for every single message to be able to map over them

function generateUniqueId() {
    const timestamp = Date.now(); //unique ID for each element --> the simplest way
    const randomNumber = Math.random(); //making it even more random
    const hexadecimalString = randomNumber.toString(16); //making it more random

    return `id-${timestamp}-${hexadecimalString}`;
}

//for each message new stripe, new column, dark grey to light grey
//each message has an icon Us and AI 

function chatStripe (isAi, value, uniqueId) {
    return (    //returning template string --> regular strings cannot create spaces and enters
        `
            <div class = "wrapper ${isAi && 'ai'}">
                <div class = "chat">
                    <div class = "profile">
                        <img 
                            src = "${isAi ? bot : user}"
                            alt = "${isAi ? 'bot' : 'user'}"
                        />
                    </div>
                    <div class = "message" id = ${uniqueId}> 
                        ${value} //AI generated message
                    </div>
                </div>
            </div>
        `
    )
}

//handle submit function --> trigger to AI generated response
//async function 
//take an event as the first and only parameter
const handleSubmit = async (e) => { 
    e.preventDefault(); //default browser behavior when you submit a form is to reload the browser and we don't want to reload so we are using preventDefault() function

    //get data we type into the form
    const data = new FormData(form);

    //generate user's chatstripe 
    chatContainer.innerHTML += chatStripe(false, data.get('prompt')); //false as it's not AI but us 

    //clearing textArea input
    form.reset();

    //bot's chatstripe
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId); //empty string because we are filling it up as we are loading the actual msg 

    //as the AI is typing we want to keep scrolling down to be able to see that message
    chatContainer.scrollTop = chatContainer.scrollHeight; //put new message in the view

    //fetching this newly created div 
    const messageDiv = document.getElementById(uniqueId);

    //turn on the loader 
    loader(messageDiv);

    //fetching data from server --> getting bot's response
    const response = await fetch("http://localhost:5000", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        }),
    });

    clearInterval(loadInterval); //no longer loading
    messageDiv.innerHTMl = '';

    if(response.ok){
        const data = await response.json(); //actual response coming from the backend 
        //we need to parse the data received
        const parsedData = data.bot.trim();

        // console.log({parsedData});
        typeText(messageDiv, parsedData);
    }
    else { //if we get an error
        const err = await response.text();

        messageDiv.innerHTML = "Something went wrong. Try Again.";

        alert(err);
    }
}

//see the changes that we made to our handleSubmit -- call
form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => { //calling by clicking enter key --> enter keyCode = 13
    if (e.key === "Enter") {
        handleSubmit(e);
    }
}) 