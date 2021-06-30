const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./Task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email : {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
               throw new Error('Please enter a valid email') 
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0){ throw new Error('Age must be Positive')}
        }
    },
    password: {
        type: String,
        trim: true,
        required: true,
        minLength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')){
                throw new Error('Password cannot contain password')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }],
    avatar:{
        type: Buffer
    }

}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id', // Association btw both 
    foreignField: 'owner' // on the task
})

userSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

userSchema.methods.genrateAuthToken = async function() {
    const user = this;
    const token = jwt.sign( { _id: user._id.toString() }, process.env.JWT_SECRET)
    
    user.tokens = user.tokens.concat( {token} )
    await user.save()
    
    return token;
}

userSchema.statics.findByCredentials = async (email, password) => {
    const users = await User.findOne({email})
    //console.log(email,password)
    //console.log(users)
    if(!users){
        throw new Error('Unable to Login')
    }

    const isMatch = await bcrypt.compare(password, users.password)
    //console.log(isMatch)
    
    if(!isMatch){
        throw new Error('Unable to Login')
    }

    return users;
}

// Hash the Password
userSchema.pre('save', async function(next) {
    const user = this;

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// Delete the Tasks of the deleted User
userSchema.pre('remove', async function(next) {
    const user = this;
    await Task.deleteMany({owner: user._id})
    next()
})


const User = mongoose.model('User', userSchema)

module.exports = User;