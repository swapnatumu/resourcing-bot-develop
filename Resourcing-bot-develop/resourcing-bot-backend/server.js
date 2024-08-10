


import { app } from './app.js';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
import path from 'path';
import url from 'url';
import express from 'express';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fs from 'fs/promises';



dotenv.config({
    path: './config/config.env'
});

connectDatabase();

const appInstance = express();


const resumesDirectory = 'C:\\Users\\Zentree Labs\\Desktop\\RESOURCING-BOT\\RESOURCING-BOT\\backend\\resume_processing\\main_folder\\subfolder1';
// Serve static files from this directory
app.use('/resumes', express.static(resumesDirectory));


appInstance.use(cors({
    // origin: '*',
    origin: 'http://10.10.1.46:3000',
    credentials: true,
   
  }));

// Define an API endpoint to fetch resume file paths
app.get('/api/resumes', (req, res) => {
    fs.readdir(resumesDirectory, (err, files) => {
      if (err) {
        console.error('Error reading directory:', err);
        res.status(500).json({ error: 'Unable to read directory' });
      } else {
        // Filter only PDF files
        const pdfFiles = files.filter((file) => path.extname(file).toLowerCase() === '.pdf');
        
        // Send the list of PDF file names to the frontend as JSON
        res.json(pdfFiles);
      }
    });
  });


  
// appInstance.use('/resumes', express.static(publicPath));
appInstance.use(app);

appInstance.listen(process.env.PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
