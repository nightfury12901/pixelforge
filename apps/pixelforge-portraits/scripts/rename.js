const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['app', 'components', 'lib'];
const EXTENSIONS = ['.tsx', '.ts', '.md'];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (EXTENSIONS.some(ext => file.endsWith(ext))) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = [];
DIRECTORIES.forEach(dir => {
    if (fs.existsSync(dir)) {
        files.push(...walk(dir));
    }
});

let updatedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;

    // Replace PixelForge AI -> AuraShot
    content = content.replace(/PixelForge AI/g, 'AuraShot');
    // Replace PixelForge -> AuraShot
    content = content.replace(/PixelForge/g, 'AuraShot');
    // Replace pixelforge.ai -> aurashot.in
    content = content.replace(/pixelforge\.ai/g, 'aurashot.in');
    content = content.replace(/pixelforgeai/g, 'aurashot');
    content = content.replace(/pixelforge/g, 'aurashot');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated: ${file}`);
        updatedCount++;
    }
});

console.log(`\nReplacement complete. Updated ${updatedCount} files.`);
