import AppBar from "@/components/ui/AppBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { useParams } from "react-router-dom";

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

    const toggleQRCode = () => {
        setShowQRCode(!showQRCode);
    };

    useEffect(() => {
        const fetchFileInfo = async () => {
            try {
                const response = await axios.get<{ success: boolean; url: string; error?: string; size: number }>(`http://localhost:8787/download/${fileId}`)
                if (response.data.success) {
                    setFileInfo({ url: response.data.url });
                    setSize(response.data.size);
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

    const handleDownload = () => {
        if (fileInfo) {
            window.location.href = fileInfo.url;
        }

    };
    if (!setLoading) {
        return <div className="text-white">Loading...</div>;
    }

    if (error) {
        return <div className="text-white">{error}</div>;
    } 
    return (
        <div className='bg-gradient-to-b from-[#090a15] via-[#0b1d23] to-[#090a15] min-h-screen'>
            <AppBar />
            <div className="mt-44 flex items-center justify-center">
                <Card className="bg-inherit p-5 rounded-lg w-full max-w-5xl border-white">

                    <CardContent>
                        <div className="grid grid-cols-2 gap-8">
                            <CardHeader>
                                <div>
                                    <div className="flex justify-between gap-4 items-center bg-[#0b1d23] p-3 rounded mb-4">
                                        <div className="flex items-center w-64">
                                            <span className="mr-2">📷</span>
                                            <Input
                                                type="text"
                                                value={fileId?.split("-")[5]}
                                                readOnly
                                                className="flex-grow bg-[#0b1d23] border-0 text-base text-white p-2 rounded-l"
                                            />
                                        </div>
                                        <span className="text-gray-400 ">{size
                                            ? size < 1024
                                                ? `${size} B`
                                                : size < 1024 * 1024
                                                    ? `${(size / 1024).toFixed(2)} KB`
                                                    : `${(size / (1024 * 1024)).toFixed(2)} MB`
                                            : null
                                        }</span>
                                    </div>
                                    <Button onClick={handleDownload} className="w-full bg-[#04c8bb] text-white font-semibold hover:bg-[#92efe6] mb-4">
                                        Download file
                                    </Button>
                                </div>
                            </CardHeader>


                            <div>
                                <p className="my-5">
                                    <h1 className="text-4xl font-bold text-white">You've got a file!</h1>
                                </p>
                                <p className="text-white font-semibold text-xl mb-2">Share this file</p>
                                <div className="flex mb-4">
                                    <input
                                        type="text"
                                        value={fileInfo?.url}
                                        readOnly
                                        className="flex-grow bg-[#0b1d23] text-white p-2 rounded-l"
                                    />
                                    <Button className="bg-[#04c8bb] font-bold text-white hover:bg-[#92efe6] rounded-r">
                                        Copy link
                                    </Button>
                                </div>
                                <div className="w-full mb-4">
                                    <Button onClick={toggleQRCode} className="bg-[#0b1d23] text-white hover:bg-[#1c3e48] w-full">
                                        {showQRCode ? null : "Show QR code"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-center items-center">
                        <p className="text-gray-400 text-sm">
                            Expires in 24 hours
                        </p>
                    </CardFooter>
                </Card>
            </div>
            {showQRCode && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-inherit border-white border-2 p-6 rounded-lg">
                        <QRCode
                            value={fileInfo?.url as string}
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