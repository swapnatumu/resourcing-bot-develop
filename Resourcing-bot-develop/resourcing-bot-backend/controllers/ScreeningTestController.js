import express from "express";

import fs from 'fs/promises';
import path from "path";

import { Screening_Test } from "../models/mongoschema.js";

const app = express();


// Error handler function
const handleError = (res, error) => {
    console.error(error);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
    });
};

export const uploadScreeningTest = async (req, res) => {
    try {
        const { jdId, job_role } = req.body;

        // Check if data for the given jdId and job_role already exists
        const existingTest = await Screening_Test.findOne({ jd: jdId, jobRole: job_role });
        if (existingTest) {
            console.log("Screening test data already uploaded. Screening ID:", existingTest.ScreeningID);
            return res.status(200).json({ success: true, ScreeningID: existingTest.ScreeningID });
        }
        
        // const questionsFolderPath = process.env.QUESTIONS_FOLDER_PATH;  
        // const questionsFolderPath = "/home/indhu/Desktop/Resourcing-bot/resourcing-bot-backend/Questionpapers"     
        const questionsFolderPath = "./Questionpapers"     
        const questionPaper = `${job_role}.json`;
     
        const questionPaperPath = path.join(questionsFolderPath, questionPaper);
        
        console.log("questionPaperPath", questionPaperPath);
        
        try {
              // Check if file exists before attempting to read it
            await fs.access(questionPaperPath, fs.constants.F_OK);
            const fileContent = await fs.readFile(questionPaperPath, "utf-8");             
            const questionData = JSON.parse(fileContent);
            const questionsArray = questionData.map((question) => ({
                questionText: question.question,
                answerOptions: question.options,
                correctAnswer: question.correct_answer,
            }));

            console.log("questionsArray:", questionsArray);

			// Generate Screening ID with prefix and random 8-digit number
			const IDPrefix = "ST-";
			const randomEightDigitNumber = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
			const ScreeningID = IDPrefix + randomEightDigitNumber;

            const data = {
				ScreeningID:ScreeningID,
                jd: jdId,
                jobRole: job_role,
                questions: questionsArray,
                passingScore: 10,
            };

            const result = await Screening_Test.create(data);
            console.log("result:", result);

            res.status(200).json({ success: true, ScreeningID: ScreeningID });
        } catch (error) {
           console.error("Error accessing file:", error); 
           res.status(404).json({ success: false, message: "Question paper file not found." });
        }
    } catch (error) {
        handleError(res, error);
    }
};



export default app;



// Controller function to get a screening test by ScreeningID
export const getScreeningTestById = async (req, res) => {
    console.log("Screening");
    try {
        const screeningID = req.params.id; // Correctly get the screeningID from the URL parameters
        console.log("backend code:",screeningID)
        const screeningTest = await Screening_Test.findOne({ ScreeningID: screeningID }).populate('jd');
        console.log('screeningTest:', screeningTest);
        if (!screeningTest) {
            return res.status(404).json({ message: 'Screening test not found' });
        }
        res.json(screeningTest);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
