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
let purchasesCollection;

// CONNECT TO MONGO & RUN SERVER
async function run() {
  try {
    await client.connect();
    console.log("MongoDB Connected Successfully");

    const database = client.db("toyTopiaDB");
    toysCollection = database.collection("toys");
    purchasesCollection = database.collection("purchases");

    // -----------------------------
    // ROUTES START
    // -----------------------------

    app.get("/", (req, res) => {
      res.send("ToyTopia Backend is Running 🚀");
    });

    // =====================================
    // 📌 GET ALL TOYS
    // =====================================
    app.get("/toys", async (req, res) => {
      const toys = await toysCollection.find().toArray();
      res.send(toys);
    });

    // 📌 GET SINGLE TOY BY ID
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

    // 📌 UPDATE TOY (quantity update)
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

    // ==========================================
    // PURCHASES APIS
    // ==========================================

    // 📌 ADD PURCHASE
    app.post("/purchases", async (req, res) => {
      const purchase = req.body; // toyName, pictureURL, toyPrice, quantity, email, date
      const result = await purchasesCollection.insertOne(purchase);
      res.send(result);
    });

    // 📌 GET PURCHASES BY USER EMAIL
    app.get("/purchases", async (req, res) => {
      const email = req.query.email;
      const purchases = await purchasesCollection.find({ email }).toArray();
      res.send(purchases);
    });

    // 📌 DELETE PURCHASE
    app.delete("/purchases/:id", async (req, res) => {
      const id = req.params.id;
      const result = await purchasesCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // -----------------------------
    // START SERVER
    // -----------------------------
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (error) {
    console.log("Database connection error:", error);
  }
}

run();
