const express = require('express');
require('./db/mongoose')
const userRouter = require('./routers/users')
const taskRouter = require('./routers/tasks')

const app = express();
const port = process.env.PORT;

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
});


// const Task = require('./models/Task')
// const User = require('./models/User')
// const main = async () => {
//     // const task = await Task.findById('60db540b55b67216e074414b')
//     // await task.populate('owner').execPopulate()
//     // console.log(task.owner)

//     const user  = await User.findById('60db53f355b67216e0744146')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
// }
