const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');

mongoose.connect('mongodb+srv://vinothg0618:vinoth112003@cluster0.fiy26nf.mongodb.net/quiz_data');
const db = mongoose.connection;

db.once('open', () => {
    console.log('Connected to MongoDB');
});
db.on('error', (err) => {
    console.log(err);
});

const questionSchema = new mongoose.Schema({
    Question: String,
    "Option A": String,
    "Option B": String,
    "Option C": String,
    Answer: String
});

const Question = mongoose.model('Question', questionSchema, "question");

const teamSchema = new mongoose.Schema({
    team_name: String,
    questions: [{
        question_id: mongoose.Schema.Types.ObjectId,
        Question: String,
        "Option A": String,
        "Option B": String,
        "Option C": String,
        Answer: String,
    }],
    AnsweredQuestions: {type: [Boolean], default: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]},
    images_found: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    score: { type: Number, default: 0 }
});

const Team = mongoose.model('Team', teamSchema);

const app = express();

app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('views', path.join(__dirname, 'public'));


app.use(session({
    secret: 'your-secret-key', // Change this to a strong secret key
    resave: false,
    saveUninitialized: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/login', async (req, res) => {
    const team_name = req.query.team_name;
    if (team_name == undefined || team_name == "" || team_name == null) {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    } else {
        try {
            // Check if the team name already exists in the database
            const existingTeam = await Team.findOne({ team_name });

            if (existingTeam) {
                // If the team exists, add the team ID to session and redirect to dashboard
                req.session.teamId = existingTeam._id;
                console.log("already exists")
                return res.redirect('/dashboard');
            }

            // If the team does not exist, generate random questions and create a new team
            const numberOfRandomQuestions = 16;
            const randomQuestions = await Question.aggregate([{ $sample: { size: numberOfRandomQuestions } }]);

            const newTeam = new Team({
                team_name: team_name,
                questions: randomQuestions,
                images_found: 0,
                attempts: 0,
                score: 0
            });

            const savedTeam = await newTeam.save();
            req.session.teamId = savedTeam._id;
            console.log("Team ID:", savedTeam._id);
            res.redirect('/dashboard');
        } catch (error) {
            console.error("Error occurred:", error);
            res.status(500).send("Internal Server Error");
        }
    }
});

app.get("/dashboard", async (req, res) => {
    // Access teamId from session
    const teamId = req.session.teamId;

    try {
        // Fetch team details from the database using teamId
        const team = await Team.findById(teamId);

        if (team) {
            res.render('dashboard', { team: team });
        }else{
            res.redirect('/');
        }
        // Now you can use team details as needed
         // Render the dashboard view with team details
    } catch (error) {
        console.error("Error fetching team details:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/question/:index', async (req, res) => {
    const index = req.params.index;
    try {
        const question = await Question.findOne().skip(index).exec();
        if (question) {
            res.json({ success: true, question: question });
        } else {
            res.status(404).json({ success: false, message: "Question not found" });
        }
    } catch (error) {
        console.error("Error fetching question:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Endpoint to update score
app.put('/updateScore', async  (req, res) => {
    const { teamId, increment } = req.body;
    try {
        // Assuming you have a Team model defined
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ success: false, message: "Team not found" });
        }
        // Update the score
        team.score += increment;
        await team.save();
        res.sendStatus(200); // Send success response
    } catch (error) {
        console.error("Error updating score:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Endpoint to update attempts
app.put('/updateAttempt', async (req, res) => {
    const { teamId } = req.body;
    try {
        // Assuming you have a Team model defined
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ success: false, message: "Team not found" });
        }
        // Update the attempts
        team.attempts++;
        await team.save();
        res.sendStatus(200); // Send success response
    } catch (error) {
        console.error("Error updating attempts:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Backend route to handle updating answered questions
// Backend route to handle updating answered questions
app.put('/updateAnsweredQuestions/:userId/:questionIndex/:boolValue', async (req, res) => {
    const { userId, questionIndex, boolValue } = req.params;
    try {
        const user = await Team.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Update AnsweredQuestions array
        user.AnsweredQuestions[questionIndex] = boolValue;
        // Save updated user data back to the database
        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



app.get('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Internal Server Error');
        } else {
            // Redirect the user to the login page or any other desired page
            res.redirect('/');
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/`);
});
