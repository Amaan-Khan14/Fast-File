import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { SignInSchema } from "@amaank14/zod-common";
import { APP_URL } from "@/config";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { ReloadIcon } from "@radix-ui/react-icons";

export default function Signup() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [inputs, setInputs] = useState<SignInSchema>({
        username: '',
        password: ''
    })

    async function handleSubmit() {
        setIsLoading(true);
        try {
            await axios.post(`${APP_URL}/user/reg`, inputs);
            toast({
                title: "Sign Up Successful",
                description: "Welcome back! You've successfully signed in.",
                duration: 5000,
            })
            navigate('/login');
        } catch (error) {
            console.log(error)
            let errorMessage = "An error occurred during sign up. Please try again.";

            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || errorMessage;
            }

            toast({
                title: "Sign Up Failed",
                description: errorMessage,
                variant: "destructive",
                duration: 5000,
            })
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className="flex min-h-screen bg-gradient-to-r from-white to-gray-100">
            <div className="w-full lg:w-1/2 p-12 flex flex-col justify-center items-center">
                <Card className="w-full max-w-md">
                    <CardHeader>

                        <h1 className="text-2xl font-bold">Create Your Account</h1>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="text">Username</Label>
                                <Input type="text" placeholder="Not John Doe" onChange={(e) => {
                                    setInputs({
                                        ...inputs,
                                        username: e.target.value
                                    })
                                }} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input type="password" id="password" placeholder="FastFile" onChange={(e) => {
                                    setInputs({
                                        ...inputs,
                                        password: e.target.value
                                    })
                                }} />
                            </div>

                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col">
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                handleSubmit();
                            }}
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? <ReloadIcon className="animate-spin mr-2" /> : 'Sign Up'}
                        </Button>
                        <p className="text-center mt-4 text-sm text-gray-600">
                            Already a member? <Link to='/login'>Signin</Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>

            <div className="hidden lg:flex lg:w-1/2 bg-teal-900 text-white p-12 flex-col">
                <div className="mt-64">
                    <h2 className="text-3xl font-bold mb-6">Secure File Sharing Made Simple</h2>
                    <p className="mb-6">
                        FastFile uses advanced end-to-end encryption to protect your files during transfer and storage, ensuring that no unauthorized parties, including FastFile, can access your data.


                    </p>
                    <p className="mb-6">
                        For secure file sharing, FastFile provides encrypted links with embedded decryption information, ensuring only intended recipients can access your files. This seamless approach enhances security while minimizing the risk of unauthorized access.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4 mt-8">
                            <img src="/en.png" alt="Ciphered" className="mx-2 h-8 w-8 sm:h-10 sm:w-10" />
                            <div>
                                <h4 className="font-semibold text-xl">End-to-End Encryption</h4>
                                <p className="text-sm text-gray-300">Your files are protected during transfer and storage</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <img src="/upload.png" alt="Transmitted" className="mx-2 h-8 w-8 sm:h-10 sm:w-10" />
                            <div>
                                <h4 className="font-semibold text-xl">Secure Sharing</h4>
                                <p className="text-sm text-gray-300">Only intended recipients can access your shared files</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

    )

};

