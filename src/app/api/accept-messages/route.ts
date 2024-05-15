import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function POST(request: Request){
    dbConnect()

    //get Session object
    const session = await getServerSession(authOptions)
    const user: User = session?.user as User
    if(!session && !user){
        return Response.json(
            {
                success: false,
                message: "Not Authenticated!!"
        
            }, {status: 401}
            ) 
    }

    const userId = user._id
    const {acceptMessages} = await request.json()

    try {
        //fetch User and update the status 
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                isAcceptingMessages:acceptMessages
            },{new: true})

        if(!updatedUser){
            return Response.json(
                {
                    success: false,
                    message: "Fail to update user status to accepting messages"
            
                }, {status: 401}
                )
        }
    return Response.json(
        {
            success: true,
            message: "Message acceptance status updated succesfully",
            updatedUser
    
        }, {status: 200}
        )
    } catch (error) {
        console.error("Fail to update user status to accepting messages", error)
        return Response.json(
                {
                    success: false,
                    message: "Fail to update user status to accepting messages"
            
                }, {status: 404}
            )  
    }
}


export async function GET(request: Request){
    dbConnect()

    //get Session object
    const session = await getServerSession(authOptions)
    const user: User = session?.user as User
    if(!session && !user){
        return Response.json(
            {
                success: false,
                message: "Not Authenticated!!"
        
            }, {status: 401}
            ) 
    }
    const userId = user._id

    try {
        const foundUser = await UserModel.findById(userId)
        if(!foundUser){
            return Response.json(
                {
                    success: false,
                    message: "User Not found!!"
            
                }, {status: 404}
                )
        }
        return Response.json(
            {
                success: true,
                message: "User Found",
                isAcceptingMessages: foundUser.isAcceptingMessages
        
            }, {status: 200}
            )
    } catch (error) {
        console.error("Error in getting message aceptance status", error)
        return Response.json(
            {
                success: false,
                message: "Error in getting message aceptance status"
        
            }, {status: 500}
            )  
    }
}
    
