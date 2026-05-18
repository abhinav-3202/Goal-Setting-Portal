import {z} from "zod";

export const usernameValidation = z
    .string()     // here no object becasue ek hi value ko check kar rhe h
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be at most 20 characters long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");

export const signUpSchema = z.object({
    username:usernameValidation,
    email : z.string().email("Invalid email address"),
    name: z.string().min(3, "Name must be at least 3 characters long").max(50, "Name must be at most 50 characters long"),
    password : z.string().min(6, {
        message : "Password must be at least 6 characters long"
    }).regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter"
    }).regex(/[0-9]/, {
        message: "Password must contain at least one number"
    }),
    role: z.enum(["employee", "manager", "admin"]).refine(Boolean, {
        message: "Please select a valid role"
    }),
    department:z.enum(["HR", "Finance", "Logistics"]).refine(Boolean, {
        message: "Please select a valid department"
    }),
})