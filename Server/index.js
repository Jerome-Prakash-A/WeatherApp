// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const admin = require('firebase-admin');
const cors = require('cors');
const serviceAccount = require('./weather-app-b56f1-firebase-adminsdk-5xecd-543607a8ca.json'); // Replace with your Firebase Admin SDK key

// Check if the app has already been initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // storageBucket: 'magil-34a6a.appspot.com',

    });
}
const db = admin.firestore();

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: '*',
    },
});



app.use(cors());
const apiKey = `02692c4eef77d4b2b7f07d4c25d868d1`;

io.on('connection', (socket) => {

    // Get Top Three rankers 
    socket.on('GetCities', (props) => {
        try {
            const topRankersDataref = db.collection('cities');

            const unsubscribe = topRankersDataref.onSnapshot((snapshot) => {
                var cities = [];
                snapshot.forEach((city) => {
                    cities.push({
                        ...city.data(),
                        name: city.id
                    })
                })
                socket.emit('GetCities', cities);
            })
        }
        catch (error) {
            console.error('Error getting cities:', error);
            alert("SomeThing Went Wrong!");
        }
    });


    socket.on('GetCityWeather', (props) => {
        console.log(props)
        try {
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${props.city}&appid=${apiKey}&units=metric`)
                .then(response => response.json())
                .then(data => {
                    // Once you receive the JSON data, you can access different weather properties like temperature, humidity, etc.

                    // Example of accessing specific weather data
                    const Data = {
                        temperature: data.main.temp,
                        humidity: data.main.humidity,
                        description: data.weather[0].description
                    }

                    socket.emit('GetCityWeather', Data);

                })
                .catch(error => {
                    console.error('Error fetching weather data:', error);
                    socket.emit('GetCityWeather', { ciryInvalid: true });

                });
        }
        catch (error) {
            console.error('Error getting cities:', error);
            alert("SomeThing Went Wrong!");
            socket.emit('GetCityWeather', { ciryInvalid: true });

        }
    });
})


const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log('Server is running on port ' + port);
});
