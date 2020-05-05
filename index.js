const axios = require('axios');
const inquirer = require('inquirer');
const fs = require('fs');

const questions = [
    {
        type: 'input',
        name: 'username',
        message: 'What is your github username?'
    },
    {
        type: 'input',
        name: 'repo',
        message: 'What is the name or URL of the repository you wish to generate a README for?'
    }
];

start();

function writeToFile(fileName, data) {
    fs.writeFile(fileName, data, 'utf8', function(err) {
        if (err) throw err;
    });
}

function start() {
    // Ask users the predefined questions
    inquirer.prompt(questions)
        .then(answers => {
            // Save the username and repo given by the user
            const {username, repo} = answers;

            const githubURL = `https://api.github.com/users/${username}/repos?per_page=100`;

            axios.get(githubURL)
                .then(response => {
                    getRepoInfo(response, repo);
                })
                .catch(error => {
                    throw error;
                });
        })
        .catch(error => {
            throw error;
        });
}

function getRepoInfo(response, repoName) {
    let foundRepo = null;

    // Try to find repo with given name
    for (repo of response.data) {
        if (repo.name.toLowerCase() == repoName.toLowerCase()) {
            foundRepo = repo;
            break;
        }
    }

    console.log(foundRepo);
}