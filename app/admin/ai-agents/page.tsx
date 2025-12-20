"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AITask } from "@/lib/supabase/types";

interface Agent {
  type: 'content_creator' | 'signal_analyst' | 'social_manager' | 'course_builder' | 'support_agent';
  name: string;
  description: string;
  icon: string;
  capabilities: string[];
}

const AGENT_CONFIGS: Agent[] = [
  {
    type: "content_creator",
    name: "Content Creator",
    description: "Writes blog posts, articles, and educational content about crypto trading.",
    icon: "✍️",
    capabilities: ["Blog posts", "Articles", "Newsletters", "Market summaries"],
  },
  {
    type: "signal_analyst",
    name: "Signal Analyst",
    description: "Analyzes market data and suggests potential trading signals.",
    icon: "📊",
    capabilities: ["Technical analysis", "Pattern recognition", "Risk assessment", "Entry/exit points"],
  },
  {
    type: "social_manager",
    name: "Social Media Manager",
    description: "Creates and schedules social media content across platforms.",
    icon: "📱",
    capabilities: ["Twitter/X posts", "Instagram content", "Community engagement", "Trend monitoring"],
  },
  {
    type: "course_builder",
    name: "Course Builder",
    description: "Creates educational course content and learning materials.",
    icon: "🎓",
    capabilities: ["Course outlines", "Lesson scripts", "Quiz questions", "Video scripts"],
  },
  {
    type: "support_agent",
    name: "Support Agent",
    description: "Handles user inquiries and provides automated support responses.",
    icon: "💬",
    capabilities: ["FAQ responses", "Ticket triage", "User onboarding", "Issue escalation"],
  },
];

interface AgentWithTasks extends Agent {
  tasks: AITask[];
  tasksCompleted: number;
  lastTask: string | null;
  status: "active" | "idle" | "paused";
}

export default function AIAgentsPage() {
  const supabase = createClient();
  const [agents, setAgents] = useState<AgentWithTasks[]>([]);
  const [selectedAgentType, setSelectedAgentType] = useState<string>("");
  const [taskInput, setTaskInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedAgentForSettings, setSelectedAgentForSettings] = useState<AgentWithTasks | null>(null);
  const [recentActivity, setRecentActivity] = useState<AITask[]>([]);

  const loadAgents = async () => {
    try {
      setLoading(true);

      // Fetch all AI tasks
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: tasks, error } = await (supabase.from('ai_tasks') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Aggregate tasks by agent type
      const agentMap = new Map<string, AITask[]>();
      tasks?.forEach((task: AITask) => {
        const existing = agentMap.get(task.agent_type) || [];
        agentMap.set(task.agent_type, [...existing, task]);
      });

      // Build agent list with task data
      const agentsWithTasks: AgentWithTasks[] = AGENT_CONFIGS.map(config => {
        const agentTasks = agentMap.get(config.type) || [];
        const completedTasks = agentTasks.filter(t => t.status === 'completed');
        const activeTasks = agentTasks.filter(t => t.status === 'in_progress');
        const lastTaskObj = agentTasks[0];

        let status: "active" | "idle" | "paused" = "idle";
        if (activeTasks.length > 0) {
          status = "active";
        } else if (agentTasks.length === 0) {
          status = "idle";
        }

        return {
          ...config,
          tasks: agentTasks,
          tasksCompleted: completedTasks.length,
          lastTask: lastTaskObj?.task_description || null,
          status,
        };
      });

      setAgents(agentsWithTasks);

      // Set recent activity (last 5 tasks)
      setRecentActivity(tasks?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();

    // Set up real-time subscription
    const channel = supabase
      .channel('ai-tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_tasks',
        },
        (payload) => {
          console.log('AI task updated:', payload);
          loadAgents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddAgent = () => {
    setShowAddAgentModal(true);
  };

  const handlePauseResume = async (agent: AgentWithTasks) => {
    // For now, pausing means setting all in_progress tasks to pending
    // Resuming means starting the first pending task
    try {
      const activeTasks = agent.tasks.filter(t => t.status === 'in_progress');

      if (agent.status === 'active') {
        // Pause all active tasks
        for (const task of activeTasks) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('ai_tasks') as any)
            .update({ status: 'pending' })
            .eq('id', task.id);
        }
      } else {
        // Resume: start first pending task
        const pendingTask = agent.tasks.find(t => t.status === 'pending');
        if (pendingTask) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('ai_tasks') as any)
            .update({ status: 'in_progress' })
            .eq('id', pendingTask.id);
        }
      }

      loadAgents();
    } catch (error) {
      console.error('Error toggling agent status:', error);
    }
  };

  const handleSettings = (agent: AgentWithTasks) => {
    setSelectedAgentForSettings(agent);
    setShowSettingsModal(true);
  };

  const handleAssignTask = async () => {
    if (!selectedAgentType || !taskInput.trim()) {
      alert('Please select an agent and enter a task description');
      return;
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('You must be logged in to assign tasks');
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('ai_tasks') as any)
        .insert({
          agent_type: selectedAgentType,
          task_description: taskInput,
          status: 'pending',
          created_by: user.id,
        });

      if (error) throw error;

      setTaskInput("");
      setSelectedAgentType("");
      loadAgents();
    } catch (error) {
      console.error('Error assigning task:', error);
      alert('Failed to assign task. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "idle": return "bg-yellow-500";
      case "paused": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in_progress": return "bg-blue-500";
      case "pending": return "bg-yellow-500";
      case "failed": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getAgentConfig = (type: string) => {
    return AGENT_CONFIGS.find(a => a.type === type);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading agents...</div>
      </div>
    );
  }

  const totalTasks = agents.reduce((sum, a) => sum + a.tasks.length, 0);
  const tasksToday = recentActivity.filter(task => {
    const today = new Date();
    const taskDate = new Date(task.created_at);
    return taskDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">AI Agent Team</h2>
          <p className="text-gray-500">Manage your AI workforce that automates content, signals, and social media.</p>
        </div>
        <button
          onClick={handleAddAgent}
          className="bg-cyan-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-cyan-400 transition"
        >
          + Add Agent
        </button>
      </div>

      {/* Agent Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Agents", value: agents.filter(a => a.status === "active").length, textClass: "text-green-400" },
          { label: "Idle Agents", value: agents.filter(a => a.status === "idle").length, textClass: "text-yellow-400" },
          { label: "Tasks Today", value: tasksToday, textClass: "text-cyan-400" },
          { label: "Total Tasks", value: totalTasks.toLocaleString(), textClass: "text-purple-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className={`text-2xl font-bold ${stat.textClass} mb-1`}>{stat.value}</div>
            <div className="text-gray-500 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Agents Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.type}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-2xl">
                  {agent.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{agent.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                    <span className="text-gray-500 text-sm capitalize">{agent.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePauseResume(agent);
                  }}
                  title={agent.status === "active" ? "Pause agent" : "Resume agent"}
                >
                  {agent.status === "active" ? "⏸️" : "▶️"}
                </button>
                <button
                  className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSettings(agent);
                  }}
                  title="Agent settings"
                >
                  ⚙️
                </button>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-4">{agent.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {agent.capabilities.map((cap, i) => (
                <span key={i} className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                  {cap}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
              <div className="text-sm">
                <span className="text-gray-500">Last: </span>
                <span className="text-gray-400">{agent.lastTask || 'No tasks yet'}</span>
              </div>
              <div className="text-cyan-400 font-semibold text-sm">
                {agent.tasksCompleted} completed
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Task Assignment Panel */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Assign New Task</h3>
        <div className="flex gap-4">
          <select
            value={selectedAgentType}
            onChange={(e) => setSelectedAgentType(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="">Select an agent...</option>
            {AGENT_CONFIGS.map((agent) => (
              <option key={agent.type} value={agent.type}>
                {agent.icon} {agent.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Describe the task..."
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAssignTask();
              }
            }}
            className="flex-[2] bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
          />
          <button
            onClick={handleAssignTask}
            className="bg-cyan-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-cyan-400 transition whitespace-nowrap"
          >
            Assign Task
          </button>
        </div>

        {/* Quick Task Templates */}
        <div className="mt-4">
          <span className="text-gray-500 text-sm">Quick tasks: </span>
          {[
            "Write a market update",
            "Analyze BTC chart",
            "Schedule social posts",
            "Create course lesson",
          ].map((task, i) => (
            <button
              key={i}
              onClick={() => setTaskInput(task)}
              className="text-cyan-400 text-sm hover:underline mx-2"
            >
              {task}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Agent Activity</h3>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((task) => {
              const agentConfig = getAgentConfig(task.agent_type);
              const timeAgo = getTimeAgo(task.created_at);

              return (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${getTaskStatusColor(task.status)}`} />
                    <div>
                      <span className="text-cyan-400 font-medium">{agentConfig?.name || task.agent_type}</span>
                      <span className="text-gray-400"> - </span>
                      <span className="text-white">{task.task_description}</span>
                      <div className="text-xs text-gray-500 mt-1">
                        Status: <span className="capitalize">{task.status.replace('_', ' ')}</span>
                        {task.completed_at && ` • Completed ${getTimeAgo(task.completed_at)}`}
                      </div>
                    </div>
                  </div>
                  <span className="text-gray-600 text-sm">{timeAgo}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent activity. Assign tasks to your AI agents to get started.
          </div>
        )}
      </div>

      {/* Add Agent Modal */}
      {showAddAgentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddAgentModal(false)}>
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">Add New Agent Task</h3>
            <p className="text-gray-400 mb-4">
              Select an agent type and describe the task you want to assign.
            </p>
            <select
              value={selectedAgentType}
              onChange={(e) => setSelectedAgentType(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white mb-4 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Select an agent...</option>
              {AGENT_CONFIGS.map((agent) => (
                <option key={agent.type} value={agent.type}>
                  {agent.icon} {agent.name}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Describe the task..."
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddAgentModal(false)}
                className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleAssignTask();
                  setShowAddAgentModal(false);
                }}
                className="flex-1 bg-cyan-500 text-black px-4 py-3 rounded-lg font-semibold hover:bg-cyan-400 transition"
              >
                Assign Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && selectedAgentForSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSettingsModal(false)}>
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full mx-4 border border-gray-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-2xl">
                {selectedAgentForSettings.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedAgentForSettings.name} Settings</h3>
                <p className="text-gray-400 text-sm">{selectedAgentForSettings.description}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-white font-semibold mb-2">Task Statistics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Total Tasks</div>
                    <div className="text-white text-xl font-bold">{selectedAgentForSettings.tasks.length}</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Completed</div>
                    <div className="text-green-400 text-xl font-bold">{selectedAgentForSettings.tasksCompleted}</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">In Progress</div>
                    <div className="text-blue-400 text-xl font-bold">
                      {selectedAgentForSettings.tasks.filter(t => t.status === 'in_progress').length}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Recent Tasks</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedAgentForSettings.tasks.slice(0, 10).map((task) => (
                    <div key={task.id} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm">{task.task_description}</span>
                        <div className={`w-2 h-2 rounded-full ${getTaskStatusColor(task.status)}`} />
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(task.created_at).toLocaleString()} • {task.status.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                  {selectedAgentForSettings.tasks.length === 0 && (
                    <div className="text-gray-500 text-sm text-center py-4">No tasks yet</div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
