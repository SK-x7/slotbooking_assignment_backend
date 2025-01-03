const supabase = require("../supabaseConnection");

exports.getAllTables = async (req,res,next)=>{
  try {
    let { data: tables, error } = await supabase
      .from('tables')
      .select('*');
      
      if(!tables.length){
        res.status(200).json({
            status:'fail',
            message:"There are no tables"
        })
      }
      
      res.status(200).json({
        status:'success',
        message:"Tables retrieved successfully",
        allTables :{
            length : tables.length,
            tables
        }
      })
      
      
    } catch (error) {
        res.status(500).json({
            status:'error',
            message:"Server error in fetching tables: " + error.message,
          })
    }
}

exports.getTable = async (req,res,next)=>{
    const tableId = req.params.tableId;
    // console.log(tableId);
    if(!tableId) return res.status(404).json({
        status:"fail",
        message:"Please provide a table id in url"
    })
    
    try {
      let { data: table, error } = await supabase
        .from('tables').select("*").eq("id",tableId)
        
        if(!table.length) return res.status(200).json({
            status:"fail",
            message:`There is no table with id :${tableId}`
        })
        
        
        res.status(200).json({
          status:'success',
          message:"Success table data retrieved successfully",
          table
        })
        
        
      } catch (error) {
          res.status(500).json({
              status:'error',
              message:`Server error in fetching table with id ${tableId}: ` + error.message,
            })
      }
  }
  

exports.getAvailableSlots = async (req, res)=> {
  const { tableId } = req.params; // Table ID from the request query
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0, 0); // 10 AM today
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 23, 59, 59); // End of 30th day

  if (!tableId) {
    return res.status(400).json({ error: 'Table ID is required' });
  }
  
  
  // Fetch all bookings for the given table ID
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('tableId', tableId)
    .gte('startDate', startDate.toISOString())
    .lte('endDate', endDate.toISOString());
    
  if (error) {
    return res.status(500).json({ error: 'Failed to fetch bookings', details: error });
  }

  // Generate all 1-hour time slots from 10 AM to 12 PM for the next 30 days
  const timeSlots = generateTimeSlots(startDate, endDate);

  // Filter out booked slots
  const availableSlots = filterAvailableSlots(timeSlots, bookings);
  
  const formattedSlots = formatSlots(availableSlots);
  
  // Return available slots
  //FIXME - 
  res.status(200).json({status:"success",message:"Succesfully retreived available slots",data:{length:formattedSlots.length, availableSlots:timeSlots} });
}

// Helper function to generate 1-hour slots from 10 AM to 12 PM for the next 30 days
// function generateTimeSlots(startDate, endDate) {
//   const slots = [];
//   const currentDate = new Date(startDate);

//   while (currentDate <= endDate) {
//     // Add 10 AM and 11 AM slots for each day
//     slots.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 10, 0, 0).toISOString());
//     slots.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 11, 0, 0).toISOString());
//     slots.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 12, 0, 0).toISOString());
//     slots.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 13, 0, 0).toISOString());
//     slots.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 14, 0, 0).toISOString());
//     slots.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 15, 0, 0).toISOString());
//     slots.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 16, 0, 0).toISOString());
//     slots.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 17, 0, 0).toISOString());
//     slots.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 18, 0, 0).toISOString());
//     slots.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 19, 0, 0).toISOString());
//     slots.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 20, 0, 0).toISOString());
//     slots.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 21, 0, 0).toISOString());
//     slots.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 22, 0, 0).toISOString());
//     slots.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 0, 0).toISOString());
//     slots.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 00, 0, 0).toISOString());
//     slots.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 01, 0, 0).toISOString());
//     // slots.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 24, 0, 0).toISOString());
//     // slots.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 24, 0, 0).toISOString());

//     // Move to the next day
//     currentDate.setDate(currentDate.getDate() + 1);
//   }

//   // console.log(slots);
//   return slots;
// }

function generateTimeSlots(startDate, endDate) {
  const slots = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    //FIXME - 
    for (let h = 10; h < 25; h++) {
    // for (let h = 10; h < 11; h++) {
      // Push each 1-hour slot for the day
      const hour = ("0"+(h%24)).slice(-2);
      // console.log(hour);
      slots.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hour, 0, 0).toISOString());
    }
    // Move to the next day at 10 AM
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(10, 0, 0, 0);
  }
  console.log("Generating time slots.........")
  return slots;
}

function filterAvailableSlots(timeSlots, bookings) {
  
  console.log("filtering available slots")
  return timeSlots.filter((slot) => {
    // console.log("inside filter slots")
    // const slotStart = new Date(slot).toUTCString();
    // const slotEnd = new Date(slotStart);
    //FIXME - 
    const slotStart = slot;
    const slotEnd = new Date(new Date(slotStart).setHours(new Date(slotStart).getHours() + 1));
    // slotEnd.setHours(slotEnd.getHours()); // End of the 1-hour slot
    
    // Check if the slot overlaps with any existing bookings
    // 2025-01-30T04:00:00.000Z 2025-01-04T04:00:00
    return !bookings.some((booking) => {
      const bookingStart = booking.startDate;
      const bookingEnd = booking.endDate
      //FIXME - 
      let testBookingStart = new Date(`${booking.startDate}.000Z`);
      let testBookingEnd = new Date(`${booking.endDate}.000Z`);
      // const bookingEnd = new Date(booking.endDate).toUTCString();
      // const x = String(slotStart).slice(0,5)
      // const x = slotStart.toString()
      // 2025-01-29T04:00:00.000Z
      // console.log("request===============")
      // const slotStartHours = slotStart.slice(17,19);
      // const slotEndHours = String(slotEnd).slice(11,13);
      // const bookingStartHours = bookingStart.slice(11,13);
      // const bookingEndHours = bookingEnd.slice(11,13);
      // console.log(slotStartHours,bookingStartHours,bookingEndHours,slotEndHours,slotEnd);
      // console.log(extractTime(bookingStart))
      // console.log(extractTime(slotEnd))
      // console.log(extractTime(bookingEnd))
      // if((Number(slotStartHours) < Number(bookingEndHours)) && Number(slotEndHours+1) > Number(bookingStartHours)){
        //   console.log(booking);
        // }
        
        console.log("Request made-")
        console.log(new Date(slotStart),slotStart,testBookingStart,bookingStart);
        // console.log(new Date(slotStart),testBookingStart,slotEnd,testBookingEnd);
        // console.log(new Date(slotStart) < testBookingEnd) && ((slotEnd) > testBookingStart); // Overlap condition
        console.log("Request made=====")
      //FIXME - 
      // return slotStart < bookingEnd && (slotEnd) > bookingStart; // Overlap condition
      // return (new Date(slotStart) < testBookingEnd) && ((slotEnd) > testBookingStart); // Overlap condition
      return (new Date(slotStart) < bookingEnd) && ((slotEnd) > bookingStart); // Overlap condition
    });
  });
}

// Helper function to filter out booked slots
// function filterAvailableSlots(timeSlots, bookings) {
  
//   console.log("filtering available slots")
//   return timeSlots.filter((slot) => {
//     // console.log("inside filter slots")
//     // const slotStart = new Date(slot).toUTCString();
//     // const slotEnd = new Date(slotStart);
//     //FIXME - 
//     const slotStart = new Date(slot).toUTCString();
//     const slotEnd = new Date(slotStart).toISOString();
//     // slotEnd.setHours(slotEnd.getHours()); // End of the 1-hour slot
    
//     // Check if the slot overlaps with any existing bookings
//     // 2025-01-30T04:00:00.000Z 2025-01-04T04:00:00
//     return !bookings.every((booking) => {
//       const bookingStart = booking.startDate;
//       const bookingEnd = booking.endDate
//       //FIXME - 
//       // const bookingEnd = new Date(booking.endDate).toUTCString();
//       // console.log(slotStart,new Date(booking.startDate).toString());
//       // const x = String(slotStart).slice(0,5)
//       // const x = slotStart.toString()
//       // 2025-01-29T04:00:00.000Z
//       // console.log("request===============")
//       const slotStartHours = slotStart.slice(17,19);
//       const slotEndHours = String(slotEnd).slice(11,13);
//       const bookingStartHours = bookingStart.slice(11,13);
//       const bookingEndHours = bookingEnd.slice(11,13);
//       // console.log(slotStartHours,bookingStartHours,bookingEndHours,slotEndHours,slotEnd);
//       // console.log(extractTime(bookingStart))
//       // console.log(extractTime(slotEnd))
//       // console.log(extractTime(bookingEnd))
//       // if((Number(slotStartHours) < Number(bookingEndHours)) && Number(slotEndHours+1) > Number(bookingStartHours)){
//         //   console.log(booking);
//         // }
//         console.log("Request made-")
//         console.log(slotStartHours,(Number(slotEndHours))+1,bookingStartHours,bookingEndHours);
        
//         console.log((Number(slotStartHours) < Number(bookingEndHours)) && Number(slotEndHours+1) > Number(bookingStartHours))
//         console.log("Request made=====")
//       //FIXME - 
//       // return slotStart < bookingEnd && (slotEnd+1) > bookingStart; // Overlap condition
//       return ((Number(slotStartHours) < Number(bookingEndHours)) && Number(slotEndHours+1) > Number(bookingStartHours));
//     });
//   });
// }


// function filterAvailableSlots(timeSlots, bookings) {
//   console.log("filtering available slots");
//   return timeSlots.filter((slot) => {
//     const slotStart = new Date(slot).toUTCString();
//     const slotEnd = new Date(slotStart).toISOString();

//     let hasOverlap = false;

//     for (const booking of bookings) {
//       const bookingStart = booking.startDate;
//       const bookingEnd = booking.endDate;

//       const slotStartHours = slotStart.slice(17, 19);
//       const slotEndHours = String(slotEnd).slice(11, 13);
//       const bookingStartHours = bookingStart.slice(11, 13);
//       const bookingEndHours = bookingEnd.slice(11, 13);

//       // console.log("Request made:");
      
//       console.log(
//         slotStartHours,
//         Number(slotEndHours) + 1,
//         bookingStartHours,
//         bookingEndHours
//       );
//       if (
//         Number(slotStartHours) < Number(bookingEndHours) &&
//         Number(slotEndHours) + 1 > Number(bookingStartHours)
//       ) {
//         hasOverlap = true;
//       }
//     }

//     // If there's overlap, exclude the slot
//     if(hasOverlap){
      
//       console.log("Thisis true")
//       console.log(slot)
//     }
//     return !hasOverlap;
//   });
// }

const extractTime = (dateString) => {
  const match = dateString.match(/(\d{2}):(\d{2}):\d{2}/); // Matches HH:MM:SS
  return match ? { hours: parseInt(match[1], 10), minutes: parseInt(match[2], 10) } : null;
};
// 2025-01-03T04:00:00.000Z 
// 2025-01-04T04:00:00 
// 2025-01-03T05:00:00.000Z 
// 2025-01-04T05:00:00

// function formatSlots(slots) {
//   const formattedSlots = {};

//   slots.forEach((slot, index) => {
//     // console.log(slot);
//     const dateObj = new Date(slot);
//     const dateKey = dateObj.toISOString().split("T")[0]; // Extract date part (e.g., "2025-01-02")
//     const startHours= ('0'+(Number(dateObj.toISOString().split("T")[1].slice(0,2))+5)).slice(-2);
//     const startMinutes= (dateObj.toISOString().split("T")[1].slice(3,5))
//     // Convert time to a readable format (HH:mm)
//     // console.log(hours,minutes);
//     // const timeStart = dateObj.toISOString().split("T")[1].slice(0, 5); // Extract "HH:mm" from ISO string
//     // Get the next slot for end time
//     // console.log(index);
//     if (index < slots.length-1) {
//       // if(index===slots.length - 1) {
//       //   console.log(slots[index])
//       // }
//       const nextSlot = new Date(slots[index + 1]);
//       const timeEnd = nextSlot.toISOString().split("T")[1].slice(0, 5);
//       const endHours= ('0'+(Number(nextSlot.toISOString().split("T")[1].slice(0,2))+5)).slice(-2);
//       const endMinutes= (nextSlot.toISOString().split("T")[1].slice(3,5))
      

//       // Initialize the date key in the formattedSlots object if not already present
//       if (!formattedSlots[dateKey]) {
//         formattedSlots[dateKey] = [];
//       }

//       // Add the time range to the corresponding date
//       formattedSlots[dateKey].push(`${startHours}:${startMinutes}-${endHours}:${endMinutes}`);
//     }
//   });

//   // Convert object into an array of objects with desired format
//   return Object.entries(formattedSlots).map(([date, ranges]) => ({
//     [date]: ranges,
//   }));
// }

function formatSlots(slots) {
  const formattedSlots = {};

  slots.forEach((slot, index) => {
    const dateObj = new Date(slot);
    const dateKey = dateObj.toISOString().split("T")[0]; // Extract date (e.g., "2025-01-02")

    // Convert time to GMT+5
    const startHours = ('0' + (dateObj.getUTCHours() + 5)).slice(-2);
    const startMinutes = ('0' + (dateObj.getUTCMinutes())).slice(-2);

    if (index < slots.length - 1) {
      const nextSlot = new Date(slots[index + 1]);

      if (nextSlot.toISOString().split("T")[0] === dateKey) {
        const endHours = ('0' + (nextSlot.getUTCHours() + 5)).slice(-2);
        const endMinutes = ('0' + (nextSlot.getUTCMinutes())).slice(-2);

        // Initialize the date key if not already present
        if (!formattedSlots[dateKey]) {
          formattedSlots[dateKey] = [];
        }

        // Add the time range to the corresponding date
        formattedSlots[dateKey].push(`${startHours}:${startMinutes}-${endHours}:${endMinutes}`);
      }
    }
  });

  // Convert the object into an array of objects
  return Object.entries(formattedSlots).map(([date, ranges]) => ({
    [date]: ranges,
  }));
}
