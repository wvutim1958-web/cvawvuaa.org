#!/usr/bin/env python3
"""
Extract member data from PDF using pdfplumber and convert to CSV format
"""

import pdfplumber
import csv
import re

def extract_data_with_pdfplumber(pdf_path):
    """Extract data from PDF using pdfplumber which handles tables better"""
    
    all_data = []
    
    with pdfplumber.open(pdf_path) as pdf:
        print(f"Total pages: {len(pdf.pages)}\n")
        
        for page_num, page in enumerate(pdf.pages, 1):
            print(f"=== PAGE {page_num} ===")
            
            # Try to extract as table
            tables = page.extract_tables()
            
            if tables:
                print(f"Found {len(tables)} table(s) on page {page_num}")
                for table_num, table in enumerate(tables, 1):
                    print(f"\nTable {table_num}:")
                    for row_num, row in enumerate(table[:5], 1):  # Show first 5 rows
                        print(f"  Row {row_num}: {row}")
                    all_data.extend(tables)
            else:
                # If no tables, extract as text
                text = page.extract_text()
                print(f"No tables found. Extracted text (first 500 chars):")
                print(text[:500] if text else "No text extracted")
                print()
    
    return all_data

def main():
    pdf_path = "assets/old member roster.pdf"
    
    print("Extracting data from PDF using pdfplumber...\n")
    
    data = extract_data_with_pdfplumber(pdf_path)
    
    if data:
        # Save the extracted data
        with open("assets/extracted-data-raw.txt", "w", encoding="utf-8") as f:
            for item in data:
                f.write(str(item) + "\n\n")
        
        print("\nRaw data saved to: assets/extracted-data-raw.txt")
        
        # Try to create CSV
        if data and len(data) > 0:
            print("\nAttempting to create CSV...")
            
            # Expected columns based on user's description
            headers = [
                "Title",
                "First Name",
                "Last Name",
                "Suffix",
                "Professional Suffix",
                "Salutation (Casual)",
                "Salutation (Formal)",
                "Address Street 1",
                "Address Street 2",
                "Address City",
                "Address State",
                "Address ZIP",
                "Address Country",
                "Accept Mail"
            ]
            
            csv_path = "admin/old-member-roster.csv"
            
            with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.writer(csvfile)
                writer.writerow(headers)
                
                # Process each table
                for table in data:
                    for row in table:
                        if row and any(cell and str(cell).strip() for cell in row):
                            # Clean up the row
                            cleaned_row = [str(cell).strip() if cell else "" for cell in row]
                            writer.writerow(cleaned_row)
            
            print(f"CSV saved to: {csv_path}")
    else:
        print("\nNo tabular data could be extracted.")
        print("The PDF may require manual data entry or OCR.")

if __name__ == "__main__":
    main()
