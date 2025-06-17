import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "@/components/ui/menubar";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

export default function AppBar() {
  return (
    <nav className="p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex justify-center items-center space-x-3">
              <img src="/cloud.png" alt="logo" />
              <span className="text-2xl font-bold tracking-wider text-white">
                FastFile
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-white">
                <Link
                  to="https://github.com/Amaan-Khan14/Fast-File"
                  target="blank"
                >
                  <GitHubLogoIcon className="h-14 w-14 p-2 rounded-full" />
                </Link>
              </div>
              {window.location.pathname === "/" ? null : (
                <Button className="h-10 px-4 text-[16px] bg-inherit border-[#04c8bb] border hover:bg-inherit hover:border-[#92efe6]">
                  <Link
                    to="/"
                    className="font-bold text-[#04c8bb] hover:text-[#92efe6]"
                  >
                    Send More Files
                  </Link>
                </Button>
              )}
            </div>
          </div>
          <Menubar className="md:hidden bg-[#187367] flex  border-white/5">
            <MenubarMenu>
              <MenubarTrigger className="cursor-pointer text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  height="30"
                  viewBox="0 0 50 50"
                >
                  <path d="M 3 9 A 1.0001 1.0001 0 1 0 3 11 L 47 11 A 1.0001 1.0001 0 1 0 47 9 L 3 9 z M 3 24 A 1.0001 1.0001 0 1 0 3 26 L 47 26 A 1.0001 1.0001 0 1 0 47 24 L 3 24 z M 3 39 A 1.0001 1.0001 0 1 0 3 41 L 47 41 A 1.0001 1.0001 0 1 0 47 39 L 3 39 z"></path>
                </svg>
              </MenubarTrigger>
              <MenubarContent className="bg-[#154f47] border-2 border-[#04c8bb]">
                <MenubarItem className="focus:bg-black">
                  <Link
                    to="/"
                    className="w-full font-bold text-white text-base"
                  >
                    Send More Files
                  </Link>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
      </div>
    </nav>
  );
}
