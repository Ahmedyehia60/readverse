import React from "react";
import UserButton from "./UserButton";
import { Button } from "@/components/ui/button";


function DashBoard() {
  return (
    <div
      className="
        min-h-screen 
        bg-no-repeat 
        bg-center 
        bg-cover
        text-white
      "
      style={{
        backgroundImage: "url('/Images/galaxy3.jpg')",
      }}
    >
    
     <div>
        <Button className="absolute top-4 right-4 p-5 bg-[#2B1B72] text-white hover:bg-blue-800">
          Add Book
        </Button>
     </div>

    </div>
  );
}

export default DashBoard;
