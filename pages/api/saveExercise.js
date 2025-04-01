import fs from "fs";
import path from "path";

export default function handler(req, res) {
  try {
    if (req.method === "POST") {
      const filePath = path.join(process.cwd(), "public", "data.json");

      // Read the existing data
      const fileData = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "{}";
      const jsonData = fileData ? JSON.parse(fileData) : {};

      // Ensure the `exercises` array is initialized
      if (!jsonData.exercises) {
        jsonData.exercises = [];
      }

      const { id, name, entries } = req.body;

      // Check if the exercise already exists
      const existingExerciseIndex = jsonData.exercises.findIndex((exercise) => exercise.id === id);

      if (existingExerciseIndex !== -1) {
        // Update the existing exercise's entries
        jsonData.exercises[existingExerciseIndex].entries = entries;
      } else {
        // Add a new exercise
        jsonData.exercises.push({ id, name, entries });
      }

      // Write the updated data back to the file
      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

      res.status(200).json({ message: "Exercise saved successfully!" });
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error in saveExercise API:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}