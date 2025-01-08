const supabase = require("../supabaseConnection");
const bcrypt = require("bcrypt");

// exports.createUser = async (req,res,next)=>{
//     const username = req.params.username;
    
//     try {
//       let { data: users} = await supabase
//         .from('myUsers').select("*").eq("name",username)
        
    
//         if(users.length) return res.status(200).json({
//             status:"fail",
//             message:`Already User exists, Please try different name`
//         })
        
//       const { data:user } = await supabase
//       .from('myUsers')
//     .insert([
//       {name:username}
//     ])
//     .select()
        
//       if(user.length){
//         res.status(200).json({
//           status:'success',
//           message:"User created successfully",
//           booking
//         })
//       }    
    
//     } catch (error) {
//           res.status(500).json({
//               status:'error',
//               message:`Server error in creating user ` + error.message,
//             })
//       }
//   }
  
//   exports.checkUserExists = async (req,res,next)=>{
//     const username = req.params.username;
    
//     try {
//       let { data: users} = await supabase
//         .from('myUsers').select("*").eq("name",username)
        
    
//         if(users.length) return res.status(200).json({
//             status:"success",
//             message:`Already User exists`
//         })
//         else{
//             res.status(200).json({
//                 status:"fail",
//                 message:`No user exists`
//             })
//         }
    
//     } catch (error) {
//           res.status(500).json({
//               status:'error',
//               message:`Server error in checking user ` + error.message,
//             })
//       }
// }


exports.checkUserExists = async (username)=>{
  if(!username) return null;
  
  try {
    let { data: users} = await supabase
      .from('myUsers').select("*").eq("name",username)
      
  
      if(users.length) return {userExists:true,user:users[0]};
      else return{userExists:false,user:null};
  
  } catch (error) {
      return {userExists:false,user:null};
    }
}



async function hashPassword(password) {
  console.log(password,"Before hash password");
  try {
    const saltRounds = 12; // Number of hashing rounds (increase for more security but slower)
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.log("Error hashing the password:", error);
    console.log(error.message);
    return false;
    }
}

exports.createUser = async (req,res,next)=>{
  let userData = req.body
  console.log(userData);
  console.log((!userData.length)||(!userData.name||!userData.password))
  try {
    if(!(!userData.length)||(!userData.name||!userData.password)) return res.status(200).json({
          status:"fail",
          message:`Please provide correct userData in request body`})
    const alreadyExists =await this.checkUserExists(userData.name);
    
    if(!alreadyExists.userExists){
      
      const hashedPassword =await hashPassword(userData.password);
      console.log(hashedPassword,hashedPassword)
      if(!hashedPassword){
        return res.status(500).json({
          status:"error",
          message:`Error in hashing`
          
        })
      }
      
      const temp={
        ...userData,
        password:hashedPassword
      }
      
    const { data:users } = await supabase
    .from('myUsers')
  .insert([
    temp
  ])
  .select()
      
    if(users.length){
      res.status(200).json({
        status:'success',
        message:"User created successfully",
        user:users[0]
      })
    }    
  }else{
    res.status(200).json({
      status:"fail",
      message:`User already exists with name : ${userData.name}`
    })
  }
  
  } catch (error) {
    
    console.log(error);
    
        res.status(500).json({
            status:'error',
            message:`Server error in creating user ` + error.message,
          })
    }
}



exports.loginUser = async (req,res,next)=>{
  let userData = req.body
  console.log(userData);
  console.log((!userData.length)||(!userData.name||!userData.password))
  try {
    if(!(!userData.length)||(!userData.name||!userData.password)) return res.status(200).json({
          status:"fail",
          message:`Please provide correct userData in request body`})
    
    const alreadyExists =await this.checkUserExists(userData.name);
    
    if(alreadyExists.userExists===true){
      
    
      const match = await bcrypt.compare(userData.password,alreadyExists?.user?.password);
      
      if(match===true){
        return res.status(200).json({
          status:"success",
          message:"Login successful",
          loginSuccess:match,
          username:alreadyExists?.user?.name
        })  
      }else if(match===false){
        return res.status(200).json({
          status:"fail",
          message:"Login failed",
          loginSuccess:match,
        })
      }
    }else{
    res.status(200).json({
      status:"fail",
      message:`No user exists with name : ${userData.name}`
    })
  }
  
  } catch (error) {
    
    console.log(error);
    
        res.status(500).json({
            status:'error',
            message:`Server error in logging you in :` + error.message,
          })
    }
}