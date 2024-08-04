import AppBar from '@/components/ui/AppBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useLocation } from 'react-router-dom';

export default function UploadSuccessPage() {
    const location = useLocation();
    const { url } = location.state as { url: string };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url);
        alert('URL copied to clipboard!');
    };

    return (
        <div className='bg-gradient-to-b from-[#090a15] via-[#0b1d23] to-[#090a15] min-h-screen'>
            <AppBar />
            <div className="mt-44 flex items-center justify-center">
                <Card className="bg-inherit p-10 rounded-lg w-full max-w-2xl border-white">
                    <CardHeader>
                        <h1 className="text-2xl font-bold text-center text-white">Upload Successful!</h1>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-300 mb-4">Your file has been successfully uploaded. Here's the download URL:</p>
                        <div className="bg-[#187367] p-4 rounded-md overflow-x-auto">
                            <p className="text-white break-all">{url.slice(0, 62) + " " + "..."}</p>
                        </div>
                        <Button onClick={copyToClipboard} className="mt-4 bg-[#b7f4ee] text-white w-full">
                            Copy URL to Clipboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>

    );
}