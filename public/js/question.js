// Global variables
let team_id = document.getElementById("team_id").value;
let masks = document.querySelectorAll('.mask');
let questionContainer = document.querySelector('.questio_container .question');
let optionsContainer = document.querySelector('.questio_container .question_options');
let submitButton = document.querySelector('.questio_container .buttons .submit');
let currentQuestionResponse; // Variable to store the current question response

// Array to track answered questions
let answered_questions = new Array(masks.length).fill(false);

// Function to send attempt update
function sendAttemptUpdate(teamId) {
    let updateAttemptXhr = new XMLHttpRequest();
    updateAttemptXhr.open('PUT', '/updateAttempt', true);
    updateAttemptXhr.setRequestHeader('Content-Type', 'application/json');
    updateAttemptXhr.onreadystatechange = function() {
        if (updateAttemptXhr.readyState === XMLHttpRequest.DONE) {
            if (updateAttemptXhr.status === 200) {
                console.log("Attempt updated successfully");
            } else {
                console.error("Error updating attempt:", updateAttemptXhr.status);
            }
        }
    };
    updateAttemptXhr.send(JSON.stringify({ teamId: teamId }));
}

// Function to send score update
function sendScoreUpdate(teamId, increment) {
    let updateScoreXhr = new XMLHttpRequest();
    updateScoreXhr.open('PUT', '/updateScore', true);
    updateScoreXhr.setRequestHeader('Content-Type', 'application/json');
    updateScoreXhr.onreadystatechange = function() {
        if (updateScoreXhr.readyState === XMLHttpRequest.DONE) {
            if (updateScoreXhr.status === 200) {
                console.log("Score updated successfully");
            } else {
                console.error("Error updating score:", updateScoreXhr.status);
            }
        }
    };
    updateScoreXhr.send(JSON.stringify({ teamId: teamId, increment: increment }));
}

// Function to get question details
function getQuestionDetails(index) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/question/' + index, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                let response;
                try {
                    response = JSON.parse(xhr.responseText);
                    console.log("Response:", response);
                } catch (error) {
                    console.error("Error parsing response:", error);
                    return;
                }
                if (response.success) {
                    currentQuestionResponse = response; // Store the response
                    displayQuestion(response.question);
                } else {
                    console.error("Error:", response.message);
                }
            } else {
                console.error("Error:", xhr.status);
            }
        }
    };
    xhr.send();
}

// Function to display question details
function displayQuestion(question) {
    questionContainer.textContent = question.Question;
    optionsContainer.innerHTML = '';

    let optionKeys = ['Option A', 'Option B', 'Option C'];
    optionKeys.forEach(function(key) {
        let optionLabel = document.createElement('label');
        let optionInput = document.createElement('input');
        optionInput.type = 'radio';
        optionInput.name = 'option';
        optionInput.value = key;
        optionInput.classList.add('radioBtn');
        optionLabel.appendChild(optionInput);
        optionLabel.appendChild(document.createTextNode(question[key]));
        optionsContainer.appendChild(optionLabel);
        optionsContainer.appendChild(document.createElement('br'));
    });

    submitButton.disabled = false;
}

// Event listener for mask click
document.addEventListener('DOMContentLoaded', function() {
    masks.forEach(function(mask, index) {
        mask.addEventListener('click', function() {
            console.log("Index:", index);
            getQuestionDetails(index);
        });
    });

    // Handle submission of the answer
    submitButton.onclick = function() {
        if (currentQuestionResponse) {
            let selectedOption = optionsContainer.querySelector('input[name="option"]:checked');
            if (selectedOption) {
                let selectedValue = selectedOption.value;
                if (selectedValue === currentQuestionResponse.question['Answer']) {
                    sendScoreUpdate(team_id, 10);
                } else {
                    sendAttemptUpdate(team_id);
                }
            } else {
                alert("Please select an option.");
            }
        } else {
            console.error("No question response available.");
        }
    };
});
