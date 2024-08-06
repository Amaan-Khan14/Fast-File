import { useState } from 'react';
import AppBar from '@/components/ui/AppBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useLocation } from 'react-router-dom';
import QRCode from 'react-qr-code';

export default function UploadSuccessPage() {
    const location = useLocation();
    const { fileId } = location.state as { fileId: string };
    const [showQRCode, setShowQRCode] = useState(false);


    const downloadUrl = `${window.location.origin}/download/${fileId}`;
    const copyToClipboard = () => {
        navigator.clipboard.writeText(downloadUrl);
        alert('URL copied to clipboard!');
    };

    const toggleQRCode = () => {
        setShowQRCode(!showQRCode);
    };

    return (
        <div className='bg-gradient-to-b from-[#090a15] via-[#0b1d23] to-[#090a15] min-h-screen'>
            <AppBar />
            <div className="mt-44 flex items-center justify-center">
                <Card className="bg-inherit p-10 rounded-lg w-full max-w-2xl border-[#b7f4ee]">
                    <CardHeader>
                        <h1 className="text-2xl font-bold text-center text-white">Upload Successful!</h1>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-300 mb-4">Your file has been successfully uploaded. Here's the download URL:</p>
                        <div className="bg-[#16a394] p-4 rounded-md overflow-x-auto">
                            <p className="text-white break-all">{downloadUrl}</p>
                        </div>
                        <div className="flex justify-between mt-4 space-x-4">
                            <Button onClick={copyToClipboard} className="bg-inherit border w-full border-[#04c8bb] text-[#04c8bb] hover:text-[#92efe6] hover:border-[#92efe6] font-semibold hover:bg-inherit">
                                Copy URL to Clipboard
                            </Button>
                            <Button onClick={toggleQRCode} className="bg-inherit border w-full border-[#04c8bb] text-[#04c8bb] hover:text-[#92efe6] hover:border-[#92efe6] font-semibold hover:bg-inherit">
                                {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {showQRCode && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-inherit border-white border-2 p-6 rounded-lg">
                        <QRCode
                            value={downloadUrl}
                            size={256}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                        />
                        <Button onClick={toggleQRCode} className="mt-4 w-full bg-[#04c8bb] text-white hover:bg-[#072522]">
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}