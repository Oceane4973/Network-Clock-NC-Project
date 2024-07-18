/**
    * Script for minifying JavaScript files.
    *
    * This script performs the following tasks:
    * - Resolves the source and destination directories for JavaScript files.
    * - Creates the destination directory if it does not exist.
    * - Uses the glob library to find all JavaScript files in the source directory, excluding test files and the minify script itself.
    * - Reads each JavaScript file and replaces import paths to reference minified versions of the modules.
    * - Minifies the JavaScript file content using UglifyJS.
    * - Writes the minified content to the destination directory, maintaining the same file structure but with a .min.js extension.
    *
    * This script ensures that the JavaScript files are optimized for production by reducing their size and improving load times.
    * Any errors encountered during the minification process are logged to the console.
*/

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const uglifyJS = require('uglify-js');

const srcDir = path.resolve(__dirname, 'src');
const destDir = path.resolve(__dirname, '../resources/static/js');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

const files = glob.sync(`${srcDir}/**/*.js`, {
    ignore: [`${srcDir}/__tests__/**/*.js`, `${srcDir}/minify.js`]
});

files.forEach(file => {
    const filePath = path.resolve(file);
    const fileName = path.basename(filePath);
    const minifiedFilePath = path.resolve(destDir, fileName.replace('.js', '.min.js'));

    let fileContent = fs.readFileSync(filePath, 'utf8');

    fileContent = fileContent.replace(/from\s+"\.\/modules\/(\w+)\.js"/g, 'from "./$1.min.js"');
    fileContent = fileContent.replace(/from\s+'\.\/modules\/(\w+)\.js'/g, 'from \'./$1.min.js\'');
    fileContent = fileContent.replace(/from\s+"\.\/(\w+)\.js"/g, 'from "./$1.min.js"');
    fileContent = fileContent.replace(/from\s+'\.\/(\w+)\.js'/g, 'from \'./$1.min.js\'');

    const result = uglifyJS.minify(fileContent);

    if (result.error) {
        console.error(`Error minifying ${fileName}:`, result.error);
    } else {
        fs.writeFileSync(minifiedFilePath, result.code, 'utf8');
    }
});
