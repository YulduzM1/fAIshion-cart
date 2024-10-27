require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

let db;
const client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect().then(() => {
    db = client.db('fashionAIsian'); // Database name
    console.log('Connected to MongoDB');
}).catch(err => console.error('Failed to connect to MongoDB', err));

// Middleware to parse JSON
app.use(express.json());

// Retrieve all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await db.collection('products').find({}, {
            projection: {
                title: 1,
                description: 1,
                "images": { $slice: 1 }, // Get only the first image URL
                category_name: 1,
                color: 1,
                "sizes.attr_value_name": 1, // Get only the 'attr_value_name' field for each size
                "sale_price.amount_with_symbol": 1,// Get only the 'amount_with_symbol' field for the sale price
                url: 1,
            }
        }).toArray();

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving products', error });
    }
});

app.post('/api/search', async (req, res) => {
    try {
        const { category_name } = req.body; // Extract category_name from JSON payload

        if (!category_name) {
            return res.status(400).json({ message: 'category_name is required' });
        }

        const products = await db.collection('products')
            .find({ category_name: category_name }, {
                projection: {
                    title: 1,
                    description: 1,
                    "images": { $slice: 1 }, // Get only the first image URL
                    color: 1,
                    "sizes.attr_value_name": 1, // Get only the 'attr_value_name' field for each size
                    "sale_price.amount_with_symbol": 1, // Get only the 'amount_with_symbol' field for the sale price
                    url: 1,
                }
            }).toArray();

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error searching products', error });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
