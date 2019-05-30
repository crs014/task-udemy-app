const { model, Schema} = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Task = require('./Task');

const userSchema = new Schema({
    name : {
        type : String,
        required: true,
        trim: true
    },
    email : {
        type : String,
        index : true,
        unique : true,
        required : true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('email is invalid');
            }
        }
    },
    password : {
        type : String,
        required : true,
        trim : true,
        minLength: 7,
        validate(value) {
            if(value === 'password') {
                throw new Error('password cannot string password');
            }
        }
    },
    age : {
        type : Number,
        validate(value) {
        }
    },
    tokens: [{
        token : {
            type : String,
            required : true
        }
    }],
    avatar : {
        type : Buffer,
        default : null
    }
},{ timestamps : true });

userSchema.virtual('tasks', {
    ref : 'Task',
    localField : '_id',
    foreignField : 'owner'
});

userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({ _id : user._id.toString() }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    
    return token;
}

/*userSchema.methods.getPublicProfile = function() {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
}*/

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    
    return userObject;
}

userSchema.statics.findByCrendentials = async (email, password) => {
    const user = await User.findOne({ email });

    if(!user) {
        throw new Error('Unable to login email');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) {
        throw new Error('Unable to login')
    }

    return user;
};


userSchema.pre('save', async function (next) {
    const user = this;

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

userSchema.pre('remove', async function (next){
    const user = this;
    await Task.deleteMany({ owner : user._id });
});

const User = model('User', userSchema);

module.exports = User;