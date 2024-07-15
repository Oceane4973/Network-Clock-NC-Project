const fs = require('fs');
const path = require('path');
const glob = require('glob');
const uglifyJS = require('uglify-js');

const srcDir = path.resolve(__dirname, 'src');
const destDir = path.resolve(__dirname, '../resources/static/js');

// Ensure destination directory exists
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

// Get all JavaScript files in the src directory, excluding tests
const files = glob.sync(`${srcDir}/**/*.js`, {
    ignore: [`${srcDir}/__tests__/**/*.js`, `${srcDir}/minify.js`]
});

files.forEach(file => {
    const filePath = path.resolve(file);
    const fileName = path.basename(filePath);
    const minifiedFilePath = path.resolve(destDir, fileName.replace('.js', '.min.js'));

    let fileContent = fs.readFileSync(filePath, 'utf8');

    // Replace relative imports with paths to minified versions
    fileContent = fileContent.replace(/from\s+"\.\/modules\/(\w+)\.js"/g, 'from "./$1.min.js"');
    fileContent = fileContent.replace(/from\s+'\.\/modules\/(\w+)\.js'/g, 'from \'./$1.min.js\'');
    fileContent = fileContent.replace(/from\s+"\.\/(\w+)\.js"/g, 'from "./$1.min.js"');
    fileContent = fileContent.replace(/from\s+'\.\/(\w+)\.js'/g, 'from \'./$1.min.js\'');

    const result = uglifyJS.minify(fileContent);

    if (result.error) {
        console.error(`Error minifying ${fileName}:`, result.error);
    } else {
        fs.writeFileSync(minifiedFilePath, result.code, 'utf8');
        console.log(`Minified ${fileName} -> ${minifiedFilePath}`);
    }
});
