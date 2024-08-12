import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/useAuth";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { APP_URL } from "@/config";
import { TrashIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";

interface FileItem {
    id: string;
    fileName: string;
    contentType: string;
    size: number;
    uploadedAt: string;
    url: string;
}

interface FileResponse {
    success: boolean;
    files: FileItem[];
}

export default function Dashboard() {
    const { user, setIsLoading } = useAuth();
    const [files, setFiles] = useState<FileItem[]>([]);
    const [totalFiles, setTotalFiles] = useState(0);
    const [Loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFiles() {
            try {
                const response = await axios.get<FileResponse>(`${APP_URL}/userupload/files`, {
                    withCredentials: true
                });
                setLoading(false);
                setFiles(response.data.files);
                setTotalFiles(response.data.files.length);

            } catch (error) {
                console.error("Error fetching files:", error);
                setLoading(false);
            }
        }
        fetchFiles();
    }, []);

    const deleteFile = async ({ id }: { id: string }) => {
        console.log(id);
        try {
            const response = await axios.delete<{ success: boolean; url: string; error?: string; message?: string }>(
                `${APP_URL}/userupload/file/${id}`,
                { withCredentials: true }
            );
            if (response.data.success) {
                setLoading(false);
                setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
                setTotalFiles(prevTotal => prevTotal - 1);
                toast({
                    title: "Success",
                    description: `${response.data.message}`,
                });
                location.reload();
            } else {
                setLoading(true);
                toast({
                    title: "Error",
                    description: response.data.error || "Failed to delete file",
                    duration: 5000,
                });
            }
        } catch (error) {
            setLoading(true);
            toast({
                title: "Error",
                description: "An error occurred while deleting the file",
                duration: 5000,
            });
        }
    };

    if (Loading) {
        return (
            <div>
                <div className="mt-10 mx-auto max-w-lg space-y-4">
                    <Card className="bg-inherit text-white rounded-lg p-4 shadow-[inset_0_2px_4px_0_rgba(45,212,191,0.5)] backdrop-filter backdrop-blur-lg bg-opacity-20 border border-gray-600">
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="flex justify-center mt-5 mx-5">
                    <div className="max-w-7xl w-full">
                        <Card className="bg-inherit text-white rounded-lg p-4 shadow-[inset_0_2px_4px_0_rgba(45,212,191,0.5)] backdrop-filter backdrop-blur-lg bg-opacity-20 border border-gray-600">
                            <Table>
                                <TableCaption>A list of your files</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-white text-2xl w-1/2">Filename</TableHead>
                                        <TableHead className="text-white text-2xl w-1/6">Size</TableHead>
                                        <TableHead className="text-white text-2xl w-1/6">Download</TableHead>
                                        <TableHead className="text-white text-2xl w-1/6">Delete</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[...Array(3)].map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell><Skeleton className="h-4 w-[150px] items-center" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div>
            <div className="mt-20 sm:mx-auto mx-5 w-lg sm:max-w-lg space-y-4">
                <Card className="bg-inherit text-white rounded-lg p-4 shadow-[inset_0_2px_4px_0_rgba(45,212,191,0.5)] flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12 rounded-full border-2 bg-gradient-to-br from-[#04c8bb] to-[#92efe6] border-[#04c8bb] overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                            <AvatarFallback className="flex items-center text-xl bg-inherit text-white font-semibold">
                                {user?.username?.[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <h2 className="text-2xl font-bold">{user?.username}</h2>
                    </div>
                    <div className="bg-teal-500 w-2/6 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold">{totalFiles}</p>
                        <p className="text-gray-200 text-sm">Total File(s) Shared</p>
                    </div>
                </Card>
            </div>
            <div className="flex justify-center mt-5 mx-5 ">
                <div className="max-w-7xl w-full">
                    <Card className="bg-inherit text-white text-center rounded-lg p-4 shadow-[inset_0_2px_4px_0_rgba(45,212,191,0.5)] backdrop-filter backdrop-blur-lg bg-opacity-20 border border-gray-600">
                        <CardHeader>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-50 to-emerald-300 bg-clip-text text-transparent">Your Files</h1>
                        </CardHeader>
                        <Table>
                            <TableCaption>A list of your files</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-white text-center text-2xl w-1/6">Date</TableHead>
                                    <TableHead className="text-white text-center text-2xl w-1/2">Filename</TableHead>
                                    <TableHead className="text-white text-center text-2xl w-1/6">Size</TableHead>
                                    <TableHead className="text-white text-center text-2xl w-1/6">Download</TableHead>
                                    <TableHead className="text-white text-center text-2xl w-1/6">Delete</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {files.map((file: FileItem, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell className="text-center text-lg font-semibold">{file.uploadedAt.split('T')[0]}</TableCell>
                                        <TableCell className="font-semibold text-center text-lg max-w-xs truncate">{file.fileName.includes('.encrypted') ? file.fileName.slice(37,).split('.encrypted')[0] :
                                            file.fileName.slice(37,)}</TableCell>
                                        <TableCell className="text-center text-lg font-semibold">{file.size
                                            ? file.size < 1024
                                                ? `${file.size} B`
                                                : file.size < 1024 * 1024
                                                    ? `${(file.size / 1024).toFixed(2)} KB`
                                                    : `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                                            : null}</TableCell>
                                        <TableCell className="text-center text-lg font-semibold">
                                            <a href={file.url} className="text-teal-400 hover:underline">Link</a>
                                        </TableCell>
                                        <TableCell className="text-center text-lg font-semibold">
                                            <Button
                                                disabled={Loading}
                                                className="bg-gray-500 hover:bg-red-600 text-white font-semibold"
                                            >{
                                                    Loading ? <ReloadIcon /> : <TrashIcon
                                                        className="h-6 w-6 text-white cursor-pointer items-center flex justify-center"
                                                        onClick={() => deleteFile({ id: file.fileName })}
                                                    />
                                                }
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </div>
        </div>
    );
}