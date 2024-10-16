require('dotenv').config()
const express=require('express')
const mongoose=require('mongoose')
const userRout=require('./routes/userRoutes')
const adminRoute=require('./routes/adminRoutes')
const errorhandler=require('./middleware/erorhandler')

const app= express()
app.use(express.json())
app.use('/api',userRout)
app.use('/api',adminRoute)
app.use(errorhandler)

mongoose.connect(process.env.MONGO_URI) 
.then(()=>{console.log('connected to database')})
.catch((error)=>{console.log(error)})



app.listen(5001,()=>{console.log('server running on port 5001');
})
