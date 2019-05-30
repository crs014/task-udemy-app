require('./db/mongoose');

const express = require('express');
const multer = require('multer');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const app = express();
const port = process.env.PORT;
const upload = multer({
    dest : 'upload',
    limits : {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match('/\.(doc|docx)$/')) {
           return cb(new Error('please upload a word document')) 
        }
        cb(undefined, true);
    }
});

app.post('/upload', upload.single('upload'), (req, res) => {
    res.send();
});


app.use(express.json());
app.use('/users', userRouter);
app.use('/tasks', taskRouter);

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});