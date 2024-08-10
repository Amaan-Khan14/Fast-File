import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { APP_URL } from "@/config";
import axios from "axios";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { useNavigate, useParams } from "react-router-dom";

interface FileInfo {
    url: string;
}

export default function DownloadPage() {
    const { fileId } = useParams<{ fileId: string }>();
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
    const [size, setSize] = useState<number | null>(null);
    const [, setLoading] = useState<boolean>();
    const [error, setError] = useState<string | null>(null);
    const [showQRCode, setShowQRCode] = useState(false);
    const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
    const navigate = useNavigate()
    const toggleQRCode = () => {
        setShowQRCode(!showQRCode);
    };

    const [, setIsLoggedIn] = useState(false);


    async function checkLoginStatus() {
        try {
            await axios.get(`${APP_URL}/userupload/files`, {
                withCredentials: true
            });
            setIsLoggedIn(true);
            return true;
        } catch (error) {
            setIsLoggedIn(false);
            return false;
        }
    }

    useEffect(() => {
        const fetchFileInfo = async () => {
            const loggedIn = await checkLoginStatus();
            try {
                const response = await axios.get<{ success: boolean; url: string; error?: string; size: number }>(
                    loggedIn ? `${APP_URL}/userupload/download/${fileId}` : `${APP_URL}/download/${fileId}`,
                    loggedIn ? { withCredentials: true } : {}
                );
                setFileInfo(response.data);


                if (response.data.success) {
                    setFileInfo({ url: response.data.url });
                    setSize(response.data.size);

                    const urlParams = new URLSearchParams(window.location.search);
                    const keyString = urlParams.get('key');
                    if (keyString) {
                        const keyData = JSON.parse(decodeURIComponent(keyString));
                        const importedKey = await window.crypto.subtle.importKey(
                            "jwk",
                            keyData,
                            { name: "AES-GCM", length: 256 },
                            true,
                            ["decrypt"]
                        );
                        setEncryptionKey(importedKey);
                    }
                } else {
                    setError(response.data.error || "Failed to fetch file information");
                }
            } catch (error) {
                setError('An error occurred while fetching file information');
            } finally {
                setLoading(false);
            }
        }
        fetchFileInfo();
    }, [fileId]);


    const deleteFile = async () => {
        try {
            const response = await axios.delete(`${APP_URL}/${fileId}`);
            if (response.data.success) {
                toast({
                    title: "Success",
                    description: "File deleted successfully",
                });
                navigate('/');
            } else {
                setError(response.data.error || "Failed to delete file");
            }
        } catch (error) {
            setError('An error occurred while deleting the file');
            toast({
                title: "Error",
                description: "An error occurred while deleting the file",
                duration: 5000,
            })
        }
    };

    const handleDownload = async () => {
        if (fileInfo && encryptionKey) {
            const response = await fetch(fileInfo.url);

            if (fileId?.includes('.zip')) {
                const a = document.createElement('a');
                a.href = response.url;
                a.download = fileId?.split('.encrypted')[0] as string;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(response.url);
            }
            else {
                try {
                    const encryptedContent = await response.arrayBuffer();
                    const iv = new Uint8Array(encryptedContent.slice(0, 12));
                    const data = new Uint8Array(encryptedContent.slice(12));


                    const decryptedContent = await window.crypto.subtle.decrypt(
                        { name: "AES-GCM", iv: iv },
                        encryptionKey,
                        data
                    );

                    const blob = new Blob([decryptedContent], { type: 'application/octet-stream' });
                    const url = URL.createObjectURL(blob);

                    const originalFilename = fileId?.split('.encrypted')[0]

                    const a = document.createElement('a');
                    a.href = url;
                    a.download = originalFilename as string;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }

                catch (error) {
                    setError('Failed to decrypt file: ' + (error instanceof Error ? error.message : String(error)));
                }
            }

        } else if (!encryptionKey) {
            setError('Decryption key not found. Make sure you have the correct download link.');
        }
    };

    if (!setLoading) {
        return <div className="text-white">Loading...</div>;
    }

    if (error) {
        return <div className="text-white">{error}</div>;
    }

    let copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href as string);
        toast({
            title: "Success",
            description: "URL copied to clipboard",
        })
    };

    let fileName = fileId;
    if (!fileId?.includes('.zip')) {
        fileName = fileId?.split('.encrypted')[0]
    }

    return (
        <div>
            <div className="mt-20 sm:mt-44 mb-10 mx-4 sm:mx-10 flex items-center justify-center">
                <Card className="bg-inherit p-3 sm:p-5 rounded-lg w-full max-w-5xl border-[#b7f4ee] mb-10">
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-8">
                            <CardHeader className="w-full sm:w-1/2">
                                <div>
                                    <div className="flex justify-between gap-2 sm:gap-4 items-center bg-[#16a394] p-2 sm:p-3 rounded mb-4">
                                        <div className="flex items-center w-full">
                                            <span className="mr-2">📷</span>
                                            <Input
                                                type="text"
                                                value={fileName}
                                                readOnly
                                                className="flex-grow bg-inherit focus-visible:ring-0 focus-visible:ring-offset-0 border-0 text-sm sm:text-base text-white p-1 sm:p-2 rounded-l"
                                            />
                                        </div>
                                        <span className="text-white w-1/4 text-end text-sm sm:text-base">{size
                                            ? size < 1024
                                                ? `${size} B`
                                                : size < 1024 * 1024
                                                    ? `${(size / 1024).toFixed(2)} KB`
                                                    : `${(size / (1024 * 1024)).toFixed(2)} MB`
                                            : null
                                        }</span>
                                    </div>
                                    <Button onClick={handleDownload} className="w-full bg-inherit border border-[#04c8bb] text-[#04c8bb] hover:text-[#92efe6] hover:border-[#92efe6] font-semibold hover:bg-inherit mb-4">
                                        Download file
                                    </Button>
                                </div>
                            </CardHeader>

                            <div className="w-full sm:w-1/2">
                                <div className="sm:my-5">
                                    <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-teal-500 to-teal-800 bg-clip-text text-transparent">You've got a file!</h1>
                                </div>
                                <p className="text-white font-medium text-lg sm:text-xl my-2">Share this file</p>
                                <div className="flex mb-4 gap-2">
                                    <Input
                                        type="text"
                                        value={window.location.href}
                                        readOnly
                                        className="flex-grow text-sm sm:text-base bg-[#0b1d23] focus-visible:ring-0 focus-visible:ring-offset-1 focus-visible:ring-offset-gray-600 border border-gray-700 text-white p-1 sm:p-2 rounded-l"
                                    />
                                    <Button onClick={copyToClipboard} className="bg-inherit border w-auto border-[#04c8bb] text-[#04c8bb] hover:text-[#92efe6] hover:border-[#92efe6] font-semibold hover:bg-inherit text-sm sm:text-base">
                                        Copy link
                                    </Button>
                                </div>
                                <div className="w-full mb-4">
                                    <Button onClick={toggleQRCode} className="bg-inherit border w-full border-[#04c8bb] text-[#04c8bb] hover:text-[#92efe6] hover:border-[#92efe6] font-semibold hover:bg-inherit text-sm sm:text-base">
                                        {showQRCode ? null : 'Show QR Code'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-between sm:justify-end items-center gap-2 sm:gap-0">
                        <p className="text-gray-400 text-xs sm:text-sm">
                            Expires in 24 hours
                        </p>
                        <Button onClick={deleteFile} className="bg-[#04c8bb] text-xs sm:text-sm px-2 h-6 sm:ml-2 text-white font-semibold hover:bg-[#92efe6] w-full sm:w-auto">
                            Delete file
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            {showQRCode && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-inherit border-white border-2 p-4 sm:p-6 rounded-lg w-full max-w-xs sm:max-w-md">
                        <QRCode
                            value={window.location.href}
                            size={256}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                        />
                        <Button onClick={toggleQRCode} className="mt-4 w-full bg-[#04c8bb] text-white hover:bg-[#072522] text-sm sm:text-base">
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
