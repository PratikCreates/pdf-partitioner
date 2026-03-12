# PDF Partitioner

Ultra-fast PDF partitioning tool built with FastAPI and PyMuPDF.

## Features
- **High Speed**: Built with PyMuPDF, one of the fastest PDF libraries.
- **Large File Support**: Efficiently handles large PDF files.
- **Modern UI**: Clean, responsive, glassmorphic dark-mode design.
- **Bulk Processing**: Split PDFs into multiple partitions and download as a ZIP archive.

## Tech Stack
- **Backend**: FastAPI (Python)
- **PDF Engine**: PyMuPDF (fitz)
- **Frontend**: Vanilla JavaScript, CSS, HTML

## Setup
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the server:
   ```bash
   python app/main.py
   ```
3. Open `http://localhost:8000` in your browser.
