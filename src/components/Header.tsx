
import React from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b bg-white">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img 
            src="https://transfrinc.com/site_assets/images/logo.png" 
            alt="Transfr Logo" 
            className="logo"
          />
          <div className="hidden md:block border-l h-8 mx-4"></div>
          <h1 className="text-xl font-semibold hidden md:block">Data Explorer</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="hidden sm:flex">
                  <FileText className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Documentation</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Documentation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
};

export default Header;
