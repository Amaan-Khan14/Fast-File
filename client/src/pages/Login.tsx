import AppBar from "@/components/ui/AppBar";
import { Card } from "@/components/ui/card";

export default function Signin() {
    return (
        <div className='bg-gradient-to-b from-[#090a15] via-[#0b1d23] to-[#090a15] min-h-screen'>
            <AppBar />
            <div className="mt-44 flex items-center justify-center">
                <Card className="bg-inherit text-white text-center text-4xl m-10 p-5 rounded-lg w-full max-w-5xl border-[#b7f4ee]">
                    Coming soon...
                </Card>
            </div>
        </div>
    )
}