
import React from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-[#0072ce] text-white">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img 
            src="https://transfrinc.com/site_assets/images/logo.png" 
            alt="Transfr Logo" 
            className="logo h-8 brightness-0 invert"
          />
          <div className="hidden md:block border-l border-white/30 h-8 mx-4"></div>
          <h1 className="text-xl font-semibold hidden md:block">Curricular Mapping</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="hidden sm:flex bg-white/10 border-white/20 hover:bg-white/20">
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
