
import express from "express"
import { MongoClient } from "mongodb";
import * as dotenv from 'dotenv'
dotenv.config()
const app = express();


const PORT = process.env.PORT;

const MONGO_URL = process.env.MONGO_URL;
const client = new MongoClient(MONGO_URL)
await client.connect()
console.log("Mongo is connected")

app.get("/", async function (request, response) {
    const allmentors = await client.db("stumentor").collection('mentors').find({}).toArray()
    response.send(allmentors);
});





// create student
app.post("/createstudent", express.json(), async function (request, response) {
    const createStudent = await client.db("stumentor").collection('students').insertOne(request.body)
    response.send(createStudent);
});





//create mentor
app.post("/creatementor", express.json(), async function (request, response) {
    const data = request.body
    const mentors = await client.db("stumentor").collection('mentors').insertOne(data)
    response.send(mentors);

});


//assigning student names to mentor
app.put("/mentors/:id", express.json(), async function (request, response) {
    const data = request.body
    const { id } = request.params;
    console.log(id)
    const stu = await client.db("stumentor").collection("students").findOne({ name: data.name })

    if (stu) {
        const assignStudent = await client.db("stumentor").collection('mentors').updateOne({ mentor_name: id }, { $push: { assigned_students: data } })
        await client.db("stumentor").collection("students").updateOne({ name: data.name }, { $set: { assigned: "true" } })
        response.send(assignStudent);
    } else {
        response.send({ message: "there is no such student name please verify" });

    }




});



//diplaying unassigned students list
app.get("/unassigned", async function (request, response) {
    const unassigned = await client.db("stumentor").collection("students").find({ assigned: "false" }).toArray()
    response.send(unassigned)
})




//to show all students foe particular mentor
app.get("/partstudents/:id", async function (request, response) {
    const { id } = request.params
    const unassigned = await client.db("stumentor").collection("mentors").find({ mentor_name: id }, { assigned_students: 1 }).toArray()

    unassigned ? response.send(unassigned) : response.send("please check the mentor name")

})



app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));
