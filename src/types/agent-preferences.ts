export interface AgentPreferences {
  auto_shutdown_enabled: boolean
}

export const DEFAULT_AGENT_PREFERENCES: AgentPreferences = {
  auto_shutdown_enabled: false,
}

/** Groups pre-existentes tienen `agent_preferences: null`; se resuelve como "todo en default". */
export function resolveAgentPreferences(stored: unknown): AgentPreferences {
  return {
    ...DEFAULT_AGENT_PREFERENCES,
    ...(stored && typeof stored === "object" ? (stored as Partial<AgentPreferences>) : {}),
  };
}
