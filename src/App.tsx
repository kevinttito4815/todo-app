import { useState, useEffect } from "react";
import "./App.css";


type TaskStatus = "incomplete" | "done" | "pending";

interface Task {
    id: number;
    title: string;
    status: TaskStatus;
}

const STORAGE_KEY = "tasks";

function App() {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

    const [taskForm, setTaskForm] = useState<Omit<Task, "id">>({
        title: "",
        status: "incomplete",
    });
    const [tasks, setTasks] = useState<Task[]>(() => {
        const savedTasks = localStorage.getItem(STORAGE_KEY);
        return savedTasks ? JSON.parse(savedTasks) : [];
    });

    const addTask = (task: Omit<Task, "id">) => {
        const lastTask = tasks[tasks.length - 1];
        const newId = lastTask ? lastTask.id + 1 : 1;

        setTasks([...tasks, { id: newId, ...task }]);
    };

    const handleUpdateTask = (taskId: number, updatedTask: Omit<Task, "id">) => {
        setTasks(
            tasks.map((task) =>
                task.id === taskId ? { ...task, ...updatedTask } : task
            )
        );
    };

    const handleEditTask = (task: Task) => {
        setTaskForm({
            title: task.title,
            status: task.status,
        });
        setIsEditing(true);
        setEditingTaskId(task.id);
    };

    const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isEditing && editingTaskId !== null) {
            handleUpdateTask(editingTaskId, taskForm);
            setIsEditing(false);
            setEditingTaskId(null);
        } else {
            addTask(taskForm);
        }

        setTaskForm({
            status: "incomplete",
            title: "",
        });
    };

    const handleDeleteTask = (id: number) => {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    };

    const handleDeleteAllTasks = () => {
        setTasks([]);
    };

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === STORAGE_KEY && event.newValue) {
                const newsTasks = JSON.parse(event.newValue);

                if (JSON.stringify(newsTasks) !== JSON.stringify(tasks)) {
                    setTasks(newsTasks);
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [tasks]);

    return (
        <>
            <div>
                <h1>{isEditing ? "Editar tarea" : "Crear tarea"}</h1>

                <form
                    onSubmit={handleOnSubmit}
                    style={{ display: "flex", gap: "1rem", flexDirection: "column" }}
                >
                    <input
                        type="text"
                        placeholder="Título"
                        value={taskForm.title}
                        onChange={(event) =>
                            setTaskForm({ ...taskForm, title: event.target.value })
                        }
                        required
                    />

                    <select
                        onChange={(event) =>
                            setTaskForm({
                                ...taskForm,
                                status: event.target.value as TaskStatus,
                            })
                        }
                        value={taskForm.status}
                    >
                        <option value="done">Done</option>
                        <option value="pending">Pending</option>
                        <option value="incomplete">Incomplete</option>
                    </select>

                    <button type="submit">
                        {isEditing ? "Guardar cambios" : "Crear tarea"}
                    </button>
                </form>
            </div>

            <div className="task-container">
                {tasks.map((task) => {
                    return (
                        <div key={task.id} className="task">
                            <p>{task.title}</p>
                            <p className={`status ${task.status}`}>{task.status}</p>

                            <div
                                style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}
                            >
                                <button onClick={() => handleEditTask(task)}>Editar</button>
                                <button onClick={() => handleDeleteTask(task.id)}>
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={handleDeleteAllTasks}
                style={{ marginTop: "0.5rem" }}
            >
                Eliminar todas las tareas
            </button>
        </>
    );
}

export default App;
