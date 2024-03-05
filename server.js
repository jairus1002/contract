const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

// Parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the current directory
app.use(express.static('.'));

// MongoDB Connection URI
const uri = 'mongodb://127.0.0.1:27017';
const dbName = 'biometrics';
const collectionName = 'registration';

// Route for serving the 'index.html' file
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: '.' });
});

// Route for user registration
app.post('/register', async (req, res) => {
    // Get user registration data from the request body
    const { firstName, lastName, email, password, department } = req.body;

    // Connect to MongoDB
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();

        // Access the biometrics database and the registration collection
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Check if the user already exists
        const existingUser = await collection.findOne({ email });

        if (existingUser) {
            // User already exists, send back failure message
            res.status(400).json({ error: 'User already exists' });
        } else {
            // Insert the new user into the collection
            await collection.insertOne({ firstName, lastName, email, password, department });

            // Respond with success message
            res.status(201).json({ message: 'User registered successfully' });
        }
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Server error' });
    } finally {
        // Close the MongoDB connection
        await client.close();
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
