require('dotenv').config()
const express=require('express')
const mongoose=require('mongoose')
const userRout=require('./routes/userRoutes')
const adminRoute=require('./routes/adminRoutes')
// const stripeRoute=require('./routes/stripeRoute')
const errorhandler=require('./middleware/erorhandler')
const CookieParser=require('cookie-parser')
const cors =require('cors')

const app= express()
app.use(express.json())
app.use(CookieParser())


app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  }))

app.use('/api',userRout)
app.use('/api',adminRoute)
// app.use('/api', stripeRoute);

app.use(errorhandler)

mongoose.connect(process.env.MONGO_URI) 
.then(()=>{
    console.log('connected to database')
})

.catch((error)=>{
    console.log('database connection error',error)
})



app.listen(5001,()=>{
    console.log('server running on port 5001');
})
