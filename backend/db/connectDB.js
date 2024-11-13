import mongoose from "mongoose"

const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("DB connected")

    }catch(error){
        console.log(`ERROR in connecting DB ${error}`)
        process.exit(1)
    }

    
}

export default connectDB