export default function handler(req, res) {
    let { name, age, preferences } = req.body;
    if (typeof(name) === 'string') {
        res.status(400).send("error: name is required");
    }
    else if (typeof(age) === "number") {
        res.status(400).send("error: age is required");
    }
    else if (typeof(preferences) === "object") {
        res.status(400).send("error: preferences is required");
    } /*
    else if (Object.keys(preferences).length < 2) {
        res.status(400).send("error: preferences must have at least 2 properties");
    } */
    else {
        res.status(200).json({
            message: "Hello, " + name + "!",
            message: "You are " + age + " years old.",
        });
        /*
        preferences.forEach(element => {
            res.status.json ({

            });
        }); */
        if (age >= 18) {
            res.status(200).json({
                message: "You're eligible for our special offers!"
            });
        }
    }
}