const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');

const app = express();

app.use(express.json());
app.use(cors());
app.use(fileUpload());
require('dotenv').config();
const port = 5000;

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const uri = process.env.DB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
    const serviceCollection = client.db("travelGuru").collection("serviceCollection");
    const orderCollection = client.db("travelGuru").collection("orderCollection");
    const reviewCollection = client.db("travelGuru").collection("reviewCollection");
    const adminCollection = client.db("travelGuru").collection("adminCollection");

    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const price = req.body.price;
        const description = req.body.description;

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        }
        serviceCollection.insertOne({ name, price, description, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/services', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.post('/addOrder', (req, res) => {
        const orderInfo = req.body;
        orderCollection.insertOne(orderInfo)
            .then(result =>
                res.send(result.insertedCount > 0));
    })

    app.post('/addReview', (req, res) => {
        const reviewInfo = req.body;
        reviewCollection.insertOne(reviewInfo)
            .then(result =>
                res.send(result.insertedCount > 0));
    })

    app.get('/allReviews', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.post('/addAdmin', (req, res) => {
        adminCollection.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.post('/isAdmin', (req, res) => {
        const emailGiven = req.body.email;
        adminCollection.find({ email: emailGiven })
            .toArray((err, documents) => {
                res.send(documents.length > 0);
            })
    })

    app.post('/allOrders', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, documents) => {
                if (documents.length === 0) {
                    filter = { email: email };
                } else {
                    filter = {};
                }
                orderCollection.find(filter)
                    .toArray((err, documents) => {
                        res.send(documents);
                    })
            })
    })

    app.get('/allBookings', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.delete('/deleteService/:id', (req, res) => {
        serviceCollection.deleteOne({ _id: ObjectID(req.params.id) })
            .then((result) => {
                res.send(result.deletedCount > 0);
            })
    })

    app.patch('/updateStatus/:id', (req, res) => {
        orderCollection.updateOne({ _id: ObjectID(req.params.id) }, {
            $set: { status: req.body.orderStatus }
        })
            .then(result => {
                res.send(result.modifiedCount > 0);
            })
    })
});


app.get('/', (req, res) => {
    res.send('Hello duniya');
})

app.listen(process.env.PORT || port);