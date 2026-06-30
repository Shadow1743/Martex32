const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, 'frontend');
const configFile = path.join(frontendDir, 'config.js');

// 1. Create config.js
const configContent = `// Archivo de configuración global
const CONFIG = {
    API_URL: 'http://localhost:3000/api',
    BASE_URL: 'http://localhost:3000'
};
`;
fs.writeFileSync(configFile, configContent, 'utf8');

// Helper to process files
function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.html') || file.endsWith('.js')) {
            if (fullPath === configFile) continue; // Skip config.js
            
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            // 2. Inject config.js into HTML files
            if (file.endsWith('.html')) {
                if (!content.includes('config.js')) {
                    // Determine relative path to frontend/config.js
                    const relativePath = path.relative(path.dirname(fullPath), frontendDir).replace(/\\/g, '/');
                    const configScriptTag = `\n    <script src="${relativePath}/config.js"></script>`;
                    
                    // Try to insert after <head> or <title>
                    if (content.includes('<head>')) {
                        content = content.replace('<head>', '<head>' + configScriptTag);
                        modified = true;
                    }
                }
            }
            
            // 3. Replace hardcoded URLs
            if (content.includes('http://localhost:3000/api')) {
                content = content.replace(/'http:\/\/localhost:3000\/api/g, 'CONFIG.API_URL + \'');
                content = content.replace(/"http:\/\/localhost:3000\/api/g, 'CONFIG.API_URL + "');
                content = content.replace(/`http:\/\/localhost:3000\/api/g, '`${CONFIG.API_URL}');
                modified = true;
            }
            if (content.includes('http://localhost:3000')) {
                content = content.replace(/'http:\/\/localhost:3000/g, 'CONFIG.BASE_URL + \'');
                content = content.replace(/"http:\/\/localhost:3000/g, 'CONFIG.BASE_URL + "');
                content = content.replace(/`http:\/\/localhost:3000/g, '`${CONFIG.BASE_URL}');
                modified = true;
            }
            
            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDirectory(frontendDir);
console.log('Refactor completed successfully.');
