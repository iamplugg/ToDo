import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  AsyncStorage,
} from 'react-native';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState('');
  const [editedTaskDescription, setEditedTaskDescription] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const tasks = await AsyncStorage.getItem('tasks');
      if (tasks !== null) {
        setTasks(JSON.parse(tasks));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const saveTasks = async (updatedTasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    } catch (error) {
      console.log(error);
    }
  };

  const addTask = () => {
    if (newTask.trim() !== '') {
      const newTaskData = {
        id: Date.now(),
        title: newTask,
        description: newTaskDescription,
        completed: false,
      };
      const updatedTasks = [...tasks, newTaskData];
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      setNewTask('');
      setNewTaskDescription('');
    }
  };

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const startEditingTask = (taskId, title, description) => {
    setEditingTaskId(taskId);
    setEditedTaskTitle(title);
    setEditedTaskDescription(description);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditedTaskTitle('');
    setEditedTaskDescription('');
  };

  const saveEditedTask = () => {
    const updatedTasks = tasks.map((task) =>
      task.id === editingTaskId
        ? {
            ...task,
            title: editedTaskTitle,
            description: editedTaskDescription,
          }
        : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setEditingTaskId(null);
    setEditedTaskTitle('');
    setEditedTaskDescription('');
  };

  const renderTask = ({ item }) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() =>
        editingTaskId === item.id
          ? saveEditedTask()
          : startEditingTask(item.id, item.title, item.description)
      }
      onLongPress={() => deleteTask(item.id)}
    >
      {editingTaskId === item.id ? (
        <View>
          <TextInput
            style={[styles.input, styles.editInput]}
            value={editedTaskTitle}
            onChangeText={(text) => setEditedTaskTitle(text)}
          />
          <TextInput
            style={[styles.input, styles.editInput]}
            value={editedTaskDescription}
            onChangeText={(text) => setEditedTaskDescription(text)}
          />
          <TouchableOpacity
            style={styles.editButton}
            onPress={saveEditedTask}
          >
            <Text style={styles.editButtonText}>Сохранить</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton} onPress={cancelEditing}>
            <Text style={styles.editButtonText}>Отмена</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)}>
            <Text
              style={[
                styles.taskTitle,
                item.completed && styles.completedTaskTitle,
              ]}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
          <Text>{item.description}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyTasks = () => (
    <View style={styles.emptyTasksContainer}>
      <Text style={styles.emptyTasksText}>Нет запланированных задач</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Введите задачу"
          placeholderTextColor="#a8a8a8"
          value={newTask}
          onChangeText={(text) => setNewTask(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Введите описание"
          placeholderTextColor="#a8a8a8"
          value={newTaskDescription}
          onChangeText={(text) => setNewTaskDescription(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>Добавить</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tasksContainer}>
        <Text style={styles.tasksHeading}>Текущие задачи</Text>
        {tasks.length === 0 ? (
          renderEmptyTasks()
        ) : (
          <FlatList
            data={tasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id.toString()}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    fontFamily: 'Arial',
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: 'blue',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tasksContainer: {
    flex: 1,
  },
  tasksHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  taskItem: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  taskTitle: {
    fontWeight: 'bold',
    textDecorationLine: 'none',
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
  },
  emptyTasksContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTasksText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  editInput: {
    marginBottom: 5,
  },
  editButton: {
    backgroundColor: '#ccc',
    padding: 8,
    alignItems: 'center',
    borderRadius: 3,
    marginTop: 5,
  },
  editButtonText: {
    fontWeight: 'bold',
  },
});

export default App;
