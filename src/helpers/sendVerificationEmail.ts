import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
    ):Promise<ApiResponse>{

        try {
           await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: email,
                subject: 'Verification Code for Anonymous App',
                react: VerificationEmail({username,otp: verifyCode}),
              });
              
            return {success:true, message: 'Verification Email sent sucessfully'}
        } catch (emailError) {
            console.error("Error sending verification Email",emailError)
            return {success:false, message: 'Failed to send verification Email'}
        }

}

