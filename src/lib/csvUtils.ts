
export const parseCSV = (csvText: string) => {
  // Split by lines and filter out empty lines
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  
  // Extract headers from the first line
  const headers = lines[0].split(',').map(header => header.trim());
  
  // Parse the data rows
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(value => value.trim());
    return headers.reduce((object, header, index) => {
      object[header] = values[index];
      return object;
    }, {} as Record<string, string>);
  });
  
  return { headers, data };
};

export const downloadCSV = (data: Record<string, any>[], filename = 'export.csv') => {
  if (data.length === 0) return;
  
  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        // Handle values that contain commas by wrapping in quotes
        const value = row[header] || '';
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"`
          : value;
      }).join(',')
    )
  ].join('\n');
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
