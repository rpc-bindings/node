const editJsonFile = require("edit-json-file");

let file = editJsonFile(`${__dirname}/package.json`);

const currentVersion = file.get('version');
const buildNumber = process.argv[2];
const newVersion = currentVersion + '-pre.' + buildNumber;

file.set('version', newVersion);

file.save();

