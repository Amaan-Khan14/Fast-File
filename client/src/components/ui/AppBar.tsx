import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator } from '@/components/ui/menubar';
import { APP_URL } from '@/config';
import { useAuth } from '@/useAuth';
import { Avatar } from '@/components/ui/avatar';

export default function AppBar() {
    const { isLoggedIn, setIsLoggedIn, isLoading } = useAuth();
    const navigate = useNavigate();


    async function handleLogout() {
        try {
            await axios.post(`${APP_URL}/user/logout`, {}, {
                withCredentials: true
            });
            setIsLoggedIn(false);
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    if (isLoading) {
        return null;
    }


    return (
        <nav className="p-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link to="/">
                            <span className="text-2xl font-bold tracking-wider text-white">FastFile</span>
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="flex items-baseline space-x-4">
                            {window.location.pathname === '/' ? null : (
                                <Button className="py-5 px-8 text-[16px] bg-inherit border-[#04c8bb] border hover:bg-inherit hover:border-[#92efe6]">
                                    <Link to="/" className="font-bold text-[#04c8bb] hover:text-[#92efe6]">Send More Files</Link>
                                </Button>
                            )}

                            {isLoggedIn ? (
                                <div className="flex items-center gap-4">
                                    <Button onClick={handleLogout} className="py-5 px-12 text-[16px] bg-inherit border-[#04c8bb] border hover:bg-inherit hover:border-[#92efe6]">
                                        <span className="font-bold text-[#04c8bb] hover:text-[#92efe6]">Log out</span>
                                    </Button>
                                    <Avatar className="h-10 w-10 rounded-full border-2 bg-gradient-to-br from-[#04c8bb] to-[#92efe6] border-[#04c8bb] overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                                        <Link to="/dashboard" className="flex items-center pl-3 justify-center  text-white font-semibold">
                                            A
                                        </Link>
                                    </Avatar>
                                </div>
                            ) : (
                                <>
                                    <Button className="py-5 px-12 text-[16px] w-0 bg-inherit border-[#04c8bb] border hover:bg-inherit hover:border-[#92efe6]">
                                        <Link to="/login" className="font-bold text-[#04c8bb] hover:text-[#92efe6]">Log in</Link>
                                    </Button>
                                    <Button className="py-5 px-12 text-[16px] w-36 bg-[#187367] hover:bg-[#154f47]">
                                        <Link to="/signup" className="font-bold">Get Started</Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                    <Menubar className="md:hidden hover:bg-[#187367] flex bg-[#090a15]  border-white/5">
                        <MenubarMenu>
                            <MenubarTrigger className='cursor-pointer text-white'>
                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" height="30" viewBox="0 0 50 50">
                                    <path d="M 3 9 A 1.0001 1.0001 0 1 0 3 11 L 47 11 A 1.0001 1.0001 0 1 0 47 9 L 3 9 z M 3 24 A 1.0001 1.0001 0 1 0 3 26 L 47 26 A 1.0001 1.0001 0 1 0 47 24 L 3 24 z M 3 39 A 1.0001 1.0001 0 1 0 3 41 L 47 41 A 1.0001 1.0001 0 1 0 47 39 L 3 39 z"></path>
                                </svg>
                            </MenubarTrigger>
                            <MenubarContent className="bg-inherit border-2 border-[#04c8bb]">
                                {isLoggedIn ? (
                                    <>
                                        <MenubarItem className="focus:bg-[#154f47]" onSelect={handleLogout}>
                                            <span className="w-full font-bold text-white text-base">Log out</span>
                                        </MenubarItem>
                                        <MenubarSeparator className="bg-[#04c8bb]" />
                                        <MenubarItem className="focus:bg-[#154f47]">
                                            <Link to="/dashboard" className="w-full font-bold text-white text-base">Dashboard</Link>
                                        </MenubarItem>
                                    </>
                                ) : (
                                    <>
                                        <MenubarItem className="focus:bg-[#154f47]">
                                            <Link to="/signup" className="w-full font-bold text-white text-base">Get Started</Link>
                                        </MenubarItem>
                                        <MenubarSeparator className="bg-[#04c8bb]" />
                                        <MenubarItem className="focus:bg-[#154f47]">
                                            <Link to="/login" className="w-full font-bold text-white text-base">Login</Link>
                                        </MenubarItem>
                                    </>
                                )}
                            </MenubarContent>
                        </MenubarMenu>
                    </Menubar>
                </div>
            </div>
        </nav>
    );
}