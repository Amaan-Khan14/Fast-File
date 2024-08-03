import z from 'zod';

export const signUpSchema = z.object({
    password: z.string().min(6),
    username: z.string().min(3),
})

export const signInSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
})

export type SignUpSchema = z.infer<typeof signUpSchema>;
export type SignInSchema = z.infer<typeof signInSchema>;