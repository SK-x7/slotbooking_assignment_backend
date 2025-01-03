const supabase = require("../supabaseConnection");

exports.createUser = async (req,res,next)=>{
    const username = req.params.username;
    
    try {
      let { data: users} = await supabase
        .from('myUsers').select("*").eq("name",username)
        
    
        if(users.length) return res.status(200).json({
            status:"fail",
            message:`Already User exists, Please try different name`
        })
        
      const { data:user } = await supabase
      .from('myUsers')
    .insert([
      {name:username}
    ])
    .select()
        
      if(user.length){
        res.status(200).json({
          status:'success',
          message:"User created successfully",
          booking
        })
      }    
    
    } catch (error) {
          res.status(500).json({
              status:'error',
              message:`Server error in creating user ` + error.message,
            })
      }
  }
  
  exports.checkUserExists = async (req,res,next)=>{
    const username = req.params.username;
    
    try {
      let { data: users} = await supabase
        .from('myUsers').select("*").eq("name",username)
        
    
        if(users.length) return res.status(200).json({
            status:"success",
            message:`Already User exists`
        })
        else{
            res.status(200).json({
                status:"fail",
                message:`No user exists`
            })
        }
    
    } catch (error) {
          res.status(500).json({
              status:'error',
              message:`Server error in checking user ` + error.message,
            })
      }
}