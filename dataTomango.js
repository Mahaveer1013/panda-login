const mongoose = require('mongoose');

// Connection URI
const uri = 'mongodb+srv://vinothg0618:vinoth112003@cluster0.fiy26nf.mongodb.net/quiz_data'; // Change this to your MongoDB URI

// Database Name
const collectionName = 'question'; // Change this to your collection name

// Connect to MongoDB using Mongoose
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Define a schema for your collection
const questionSchema = new mongoose.Schema({
  Question: String,
  "Option A": String,
  "Option B": String,
  "Option C": String,
  Answer: String
});

// Define a model for your collection
const Question = mongoose.model('Question', questionSchema, collectionName);

// Define the number of random questions to retrieve
const numberOfRandomQuestions = 16;

// Retrieve random 16 documents from the collection
Question.aggregate([
  { $sample: { size: numberOfRandomQuestions } }
])
  .then(randomQuestions => {
    console.log("Random questions:", randomQuestions);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error("Error occurred while fetching random questions:", err);
    mongoose.disconnect();
  });
