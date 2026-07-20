-- agent_preferences: preferencias generales del agente de escritorio, configurables por grupo
-- (ej. apagado automatico al finalizar la jornada). Un solo campo JSON en vez de una columna por
-- ajuste: agregar una preferencia nueva no requiere una migracion nueva, solo se resuelve con
-- defaults en el backend (ver src/types/agent-preferences.ts). NULL = ningun grupo existente
-- pierde configuracion; se resuelve como "todo en default" (auto_shutdown_enabled: false).
ALTER TABLE `groups` ADD COLUMN `agent_preferences` JSON NULL;
