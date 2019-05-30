const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const router = express.Router(); 


router.get('/', auth, async (req, res) => {
    try {
        //const tasks = await Task.find({ owner : req.user._id });
        const match = {};
        const sort = {};
        if(req.query.completed) {
            match.completed = req.query.completed === 'true';
        }

        if(req.query.sortBy) {
            const [ propName, propValue ]  = req.query.sortBy.split(':');
            sort[propName] = propValue === 'desc' ? -1 : 1;
        }

        await req.user.populate({
            path : 'tasks',
            match,
            options : {
                limit : parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                sort
            } 
        }).execPopulate();

        res.send(req.user.tasks);
    } catch (error) {
        res.status(500).send("error");
    }
});

router.get('/:id', auth, async (req, res) => {
    try {
        
        const task = await Task.findOne({ _id : req.params.id, owner : req.user._id });
        //
        if(!task) {
            return res.status(404).send("Not Found");
        }
        await task.populate('owner').execPopulate();
        res.send(task);
    } catch (error) {
        res.status(500).send("error"); 
    }
});


router.post('/', auth, async (req, res) => {
    try {
        const task = await new Task({...req.body, owner: req.user._id}).save();
        res.status(201).send(task);        
    } catch (error) {
        res.status(400).send(error);
    }
});


router.patch('/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['completed', 'description'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if(!isValidOperation) {
        return res.status(400).send("invalid update");
    }
    
    try {
        /*const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new : true,
            runValidators : true
        });*/

        //const task = await Task.findById(req.params.id);
        const task = await Task.findOne({_id : req.params.id, owner : req.user._id });
        updates.forEach((update) => task[update] = req.body[update] );
        await task.save();    

        if(!task) {
            return res.status(404).send("Not Found");
        }

        res.send(task);

    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id : req.params.id, owner : req.user._id });

        if(!task) {
            return res.status(404).send("Not Found Deleted");
        }

        res.send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;