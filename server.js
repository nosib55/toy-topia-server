import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MONGODB CONNECTION
const client = new MongoClient(process.env.MONGO_URI);

let toysCollection;

// Connect to MongoDB FIRST → then start server
async function run() {
  try {
    await client.connect();
    console.log("MongoDB Connected Successfully");

    const database = client.db("toyTopiaDB");
    toysCollection = database.collection("toys");
    const purchasesCollection = database.collection("purchases");

    // --- ROUTES BELOW ---

    app.get("/", (req, res) => {
      res.send("Toy Topia Backend is Running");
    });

    // 📌 GET ALL TOYS
    app.get("/toys", async (req, res) => {
      const toys = await toysCollection.find().toArray();
      res.send(toys);
    });

    // 📌 GET SINGLE TOY DETAILS
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const toy = await toysCollection.findOne({ _id: new ObjectId(id) });
      res.send(toy);
    });

    // 📌 ADD NEW TOY
    app.post("/toys", async (req, res) => {
      const newToy = req.body;
      const result = await toysCollection.insertOne(newToy);
      res.send(result);
    });

    // 📌 UPDATE TOY (quantity update, etc.)
    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const updatedToy = req.body;

      const result = await toysCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedToy }
      );

      res.send(result);
    });

    // 📌 DELETE TOY
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const result = await toysCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // START SERVER AFTER DB CONNECTED
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

  } catch (error) {
    console.log("Database connection error:", error);
  }
}

run();
