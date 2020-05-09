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

const repoQuestion = [
    {
        type: 'input',
        name: 'repo',
        message: 'What is the name or URL of the repository you wish to generate a README for?'
    }
];

var githubUser;

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
            githubUser = username;

            const githubURL = `https://api.github.com/users/${githubUser}/repos?per_page=100`;

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

    if (foundRepo == null) {
        console.log(`I'm sorry, I didn't find any repos in your Github account with that name!`);
        // Re-ask the user what the repo should
        return inquireRepo(response);
    }

    generateReadMe(foundRepo);
}

function inquireRepo(response) {
    // Ask users the predefined questions
    inquirer.prompt(repoQuestion)
        .then(answers => {
            // Save the username and repo given by the user
            const {repo} = answers;

            getRepoInfo(response, repo);
        })
        .catch(error => {
            throw error;
        });
}

function generateReadMe(repo) {
    console.log(repo);

    let readme = '';

    // Generate language badge
    readme += `![Language](https://badgen.net/badge/language/${repo.language.toLowerCase()}/purple) ![Commits](https://badgen.net/github/commits/micromatch/micromatch) ![LastCommit](https://badgen.net/github/last-commit/micromatch/micromatch)\n`;

    // Add Title
    readme += `\n# ${formatTitle(repo.name)}\n`;

    // Project description
    readme += `\n## Description\n${repo.description || 'Description of project here'}\n`;

    // Table of contents
    readme += `\n## Table of Contents
    * [Installation](#installation)
    * [Usage](#usage)
    * [License](#license)
    * [Contributing](#contributing)
    * [Tests](#tests)
    * [Questions](#questions)\n`;
    
    // Installation
    readme += `\n## Installation\nInstallation instructions here\n`;

    // Usage
    readme += `\n## Usage\nUsage instructions here\n`;

    // License
    readme += `\n## License\nEasy way to choose your license: https://choosealicense.com/\n`;

    // Contributing
    readme += `\n## Contributing\nContribution instructions here\n`;

    // Tests
    readme += `\n## Tests\nInstructions on running automated tests here\n`;

    // Questions
    readme += `\n## Questions\nInquiries? Send them to:
    * ![Github](${repo.owner.avatar_url}) {your email}\n`;

    writeToFile(repo.name + '.md', readme);
}

function formatTitle(repoTitle) {
    // Split word up by capital letters
    // so 'thisTitle' becomes ['this', 'Title']
    words = repoTitle.split(/(?=[A-Z])/);

    for (let i = 0; i < words.length; i++) {
        let word = words[i];
        let upperChar = word.charAt(0).toUpperCase();
        newWord = upperChar + word.substr(1);
        words[i] = newWord;
    }

    return words.join(' ');
}