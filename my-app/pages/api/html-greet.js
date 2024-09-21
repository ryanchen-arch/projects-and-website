export default function handler(req, res) {
    let { name = "World" } = req.query;
    if (name === "World") {
        res.status(200).send(`
        <html>
            <body>
                <h1>Hello, ${name}!</h1>
                <p>This is a default HTML response.</p>
            </body>
        </html>
        `);
    }
    else {
        res.status(200).send(`
        <html>
            <body>
                <h1>Hello, ${name}!</h1>
                <p>This is a personalized HTML response.</p>
            </body>
        </html>
        `);
    }
    
    
}