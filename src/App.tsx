/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  Circle, 
  Bell, 
  X, 
  Calendar,
  AlertCircle,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  dueDate?: string;
}

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputText, setInputText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Persistence
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Notification helper
  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // CRUD Operations
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      addNotification('할일 내용을 입력해주세요.', 'error');
      return;
    }
    const newTodo: Todo = {
      id: Math.random().toString(36).substring(2, 9),
      text: inputText,
      completed: false,
      createdAt: Date.now(),
      dueDate: dueDate || undefined
    };
    setTodos([newTodo, ...todos]);
    setInputText('');
    setDueDate('');
    addNotification('할일이 등록되었습니다.', 'success');
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
    addNotification('할일이 삭제되었습니다.', 'info');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
    const todo = todos.find(t => t.id === id);
    if (todo && !todo.completed) {
      addNotification('할일을 완료했습니다!', 'success');
    }
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (!editText.trim()) {
      addNotification('내용을 입력해주세요.', 'error');
      return;
    }
    setTodos(todos.map(todo => 
      todo.id === editingId ? { ...todo, text: editText } : todo
    ));
    setEditingId(null);
    addNotification('수정되었습니다.', 'success');
  };

  // Search and Filter
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = 
        filter === 'all' ? true :
        filter === 'active' ? !todo.completed :
        todo.completed;
      return matchesSearch && matchesFilter;
    });
  }, [todos, searchQuery, filter]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">할일 관리</h1>
            <p className="text-slate-500 mt-1">오늘의 할일을 체계적으로 관리하세요.</p>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
            <Bell className="w-6 h-6 text-slate-400" />
          </div>
        </header>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="할일 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>

        {/* Add Todo Form */}
        <form onSubmit={addTodo} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8">
          <div className="space-y-4">
            <div className="relative">
              <input 
                type="text"
                placeholder="어떤 일을 하실 건가요?"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full text-lg font-medium placeholder:text-slate-300 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <Calendar className="w-4 h-4" />
                <input 
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-transparent text-sm focus:outline-none"
                />
              </div>
              <button 
                type="submit"
                className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200"
              >
                <Plus className="w-5 h-5" />
                추가하기
              </button>
            </div>
          </div>
        </form>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 bg-slate-200/50 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            전체
          </button>
          <button 
            onClick={() => setFilter('active')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === 'active' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            진행 중
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === 'completed' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            완료됨
          </button>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredTodos.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md ${todo.completed ? 'bg-slate-50/50' : ''}`}
              >
                <button 
                  onClick={() => toggleTodo(todo.id)}
                  className={`flex-shrink-0 transition-colors ${todo.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-400'}`}
                >
                  {todo.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>

                <div className="flex-grow min-w-0">
                  {editingId === todo.id ? (
                    <div className="flex items-center gap-2">
                      <input 
                        autoFocus
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <button onClick={saveEdit} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
                        <Check className="w-5 h-5" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className={`text-base font-medium truncate ${todo.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {todo.text}
                      </p>
                      {todo.dueDate && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>{todo.dueDate}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => startEdit(todo)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteTodo(todo.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredTodos.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500">할일이 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* Notifications Toast */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 min-w-[240px] border ${
                n.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                n.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                'bg-white border-slate-200 text-slate-800'
              }`}
            >
              {n.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> :
               n.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-500" /> :
               <Bell className="w-5 h-5 text-indigo-500" />}
              <span className="text-sm font-medium">{n.message}</span>
              <button 
                onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
                className="ml-auto p-1 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 opacity-50" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
