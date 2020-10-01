const router = require('express').Router();

const users = require("../../users/users-module");
const bcrypt = require("bcryptjs");

router.post('/register', async (req, res, next) => {
    let user = req.body;
    const hash = bcrypt.hashSync(user.password, 10);
    user.password = hash;

    try{
        const saved = await users.add(user);
        res.status(201).json(saved);
    } catch (err) {
        next({apiCode: 500, apiMessage: 'error registering', ...err});
    }
})

router.post("/login", async( req, res) => {
    let { username, password } = req.body;


    try{
        const [user] = await users.findBy({username});

        if (user && bcrypt.compareSync(password, user.password)) {
            req.session.user = user;
            res.status(200).json({message: `welcome ${user.username}!`, });
        } else {
            res.status(401).json({message: 'invalid credentials'});
        }
    } catch (err) {
        res.status(500).json({message: err.message})
    };
});

router.delete('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                res.status(400).json({ message: 'error logging out:', error: err });
            } else {
                res.json({ message: 'logged out' });
            }
        });
    } else {
        res.end();
    }
});
module.exports = router;