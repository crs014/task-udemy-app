const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendCancelEmail } = require('../emails/account');
const router = express.Router();
const upload = multer({
    limits : {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
           return cb(new Error('please upload a image file')) 
        }
        cb(undefined, true);
    }
});


router.get('/me', auth, (req, res) => {
    res.json(req.user);
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);   
        if(!user) {
            return res.status(404).send("Not Found");    
        }
        res.send(user);
    } catch (error) {
        res.status(500).send("error");
    }
});

router.get('/:id/avatar', async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar) {
            throw new Error();
        }
        res.set('Content-Type', 'image/jpg');
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send("error");
    }
});

router.post('/', async (req, res) => {
    try {
        const user = await new User(req.body).save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    //req.user.avatar = req.file.buffer;
    const buffer = await sharp(req.file.buffer).resize({ 
        resize : 250, 
        height : 250 
    }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.json({ success : true });   
}, (err, req, res, next) => {
    res.status(400).json({ error : err.message })
});

router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCrendentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });

    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();

        res.send();
    } catch (error) {
        res.status(500).send();
    }
});

router.post('/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send();
    }
});

router.patch('/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if(!isValidOperation) {
        return res.status(400).send("invalid update");
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update] );
        await req.user.save();
        if(!user) {
            return res.status(404).send("Not Found");
        }

        res.send(user);

    } catch (error) {
        res.status(400).send(error);
    }
});


router.delete('/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        sendCancelEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (error) {
        res.status(400).send(error);
    }
});


router.delete('/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = null;
        await req.user.save();
        res.send("success");
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;