#!/usr/bin/env python3
"""
Extract member data from PDF and convert to CSV format
"""

import PyPDF2
import csv
import re
import sys

def extract_text_from_pdf(pdf_path):
    """Extract all text from PDF file"""
    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            print(f"Total pages: {len(pdf_reader.pages)}")
            
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + "\n"
                
        return text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        sys.exit(1)

def main():
    pdf_path = "assets/old member roster.pdf"
    
    print("Extracting text from PDF...")
    text = extract_text_from_pdf(pdf_path)
    
    # Save raw extracted text for review
    with open("assets/extracted-text.txt", "w", encoding="utf-8") as f:
        f.write(text)
    
    print(f"\nExtracted {len(text)} characters")
    print("\nFirst 2000 characters:")
    print("=" * 80)
    print(text[:2000])
    print("=" * 80)
    
    print("\nRaw text saved to: assets/extracted-text.txt")
    print("\nPlease review the extracted text to determine the best parsing strategy.")

if __name__ == "__main__":
    main()
