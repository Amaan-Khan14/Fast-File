import { useState, ChangeEvent } from 'react';
import AppBar from "@/components/ui/AppBar";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';
import { APP_URL } from '@/config';
import { toast } from '@/components/ui/use-toast';


export default function Home() {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [, setUploadProgress] = useState<string>('');

    const navigate = useNavigate();

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFiles(Array.from(event.target.files));
        }
    };


    const encryptAndUploadFiles = async () => {
        const encryptionKey = await window.crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );

        const encryptedFiles: File[] = [];

        for (const file of selectedFiles) {
            const fileBuffer = await file.arrayBuffer();
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const encryptedContent = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv: iv },
                encryptionKey,
                fileBuffer
            );

            const encryptedBlob = new Blob([iv, encryptedContent], { type: 'application/octet-stream' });
            encryptedFiles.push(new File([encryptedBlob], file.name + '.encrypted'));
        }

        const formData = new FormData();
        encryptedFiles.forEach((file) => {
            formData.append('file', file);
        });

        try {
            setUploadProgress('Uploading...');
            const response = await axios.post(`${APP_URL}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });

            if (response.data.success) {
                setUploadProgress('Upload successful!');
                toast({
                    title: 'Upload successful',
                    description: 'Your files have been uploaded successfully'
                })
                let fileId = response.data.url.split('/')[3];
                fileId = fileId.split('?')[0];

                const exportedKey = await window.crypto.subtle.exportKey("jwk", encryptionKey);
                const keyString = JSON.stringify(exportedKey);

                navigate('/upload-success', { state: { fileId: fileId, encryptionKey: keyString } });
            } else {
                setUploadProgress(`Upload failed: ${response.data.error}`);
            }
        } catch (error) {
            setUploadProgress(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    };



    return (
        <div className="bg-gradient-to-b from-[#090a15] via-[#0b1d23] to-[#090a15] min-h-screen">
            <AppBar />
            <div className="py-12 sm:py-24 px-4 sm:px-8">
                <div className="max-w-screen-xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-[#d9f9f6] to-teal-900 bg-clip-text text-transparent">
                        Share Fearlessly, Secure by Nature.
                    </h1>
                    <p className="text-center text-gray-300 mb-8 px-2">
                        A secure file sharing platform, enabling you to share files anywhere, anytime.
                    </p>
                    <Card className="bg-inherit p-4 sm:p-10 rounded-lg flex flex-col lg:flex-row justify-between h-full w-full border-[#b7f4ee]">
                        <Card className="bg-inherit flex flex-col justify-center items-center border-dashed p-3 sm:p-5 border-[#187367] border-2 w-full h-auto sm:h-96 mb-6 lg:mb-0">
                            <CardHeader className='h-full mt-4 sm:mt-10'>
                                <div className="max-w-sm w-full">
                                    <Input
                                        id="file"
                                        type="file"
                                        multiple
                                        className="bg-[#187367] border-0 p-3 sm:p-5 h-auto text-white hover:bg-[#154f47] w-full"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className="mt-4 text-white text-center">
                                    <p className='mt-2 mb-5'>{selectedFiles.length} file(s) selected</p>
                                </div>
                                <Button
                                    onClick={encryptAndUploadFiles}
                                    disabled={selectedFiles.length === 0}
                                    className="bg-[#187367] text-white w-full sm:w-auto"
                                >
                                    Upload Files
                                </Button>
                            </CardHeader>
                        </Card>
                        <Card className="bg-inherit border-0 lg:ml-10 w-full flex items-center flex-col">
                            <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-teal-100 to-teal-400 bg-clip-text text-transparent my-5 ">
                                Seamless, secure file sharing with peace of mind and privacy.
                            </h2>
                            <p className="text-gray-300 text-base sm:text-xl tracking-normal">
                                FastFile leverages advanced <span className='font-bold text-teal-400 tracking-wider'>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>end-to-end encryption</TooltipTrigger>
                                            <TooltipContent>
                                                <Card className='bg-[#187367] border-0 p-2 text-white text-sm sm:text-base w-60 sm:w-72 tracking-normal'>
                                                    End-to-end encryption ensures that your files are encrypted on your device before uploading. Only you and those you share the decryption key with can access the original files. The server never sees the unencrypted data.
                                                </Card>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </span> to rigorously protect your files during transfer and storage. Secure sharing links include the necessary decryption information, ensuring that only intended recipients can access your files.
                            </p>
                        </Card>
                    </Card>
                </div>
            </div>
        </div>
    );
}