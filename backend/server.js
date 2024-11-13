import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cloudinary from "cloudinary"
import cors from "cors"
import authRoute from './routes/auth.routes.js'
import connectDB from "./db/connectDB.js"
import userRoute from './routes/user.route.js'
import postRoute from "./routes/post.route.js"
import notificationRoute from "./routes/notification.route.js"
import path from "path"



dotenv.config()
const app =express();
const __dirname=path.resolve()


cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET_KEY
})


app.use(cors({
    origin:"http://localhost:3000",
    credentials: true
}))

const PORT =process.env.PORT

app.use(express.json({
    limit:"5mb"
}))
app.use(cookieParser())

app.use(express.urlencoded({
    extended:true
}))

app.use('/api/auth',authRoute)
app.use('/api/users',userRoute)
app.use('/api/posts',postRoute)
app.use('/api/notifications',notificationRoute)

if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname,"/frontend/build")))
    
    app.get("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname,"frontend","build","index.html"))
    })
}

app.listen(PORT,()=>{  
console.log(`server is running on PORT ${PORT}`)
connectDB()
})

