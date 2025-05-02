
import { parseCSV } from "@/lib/csvUtils";

export const fetchCSVData = async (filePath: string = '/data.csv') => {
  try {
    const response = await fetch(filePath);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV file: ${response.status} ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const { headers, data } = parseCSV(csvText);
    
    return { 
      success: true,
      headers, 
      data 
    };
  } catch (error) {
    console.error('Error fetching or parsing CSV data:', error);
    return { 
      success: false,
      headers: [],
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
