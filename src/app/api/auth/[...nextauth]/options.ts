import { NextAuthOptions } from "next-auth";
import  CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs'
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const authOptions:NextAuthOptions = {
    providers:[
            CredentialsProvider({
                id:"credentials",
                name:"Credentials",
                credentials: {
                    email: { label: "Email", type: "text" },
                    password: { label: "Password", type: "password" }
                  },
                  async authorize(credentials:any):Promise<any>{
                    await dbConnect()
                    try {
                        //Query DB to find the user with either email or username(User enters
                        //only email but the same field can be saved in username)
                       const user = await UserModel.findOne({
                            $or:[
                                {email:credentials.identifier},
                                {username:credentials.identifier}
                            ]
                        })
                        //If user not found
                        if(!user){
                            throw new Error('No user found!!')
                        }
                        //If user not verfied
                        /*if(!user.isVerified){
                            throw new Error('Please verify your account!!')
                        }*/
                        //Compare Password
                       const isPasswordCorrect= 
                        await bcrypt.compare(credentials.password, user.password)
                        //Return user if password is correct else throw error
                        if(isPasswordCorrect){
                            return user
                        }else{
                            throw new Error('Incorrect credentials!!')
                        }
                    } catch (error: any) {
                        throw new Error(error)
                    }
                  }
            })
    ],
    callbacks:{
        async session({ session, token }) {
            if(token){
                session.user._id = token._id
                session.user.isVerified = true
                session.user.isAcceptingMessages = 
                    token.isAcceptingMessages
                session.user.username = token.username
            }
            return session
          },
        async jwt({ token, user }) {
            if(user){
                token._id = user._id?.toString()
                token.isVerified = true
                token.isAcceptingMessages = user.isAcceptingMessages
                token.username = user.username
            }
            return token
          }
    },
    pages:{
        signIn: '/sign-in'
    },
    session:{
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET,

}