import {z} from "zod";

export const signUpSchema = z.object({
    email : z.string().email("Invalid email address"),
    password : z.string().min(6, {
        message : "Password must be at least 6 characters long"
    }).regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter"
    }).regex(/[0-9]/, {
        message: "Password must contain at least one number"
    }),
    role: z.enum(["employee", "manager", "admin"]).refine(Boolean, {
        message: "Please select a valid role"
    })
})