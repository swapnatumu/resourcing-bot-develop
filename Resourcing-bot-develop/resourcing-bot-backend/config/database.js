import mongoose from "mongoose";

export const connectDatabase = async () => {
	try {
		// Connect to MongoDB using Mongoose
		const { connection } = await mongoose.connect(process.env.MONGO_URI);
		console.log(`MongoDB connected: ${connection.host}`);

	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};

// Export the db variable so it can be used in other modules
export {};
