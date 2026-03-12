# PDF Partitioner

An architectural, high-performance utility for partitioning PDF documents into precisely defined page ranges. Designed for speed, security, and precision.

## Key Features

- **Local Execution**: All processing is performed on your machine. Your documents never leave your local environment.
- **Precision Splitting**: Define splits by page frequency, total part count, or custom manual ranges.
- **Architectural UI**: A premium, high-contrast dark mode interface focused on clarity and utility.
- **ZIP Archiving**: Automatically batches partitioned files into a single ZIP archive for immediate download.
- **High Performance**: Powered by PyMuPDF, ensuring near-instantaneous processing even for massive documents.

## Configuration Options

1. **Split every N pages**: Automatically divides the document into chunks of a specific size (e.g., every 14 pages).
2. **Split into N parts**: Divides the document into a specific number of equal segments.
3. **Manual Override**: Full control using standard range notation (e.g., `1-10, 11-25, 26-`).

## Tech Stack

- **Backend**: FastAPI (Python 3.9+)
- **Engine**: PyMuPDF
- **Frontend**: Vanilla JavaScript / CSS (Inter Typeface)

## Local Setup

1. **Clone & Install**:
   ```bash
   git clone <repository-url>
   cd pdf-partitioner
   pip install -r requirements.txt
   ```

2. **Run Server**:
   ```bash
   python app/main.py
   ```

3. **Access Utility**:
   Navigate to `http://localhost:8000` in your browser.
