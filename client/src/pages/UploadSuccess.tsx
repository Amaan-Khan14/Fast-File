import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useLocation } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from '@/components/ui/use-toast';


export default function UploadSuccessPage() {
    const location = useLocation();
    const { fileId, encryptionKey } = location.state as { fileId: string, encryptionKey: string };
    const [showQRCode, setShowQRCode] = useState(false);

    const downloadUrl = `${window.location.origin}/download/${fileId}?key=${encodeURIComponent(encryptionKey)}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(downloadUrl);
        toast({
            title: "Success",
            description: "URL copied to clipboard",
            duration: 5000,
        });

    };

    const toggleQRCode = () => {
        setShowQRCode(!showQRCode);
    };

    return (
        <div className="bg-gradient-to-b from-[#090a15] via-[#0b1d23] to-[#090a15]">
            <div className="mt-20 sm:mt-36 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <Card className="bg-inherit p-4 sm:p-6 md:p-10 rounded-lg w-full max-w-4xl border-[#b7f4ee]">
                    <CardHeader>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center bg-gradient-to-r from-green-50 to-emerald-300 bg-clip-text text-transparent">Upload complete! Your file is ready to share!</h1>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-400 mb-4 text-lg sm:text-xl md:text-2xl text-center mt-3 sm:mt-5">You can now share it using the link provided</p>
                        <div className="bg-[#16a394] p-2 sm:p-4 rounded-md overflow-x-auto">
                            <Input
                                type="text"
                                value={downloadUrl}
                                readOnly
                                className="flex-grow text-base sm:text-lg bg-inherit focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-offset-gray-600 border-0 text-white p-2 rounded-l w-full"
                            />

                        </div>
                        <div className="flex flex-col sm:flex-row justify-between mt-4 space-y-2 sm:space-y-0 sm:space-x-4">
                            <Button onClick={copyToClipboard} className="bg-inherit border w-full border-[#04c8bb] text-[#04c8bb] hover:text-[#92efe6] hover:border-[#92efe6] font-semibold hover:bg-inherit text-sm sm:text-base">
                                Copy URL to Clipboard
                            </Button>
                            <Button onClick={toggleQRCode} className="bg-inherit border w-full border-[#04c8bb] text-[#04c8bb] hover:text-[#92efe6] hover:border-[#92efe6] font-semibold hover:bg-inherit text-sm sm:text-base">
                                {showQRCode ? null : 'Show QR Code'}
                            </Button>
                        </div>

                        <div className='mt-6 sm:mt-10 mx-2 sm:mx-10 md:mx-20 gap-4 text-white grid grid-cols-1 sm:grid-cols-2'>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className='mx-2 sm:mx-6 md:mx-10 text-xl sm:text-2xl md:text-3xl font-semibold tracking-wider text-[#92efe6] flex items-center'>
                                            <img src="/en.png" alt="Ciphered" className="mx-2 h-8 w-8 sm:h-10 sm:w-10" />
                                            <div>
                                                <span>Ciphered</span>
                                                <p className='text-xs sm:text-sm mt-1 sm:mt-2 text-gray-500 tracking-tight'>End-to-end encrypted</p>
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className='bg-inherit p-0 border-0'>
                                        <Card className='bg-[#187367] border-0 p-2 text-white text-sm sm:text-base w-60 sm:w-72 tracking-normal'>
                                            End-to-end encryption ensures that your files are encrypted on your device before uploading. Only you and those you share the decryption key with can access the original files. The server never sees the unencrypted data.
                                        </Card>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className='mx-2 sm:mx-6 md:mx-10 text-xl sm:text-2xl md:text-3xl font-semibold tracking-wider text-[#92efe6] flex items-center mt-4 sm:mt-0'>
                                            <img src="/upload.png" alt="Transmitted" className="mx-2 h-8 w-8 sm:h-10 sm:w-10" />
                                            <div>
                                                <span>Transmitted</span>
                                                <p className='text-xs sm:text-sm mt-1 sm:mt-2 text-gray-500 tracking-tighter'>You can close this page now</p>
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className='bg-inherit p-0 border-0'>
                                        <Card className='bg-[#187367] border-0 p-2 text-white text-sm sm:text-base w-60 sm:w-72 tracking-normal'>
                                            Your encrypted data has been successfully sent. For security, we recommend closing this tab.
                                        </Card>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <p className="text-gray-400 text-xs sm:text-sm">
                            Expires in 24 hours
                        </p>
                    </CardFooter>
                </Card>
            </div>

            {
                showQRCode && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-inherit border-white border-2 p-4 sm:p-6 rounded-lg w-full max-w-xs sm:max-w-sm">
                            <QRCode
                                value={downloadUrl}
                                size={256}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                viewBox={`0 0 256 256`}
                            />
                            <Button onClick={toggleQRCode} className="mt-4 w-full bg-[#04c8bb] text-white hover:bg-[#072522] text-sm sm:text-base">
                                Close
                            </Button>
                        </div>
                    </div>
                )
            }
        </div>
    );
}