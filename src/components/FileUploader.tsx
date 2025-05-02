
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { parseCSV } from "@/lib/csvUtils";
import { FileText, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FileUploaderProps {
  onDataLoaded: (data: Record<string, string>[], headers: string[]) => void;
}

const FileUploader = ({ onDataLoaded }: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const { headers, data } = parseCSV(text);
        
        if (data.length > 0) {
          onDataLoaded(data, headers);
          toast({
            title: "Data Loaded Successfully",
            description: `${data.length} rows loaded from ${file.name}`,
          });
        } else {
          toast({
            title: "No data found",
            description: "The file appears to be empty or incorrectly formatted.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error parsing file",
          description: "The CSV file format is invalid or corrupted.",
          variant: "destructive",
        });
        console.error("Error parsing CSV:", error);
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary hover:bg-gray-50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          {fileName ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-10 w-10 text-primary" />
              <p className="font-semibold text-muted-foreground">{fileName}</p>
              <p className="text-sm text-muted-foreground">Click or drag to upload a different file</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="font-semibold">Click or drag file to upload</p>
              <p className="text-sm text-muted-foreground">CSV files only</p>
            </div>
          )}
          <input
            id="file-input"
            type="file"
            className="hidden"
            accept=".csv"
            onChange={handleFileChange}
          />
        </div>
        
        {fileName && (
          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setFileName(null);
                onDataLoaded([], []);
              }}
            >
              Clear Data
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUploader;
