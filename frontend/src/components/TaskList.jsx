import React, { useState, useEffect } from 'react';
import { getTasks, createTask, deleteTask, updateTask } from '../api';

function TaskList({ token }) {
  // State to hold the list of tasks retrieved from the backend
  const [tasks, setTasks] = useState([]);
  
  // State for the input field value when creating a new task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  // States to track which task is currently being edited and its new title
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Fetch all tasks for the logged-in user from the API
  const fetchTasks = () => {
    getTasks(token)
      .then((response) => setTasks(response.data))
      .catch((error) => console.error('Error fetching tasks:', error));
  };

  // Run fetchTasks when the component mounts or when the token changes
  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  // Handle adding a new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await createTask(newTaskTitle, token);
      setNewTaskTitle(''); // Clear input field after successful creation
      fetchTasks(); // Refresh the list from backend
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  // Handle deleting a task by ID
  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId, token);
      fetchTasks(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // 1. Handle toggling task status (Done / Undone Checkbox)
  const handleToggleTask = async (task) => {
    try {
      await updateTask(task.id, task.title, !task.done, token);
      fetchTasks(); // Refresh list to reflect updated status
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Enable edit mode for a specific task
  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  // 2. Handle saving an updated title (e.g., "aaa" -> "aaa2")
  const handleSaveTitle = async (task) => {
    try {
      await updateTask(task.id, editingTitle, task.done, token);
      setEditingTaskId(null); // Exit edit mode
      fetchTasks(); // Refresh list to show new title
    } catch (error) {
      console.error('Error updating task title:', error);
    }
  };

  return (
    <div>
      <h2>Tasks</h2>

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="New task title..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>

      {/* Tasks List */}
      <ul>
        {tasks.map((task) => (
          <li key={task.id} style={{ marginBottom: '8px' }}>
            {/* Status Checkbox */}
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => handleToggleTask(task)}
              style={{ marginRight: '8px' }}
            />

            {/* Conditional Rendering: Show Input field if editing, else show title text */}
            {editingTaskId === task.id ? (
              <>
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                <button onClick={() => handleSaveTitle(task)}>Save</button>
                <button onClick={() => setEditingTaskId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span
                  className="task-title"
                  style={{
                    textDecoration: task.done ? 'line-through' : 'none',
                  }}
                >
                  {task.title}
                </span>
                <button onClick={() => startEditing(task)} style={{ marginRight: '4px' }}>
                  Edit
                </button>
                <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;