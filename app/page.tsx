"use client"

import { useEffect, useState } from "react"
import { LineChart } from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, TrendingUp } from "lucide-react"

interface Entry {
  date: string
  weight: number
}

interface Exercise {
  id: string
  name: string
  entries: Entry[]
}

export default function Home() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selectedExercise, setSelectedExercise] = useState<string>("")
  const [newExerciseName, setNewExerciseName] = useState<string>("")
  const [weight, setWeight] = useState<string>("")
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [showNewExerciseForm, setShowNewExerciseForm] = useState<boolean>(false)
  const [selectedExerciseForChart, setSelectedExerciseForChart] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch data from data.json
    fetch("/data.json")
      .then((response) => response.json())
      .then((data) => {
        if (data && Array.isArray(data.exercises) && data.exercises.length > 0) {
          setExercises(data.exercises)
        } else {
          // Handle empty or invalid data
          setExercises([])
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error)
        setExercises([]) // Fallback to empty array
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const handleAddEntry = async () => {
    if (!selectedExercise || !weight || !date) return;

    const updatedExercises = exercises.map((exercise) => {
      if (exercise.id === selectedExercise) {
        return {
          ...exercise,
          entries: [...exercise.entries, { date, weight: Number.parseFloat(weight) }].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          ),
        };
      }
      return exercise;
    });

    const updatedExercise = updatedExercises.find((exercise) => exercise.id === selectedExercise);

    // Update the local state
    setExercises(updatedExercises);
    setWeight("");

    // Send the updated exercise to the API
    try {
      const response = await fetch("/api/saveExercise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedExercise),
      });

      if (!response.ok) {
        throw new Error("Failed to update exercise");
      }
    } catch (error) {
      console.error("Error updating exercise:", error);
    }
  };

  const handleAddExercise = async () => {
    if (!newExerciseName) return;

    const newExercise = {
      id: Date.now().toString(), // Unique ID
      name: newExerciseName,
      entries: [],
    };

    // Update the local state
    setExercises((prev) => [...prev, newExercise]);
    setNewExerciseName("");

    // Send the new exercise to the API
    try {
      const response = await fetch("/api/saveExercise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newExercise),
      });

      if (!response.ok) {
        throw new Error("Failed to save exercise");
      }
    } catch (error) {
      console.error("Error saving exercise:", error);
    }
  };

  const toggleChart = (exerciseId: string) => {
    if (selectedExerciseForChart === exerciseId) {
      setSelectedExerciseForChart(null)
    } else {
      setSelectedExerciseForChart(exerciseId)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-zinc-100">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">Gym Weights Tracker</h1>

        {exercises.length === 0 ? (
          <div className="text-center text-zinc-400">
            <p>No exercises found. Add your first exercise to get started!</p>
            <Button
              onClick={() => setShowNewExerciseForm(true)}
              className="mt-4 bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
            >
              Add Exercise
            </Button>
            {showNewExerciseForm && (
              <div className="mt-6">
                <Label htmlFor="newExercise" className="mb-2 block text-zinc-200">
                  New Exercise Name
                </Label>
                <Input
                  id="newExercise"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  className="bg-zinc-700 border-zinc-600 text-zinc-100"
                />
                <div className="flex gap-4 mt-4">
                  <Button
                    onClick={handleAddExercise}
                    className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                  >
                    Add Exercise
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                    onClick={() => setShowNewExerciseForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Card className="bg-zinc-800 border-zinc-700 mb-8">
              <CardHeader>
                <CardTitle className="text-zinc-100">Add New Entry</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="flex items-end gap-4">
                    {!showNewExerciseForm ? (
                      <>
                        <div className="flex-1">
                          <Label htmlFor="exercise" className="mb-2 block text-zinc-200">
                            Exercise
                          </Label>
                          <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                            <SelectTrigger className="bg-zinc-700 border-zinc-600 text-zinc-100">
                              <SelectValue placeholder="Select an exercise" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-700 border-zinc-600 text-zinc-100">
                              {exercises.map((exercise) => (
                                <SelectItem key={exercise.id} value={exercise.id}>
                                  {exercise.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="outline"
                          className="border-zinc-600 text-black hover:bg-zinc-700 hover:text-white focus:ring-2 focus:ring-zinc-500"
                          onClick={() => setShowNewExerciseForm(true)}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          New Exercise
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <Label htmlFor="newExercise" className="mb-2 block text-zinc-200">
                            New Exercise Name
                          </Label>
                          <Input
                            id="newExercise"
                            value={newExerciseName}
                            onChange={(e) => setNewExerciseName(e.target.value)}
                            className="bg-zinc-700 border-zinc-600 text-zinc-100"
                          />
                        </div>
                        <Button onClick={handleAddExercise} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                          Add Exercise
                        </Button>
                        <Button
                          variant="outline"
                          className="border-zinc-600 text-black-100 hover:bg-zinc-700"
                          onClick={() => setShowNewExerciseForm(false)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>

                  {!showNewExerciseForm && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="weight" className="mb-2 block text-zinc-200">
                          Weight (kgs)
                        </Label>
                        <Input
                          id="weight"
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="bg-zinc-700 border-zinc-600 text-zinc-100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="date" className="mb-2 block text-zinc-200">
                          Date
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="bg-zinc-700 border-zinc-600 text-zinc-100"
                        />
                      </div>
                    </div>
                  )}

                  {!showNewExerciseForm && (
                    <Button
                      onClick={handleAddEntry}
                      disabled={!selectedExercise || !weight || !date}
                      className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 w-full md:w-auto md:self-end"
                    >
                      Add Entry
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6">
              {exercises.map((exercise) => (
                <Card key={exercise.id} className="bg-zinc-800 border-zinc-700">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-zinc-100">{exercise.name}</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-zinc-600 text-black-100 hover:bg-zinc-700 hover:text-white focus:ring-2 focus:ring-zinc-500"
                      onClick={() => toggleChart(exercise.id)}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      {selectedExerciseForChart === exercise.id ? "Hide Chart" : "Show Progress"}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {selectedExerciseForChart === exercise.id && exercise.entries.length > 1 && (
                      <div className="h-64 mb-6">
                        <LineChart
                          data={exercise.entries.map((entry) => ({
                            name: entry.date,
                            value: entry.weight,
                          }))}
                        />
                      </div>
                    )}

                    {exercise.entries.length > 0 ? (
                      <div className="grid gap-2">
                        <div className="grid grid-cols-2 font-semibold mb-2 text-zinc-200">
                          <div>Date</div>
                          <div>Weight (lbs)</div>
                        </div>
                        {exercise.entries
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((entry, index) => (
                            <div key={index} className="grid grid-cols-2 py-2 border-t border-zinc-700 text-zinc-100">
                              <div>{new Date(entry.date).toLocaleDateString()}</div>
                              <div>{entry.weight}</div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-zinc-400">No entries yet. Add your first one above!</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

