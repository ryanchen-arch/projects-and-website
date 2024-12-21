const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { language, code, input } = req.body;

    if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Code is required and must be a string' });
    }

    const tempDir = os.tmpdir();
    const langDockerfileMap = {
        'C': 'Dockerfile.c',
        'C++': 'Dockerfile.cpp',
        'Java': 'Dockerfile.java',
        'Javascript': 'Dockerfile.node',
        'Python': 'Dockerfile.python',
        'Ruby': 'Dockerfile.ruby',
        'Go': 'Dockerfile.go',
        'Rust': 'Dockerfile.rust',
        'PHP': 'Dockerfile.php',
        'C#': 'Dockerfile.csharp',
    };
    const fileEnd = {
        'C': 'c',
        'C++': 'cpp',
        'Java': 'java',
        'Javascript': 'js',
        'Python': 'py',
        'Ruby': 'rb',
        'Go': 'go',
        'Rust': 'rs',
        'PHP': 'php',
        'C#': 'cs',
    };

    if (!langDockerfileMap[language]) {
        return res.status(400).json({ error: 'Unsupported language' });
    }
    const dockerBuildContext = path.join(process.cwd(), 'pages', 'api', 'executeDocker');
    const dockerfilePath = path.join(process.cwd(), 'pages', 'api', 'executeDocker', langDockerfileMap[language]);

    const tempFilePath = path.join(dockerBuildContext, `temp.${fileEnd[language]}`);
    const imageName = `code_runner_language`;
    const containerName = `code_runner_${Date.now()}`;

    try {
        // Write code to a temporary file
        fs.writeFileSync(tempFilePath, code);
    } catch (err) {
        console.error('Error writing file:', err);
        return res.status(500).json({ error: 'Failed to write file' });
    }

    // Build Docker image if not already built
    const buildCmd = `docker build -t ${imageName} -f "${dockerfilePath}" ./pages/api/executeDocker`;

    exec(buildCmd, (buildErr) => {
        if (buildErr) {
            console.error('Docker build error:', buildErr);
            return res.status(500).json({ error: 'Failed to build Docker image' });
        }

        // Run Docker container with the built image
        const runCmd = `docker run -i --rm --name ${containerName} -v ${tempDir}:/code ${imageName}`;
        const child = exec(runCmd);

        // Handle input if provided
        if (input) {
            if (Array.isArray(input)) {
                input.forEach((item) => child.stdin.write(item + '\n'));
            } else {
                child.stdin.write(input + '\n');
            }
        }
        child.stdin.end();

        let stdout = '';
        let stderr = '';

        // Capture standard output and errors
        child.stdout.on('data', (data) => {
            stdout += data;
        });
        child.stderr.on('data', (data) => {
            stderr += data;
        });

        // Handle process close
        child.on('close', (code) => {
            cleanupTempFiles(tempFilePath);

            if (code !== 0) {
                return res.status(500).json({ error: stderr.trim() || 'Unknown error occurred during execution' });
            }
            return res.status(200).json({ output: stdout.trim() || 'Execution completed successfully but produced no output.' });
        });

        // Handle process execution errors
        child.on('error', (err) => {
            cleanupTempFiles(tempFilePath);
            console.error('Execution error:', err);
            return res.status(500).json({ error: `Execution failed: ${err.message}` });
        });
    });
}

// Utility function to clean up temporary files
function cleanupTempFiles(filePath) {
    if (filePath) {
        fs.unlink(filePath, (err) => {
            if (err) console.error(`Failed to delete temp file (${filePath}):`, err);
        });
    }
}
