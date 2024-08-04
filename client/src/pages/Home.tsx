import { useState, ChangeEvent } from 'react';
import AppBar from "@/components/ui/AppBar";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';


export default function Home() {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<string>('');

    const navigate = useNavigate();

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFiles(Array.from(event.target.files));
        }
    };


    const generateIV = () => {
        const iv = new Uint8Array(16);
        crypto.getRandomValues(iv);
        return Array.from(iv, (byte) => byte.toString(16).padStart(2, '0')).join('');
    };

    const uploadFiles = async () => {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
            formData.append('file', file);
        });

        const iv = generateIV();
        formData.append('iv', iv);

        try {
            setUploadProgress('Uploading...');
            const response = await axios.post('http://localhost:33569/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });

            if (response.data.success) {
                setUploadProgress('Upload successful!');
                console.log('Download URL:', response.data.url);
                navigate('/upload-success', { state: { url: response.data.url } });
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
            <div className="py-24 px-8">
                <div className="max-w-screen-xl mx-auto">
                    <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-[#d9f9f6] to-teal-900 bg-clip-text text-transparent">
                        Share Fearlessly, Secure by Nature.
                    </h1>
                    <p className="text-center text-gray-300 mb-8">
                        A secure file sharing platform, enabling you to share files anywhere, anytime.
                    </p>
                    <Card className="bg-inherit p-10 rounded-lg flex flex-row justify-between h-full w-full border-[#b7f4ee]">
                        <Card className="bg-inherit flex flex-col justify-center items-center border-dashed p-5 border-[#187367] border-2 w-full h-96">
                            <CardHeader className=' h-full mt-10'>
                                <div className="max-w-sm">
                                    <Input
                                        id="file"
                                        type="file"
                                        multiple
                                        className="bg-[#187367] border-0 p-5 h-auto text-white hover:bg-[#154f47] "
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className="mt-4 text-white text-center">
                                    <p className='mt-2'>{selectedFiles.length} file(s) selected</p>
                                </div>
                                {
                                    selectedFiles.length > 0 ? <Button onClick={uploadFiles} className="mt-4 bg-[#187367] text-white">
                                        Upload Files
                                    </Button> : <Button disabled className="mt-4 bg-[#187367] text-white">
                                        Upload Files
                                    </Button>
                                }

                            </CardHeader>
                        </Card>
                        <Card className="bg-inherit border-0 ml-10 w-full flex items-center flex-col">
                            <h2 className="text-4xl font-bold bg-gradient-to-r from-teal-100 to-teal-400 bg-clip-text text-transparent my-5">Seamless, secure file sharing with peace of mind and privacy.
                            </h2>
                            <p className="text-gray-300 text-xl tracking-normal">
                                With FastFile, you can securely share files with <span className='font-bold text-teal-400 tracking-wider'>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>end-to-end encryption</TooltipTrigger>
                                            <TooltipContent>
                                                <Card className='bg-[#187367] border-0 p-2 text-white text-base w-72 tracking-normal'>
                                                    End-to-end encryption safeguards your files, ensuring they remain secure from prying eyes. Only those with the correct "secret key" can unlock the files. When you generate a link, the key is embedded, allowing you to effortlessly share with the right people while keeping your data private.
                                                </Card>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </span>. Links expire automatically, keeping your files private and ensuring they don't stay online indefinitely.
                            </p>
                        </Card>
                    </Card>
                </div>
            </div>
        </div>
    );
}