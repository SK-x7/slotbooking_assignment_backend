const supabase = require("../supabaseConnection");

exports.getAllBookings = async (req,res,next)=>{
  try {
    let { data: bookings, error } = await supabase
      .from('bookings')
      .select('*');
      
      if(!bookings.length){
        res.status(200).json({
            status:'fail',
            message:"There are no bookings"
        })
      }
      
      res.status(200).json({
        status:'success',
        message:"Bookings retrieved successfully",
        allBookings :{
            length : bookings.length,
            bookings
        }
      })
      
      
    } catch (error) {
        res.status(500).json({
            status:'error',
            message:"Server error in fetching tables: " + error.message,
          })
    }
}

exports.getBookingOfUser = async (req,res,next)=>{
    const username = req.params.username;
    // console.log(tableId);
    if(!username) return res.status(200).json({
        status:"fail",
        message:"Please provide username in url"
    })
    
    try {
      let { data: bookings, error } = await supabase
        .from('bookings').select("*").eq("name",username)
        
        if(!bookings.length) return res.status(200).json({
            status:"fail",
            message:`You have no bookings`
        })
        
        
        res.status(200).json({
          status:'success',
          message:"Bookings retrieved successfully",
          bookingsData:{
            length:bookings.length,
            bookings
          }
        })
        
        
      } catch (error) {
          res.status(500).json({
              status:'error',
              message:`Server error in fetching bookings with username ${username}: ` + error.message,
            })
      }
  }
  
  exports.createBooking = async (req,res,next)=>{
    const {tableId,startDate,endDate} = req.body;
    // console.log(tableId);
    // if(!tableId) return res.status(404).json({
    //     status:"fail",
    //     message:"Please provide a table id in url"
    // })
    
    try {
      let { data: bookings} = await supabase
        .from('bookings').select("*").eq("tableId",tableId).eq("startDate",startDate).eq("endDate",endDate);
        
        console.log(bookings,"===================================")
        
        if(bookings.length) return res.status(200).json({
            status:"fail",
            message:`This table is already booked for this time slot`
        })
        
      const { data:booking } = await supabase
      .from('bookings')
    .insert([
      req.body
    ])
    .select()
        
      if(booking.length){
        
        res.status(200).json({
          status:'success',
          message:"Booking created successfully",
          booking
        })
      }    
    
        
        
      } catch (error) {
          res.status(500).json({
              status:'error',
              message:`Server error in booking table ` + error.message,
            })
      }
  }
  
  
  
  
  exports.deleteBooking = async (req,res,next)=>{
    try {
        const { error } = await supabase
  .from('bookings')
  .delete()
  .eq('id', 'someValue')
  
  if(error){
    res.status(200).json({
        status: 'fail',
        message:`Error deleting booking : ${error.message}`
    })
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Booking deleted successfully'
  })
  
    } catch (error) {
        res.status(500).json({
            status:'error',
            message:`Server error in deleting booking : ${error.message}`
        })
    }
  }