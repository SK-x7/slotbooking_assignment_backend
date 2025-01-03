const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseConnection');
const tableRouter = require("./routes/tableRoutes")
const bookingRouter = require("./routes/bookingRoute")
const userRouter = require("./routes/userRoute")

const app = express();
const PORT = 8080;

app.use(cors());    
app.use(express.json());    
app.use(express.static('public'));
// app.use();    
app.listen(PORT,()=>{
    console.log(`Server running on port:${PORT}`);
})


app.use("/api/v1/tables",tableRouter);
app.use("/api/v1/bookings",bookingRouter);
app.use("/api/v1/users",userRouter);

app.get("/",async (req,res,next)=>{
    let { data: bookings, error } = await supabase
  .from('tables')
  .select('*')
  if(error){
    console.log(error);
    console.log(error.message)
  }
  
    res.json({
        status:"success",
        message:"Hello from the server",
        bookings: bookings
        
    })
})
