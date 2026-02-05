import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export const maxDuration = 60; // Allow 60 seconds for scraping

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Path to the scraper script
    // Adjust path based on your project structure
    // Assumes project_becas/scrapers parallel to project_becas/becas-app
    const scraperPath = path.resolve(process.cwd(), '../scrapers/url_scraper.py');
    const venvPythonPath = path.resolve(process.cwd(), '../scrapers/venv/Scripts/python.exe');
    
    // Fallback to system python if venv not found (e.g. production/vercel)
    // Note: Vercel serverless functions don't have Python installed by default
    // This part assumes you are running on a server that has Python available
    const pythonCommand = process.env.PYTHON_PATH || 'python';

    console.log(`🚀 Executing scraper: ${pythonCommand} ${scraperPath} ${url}`);

    return new Promise((resolve) => {
      // Use env variable PYTHONIOENCODING to force UTF-8 output from Python
      const pythonProcess = spawn(pythonCommand, [scraperPath, url, '--json'], {
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
      });

      const outputBuffers: Buffer[] = [];
      const errorBuffers: Buffer[] = [];

      pythonProcess.stdout.on('data', (data: Buffer) => {
        outputBuffers.push(data);
      });

      pythonProcess.stderr.on('data', (data: Buffer) => {
        errorBuffers.push(data);
        console.error(`Scraper stderr: ${data.toString('utf-8')}`);
      });

      pythonProcess.on('close', (code) => {
        // Combine buffers and decode as UTF-8
        const outputData = Buffer.concat(outputBuffers).toString('utf-8');
        const errorData = Buffer.concat(errorBuffers).toString('utf-8');
        
        if (code !== 0) {
          console.error(`Scraper exited with code ${code}`);
          resolve(
            NextResponse.json(
              { error: `Scraper failed: ${errorData || 'Unknown error'}` },
              { status: 500 }
            )
          );
          return;
        }

        try {
          // Parse the JSON output from the script
          const result = JSON.parse(outputData);
          
          if (result.success) {
            resolve(NextResponse.json(result.data));
          } else {
            resolve(
              NextResponse.json(
                { error: result.error || 'Extraction failed' },
                { status: 400 }
              )
            );
          }
        } catch (e) {
          console.error('Failed to parse scraper output:', outputData);
          resolve(
            NextResponse.json(
              { error: 'Invalid response from scraper' },
              { status: 500 }
            )
          );
        }
      });
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
