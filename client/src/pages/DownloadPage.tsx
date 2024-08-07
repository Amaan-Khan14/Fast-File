import AppBar from "@/components/ui/AppBar";
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

    useEffect(() => {
        const fetchFileInfo = async () => {
            try {
                const response = await axios.get<{ success: boolean; url: string; error?: string; size: number }>(`${APP_URL}/download/${fileId}`)
                if (response.data.success) {
                    setFileInfo({ url: response.data.url });
                    setSize(response.data.size);

                    // Extract and import the encryption key
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
            try {
                const response = await fetch(fileInfo.url);
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

                const urlObj = new URL(fileInfo.url);
                const contentDisposition = urlObj.searchParams.get('response-content-disposition');
                let originalFilename = 'downloaded_file';
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
                    if (filenameMatch && filenameMatch[1]) {
                        originalFilename = filenameMatch[1].replace('.encrypted', '');
                    }
                }

                const a = document.createElement('a');
                a.href = url;
                a.download = originalFilename.replace(/_$/, '');
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (error) {
                setError('Failed to decrypt file: ' + (error instanceof Error ? error.message : String(error)));
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

    const encryptedFileName = fileId?.split('-')[5]
    const fileName = encryptedFileName?.split('.encrypted')[0]
    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href as string);
        toast({
            title: "Success",
            description: "URL copied to clipboard",
        })
    };

    return (
        <div className='bg-gradient-to-b from-[#090a15] via-[#0b1d23] to-[#090a15] min-h-screen'>
            <AppBar />
            <div className="mt-44 flex items-center justify-center">
                <Card className="bg-inherit p-5 rounded-lg w-full max-w-5xl border-[#b7f4ee]">
                    <CardContent>
                        <div className="grid grid-cols-2 gap-8">
                            <CardHeader>
                                <div>
                                    <div className="flex justify-between gap-4 items-center bg-[#16a394] p-3 rounded mb-4">
                                        <div className="flex items-center w-64">
                                            <span className="mr-2">📷</span>
                                            <Input
                                                type="text"
                                                value={fileName}
                                                readOnly
                                                className="flex-grow bg-inherit focus-visible:ring-0 focus-visible:ring-offset-0 border-0 text-base text-white p-2 rounded-l"
                                            />
                                        </div>
                                        <span className="text-white ">{size
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


                            <div>
                                <p className="my-5">
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-500 to-teal-800 bg-clip-text text-transparent">You've got a file!</h1>
                                </p>
                                <p className="text-white font-medium text-xl my-2">Share this file</p>
                                <div className="flex mb-4 gap-2">
                                    <Input
                                        type="text"
                                        value={window.location.href}
                                        readOnly
                                        className="flex-grow text-base bg-[#0b1d23] focus-visible:ring-0 focus-visible:ring-offset-1 focus-visible:ring-offset-gray-600 border border-gray-700 text-white p-2 rounded-l"
                                    />
                                    <Button onClick={copyToClipboard} className="bg-inherit border w-auto border-[#04c8bb] text-[#04c8bb] hover:text-[#92efe6] hover:border-[#92efe6] font-semibold hover:bg-inherit">
                                        Copy link
                                    </Button>
                                </div>
                                <div className="w-full mb-4">
                                    <Button onClick={toggleQRCode} className="bg-inherit border w-full border-[#04c8bb] text-[#04c8bb] hover:text-[#92efe6] hover:border-[#92efe6] font-semibold hover:bg-inherit">
                                        {showQRCode ? null : 'Show QR Code'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end items-center">
                        <p className="text-gray-400 text-sm">
                            Expires in 24 hours
                        </p>
                        <Button onClick={deleteFile} className="bg-[#04c8bb] text-sm px-1 h-6 text-white font-semibold hover:bg-[#92efe6] ml-4">
                            Delete file
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            {showQRCode && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-inherit border-white border-2 p-6 rounded-lg">
                        <QRCode
                            value={window.location.href as string}
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