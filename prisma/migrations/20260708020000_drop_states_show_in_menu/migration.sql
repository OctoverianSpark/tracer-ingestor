-- states.show_in_menu queda reemplazado por group_state_visibility: la visibilidad del menu del
-- agente ahora se decide por grupo (ver 20260708010000_group_state_visibility), no con un flag
-- global por estado. Al momento de este drop, 3 estados del catalogo default tenian
-- show_in_menu=false (Almuerzo, Inactivo, Desconectado) — si se quiere ocultarlos para algun
-- grupo puntual, hay que crear la fila correspondiente en group_state_visibility.
ALTER TABLE `states` DROP COLUMN `show_in_menu`;
