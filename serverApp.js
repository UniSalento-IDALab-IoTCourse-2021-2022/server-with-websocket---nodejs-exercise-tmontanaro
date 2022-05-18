const express = require("express");
const app = express();
const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost/';


app.listen(3000, () => {
    console.log("Server running on port 3000");
});
app.use(
    express.urlencoded({
        extended: true
    })
)

app.use(express.json());
app.post("/temperature", (req, res, next) => {
    console.log(req.body.temperature);
    var temperature = req.body.temperature;
    var timestamp = req.body.timestamp;
    var sensor = req.body.sensor;

    async function run() {

		const client = new MongoClient(uri, {useUnifiedTopology: true});
        try {

            await client.connect();

            const database = client.db("TemperatureDB");
            const temperatureColl = database.collection("temperature");
            // create a document to be inserted
            const doc = {
                value: temperature,
                timestamp: timestamp,
                sensorId: sensor,
                roomId: 'room1'
            };

            const result = await temperatureColl.insertOne(doc);
            console.log(`${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`,);
        } finally {
            await client.close();
        }
    }

    run().catch(console.dir);
    res.sendStatus(200)
});

app.get('/dashboard', async (req, res) => {
    async function run() {
		const client = new MongoClient(uri, {useUnifiedTopology: true});
        try {
			
            await client.connect();
            const database = client.db("TemperatureDB");
            const tem = database.collection("temperature");
            // Query for a temperature with a timestamp that is greater than 0
            const query = { timestamp: {$gt: 0}};
            const options = {
                // sort matched documents in descending order by timestamp
                sort: { timestamp: -1 },
            };
            const singleTemperature = await tem.findOne(query, options);
            // since this method returns the matched document, not a cursor, print it directly
            console.log(singleTemperature);
            try {
                return singleTemperature.value;
            }
            catch (e)
            {
                return -1;
            }
        } finally {
            await client.close();
        }
    }
    //use await for wating the promise
    var finalTemp = await run().catch(console.dir);
    res.send('Hello World! The last temperature is: '+finalTemp);
})
