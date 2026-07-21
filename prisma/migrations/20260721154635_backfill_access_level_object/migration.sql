-- roles.access_level quedo guardado como STRING JSON (doble-codificado) para las filas creadas
-- via el RoleForm del dashboard antes de arreglar el bug de doble JSON.stringify. Reparsea esas
-- filas a objeto real; no toca las que ya son objeto (JSON_TYPE != 'STRING').
UPDATE `roles`
SET `access_level` = CAST(JSON_UNQUOTE(`access_level`) AS JSON)
WHERE JSON_TYPE(`access_level`) = 'STRING';
