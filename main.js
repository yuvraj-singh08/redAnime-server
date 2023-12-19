const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const { addAnime, getAnime, getAllCharactersByAnimeId, addCharacter, addUser, isRegistered, addToWatchList, getWatchList } = require('./functions');
const { addComment } = require('./functions/addComment');
const { getUser } = require('./functions/getUser');
const { getComment } = require('./functions/getComment');

//Connect to the database
mongoose.connect(process.env.uri)
    .then(() => {
        console.log("Database Connected");
    })
    .catch((err) => {
        console.log('Error connecting to MongoDB: ', err);
    })


const app = express();
app.use(express.json());
app.use(cors());

app.get('/api/anime/:animeId', async (req, res) => {
    const id = req.params.animeId;
    const response = await getAnime({ _id: id }, { name: 1, para: 1, src: 1, _id: 0 });
    res.json(response);
})

app.get('/api/allAnime', (req, res) => {
    const projection = { name: 1, description: 1, src: 1, _id: 1 };

    getAnime({}, projection)
        .then(documents => {
            res.json(documents);
        })
        .catch(err => {
            console.error(err);
            res.sendStatus(500);
        });
});

app.get('/api/anime/:animeId/characters', getAllCharactersByAnimeId);

app.post('/anime/add', async (req, res) => {
    const { name, description, source, para } = req.body;

    try {
        await addAnime(name, description, source, para);
        res.status(201).json({ message: 'Anime added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/characters/add', async (req, res) => {
    const { name, description, source, anime } = req.body;

    try {
        await addCharacter(name, description, source, anime);
        res.status(200).json({ message: 'Character added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/user/add', async (req, res) => {
    const { name, email, password, imgSource } = req.body;

    try {
        await addUser(name, email, password, imgSource);
        res.status(200).json({ message: 'User added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/user/validate', async (req, res) => {
    const { email, password } = req.body;

    try {
        const response = await isRegistered(email, password);
        if (response.length > 0) {
            res.status(200).json({ message: 'true', _id: response[0]._id });
        }
        else {
            res.status(200).json({ message: 'false' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/user/addWatchList', (req, res) => {
    const { id, anime } = req.body;
    try {
        const response = addToWatchList(id, anime);
        if (response) {
            res.status(200).json({ message: 'true' });
        }
        else {
            res.status(200).json({ message: 'false' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/user/getWatchList', async (req, res) => {
    const { id } = req.body;
    try {
        const response = await getWatchList(id);
        res.status(200).json({ response });


    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/addComment', addComment);
app.post('/api/getUser', getUser);
app.post('/api/getComment', getComment);

app.listen(process.env.port,(err, res) => {
    if(err){
        console.log(err);
    }
    else{
        console.log("Server is up and running")
    }
});