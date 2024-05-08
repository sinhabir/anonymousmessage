import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request){
    await dbConnect()

    try {
        const {username, email, password} =  await request.json()

        //Check if username is already existing
        const existingUserVerifiedByUsername = await UserModel.findOne({
        username,
        isVerified: true
    })

    // If username already exists then notify 
    if(existingUserVerifiedByUsername){
        return Response.json(
        {
            success: false,
            message: "Username already exists"
        },{status: 400}
        )
    }

    //Check if Email already exists in DB
    const existingUserbyEmail = await UserModel.findOne({email})
    //Create a verification Code
    let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    // If email exists then user data is already 
    //in system but may not be verified
    //Else means user is signing up for the first time
    if(existingUserbyEmail){
        //Email existing and verified
       if(existingUserbyEmail.isVerified){
        return Response.json(
            {
                success: false,
                message: "User already verified with this email"
            },{status: 400}
            )
       }else{
        //Email existing but not verified
        const hashedPassword = await bcrypt.hash(password, 10)
        existingUserbyEmail.password = hashedPassword
        existingUserbyEmail.verifyCode = verifyCode
        existingUserbyEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
        await existingUserbyEmail.save()
       }
        
    }else{
        //Encrypt Password as user is signing up for the first time
        const hashedPassword = await bcrypt.hash(password, 10)
        //set expiry date for the verification code which will be 1 hour from now
        const expiryDate = new Date()
        expiryDate.setHours(expiryDate.getHours() + 1)

        //Create new user details 
        const newUser = new UserModel({
            username,
            email,
            password: hashedPassword,
            verifyCode,
            verifyCodeExpiry: expiryDate,
            isVerified: false,
            isAcceptingMessages: true,
            messages: []
        })
        //save user details in DB
        await newUser.save()      
    }
    //Send verification Email
    const emailResponse = await sendVerificationEmail
    (email, username, verifyCode)

    //If email is not sent succesfully
    if(!emailResponse.success){
        return Response.json(
            {
                success: false,
                message: emailResponse.message
            },{status: 500}
            )
    }
    //Email sent sucessfully to user
    return Response.json(
        {
            success: true,
            message: "User registered succesfully. Please verify your email"
        },{status: 201}
        )

    } catch (error) {
        console.error("Error registering user")
        return Response.json(
            {
                success: false,
                message: "Error registering user"
            },
            {
                status: 500
            }
        )
    }
}