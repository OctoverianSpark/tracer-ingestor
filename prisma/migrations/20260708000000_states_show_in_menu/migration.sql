-- states.show_in_menu: si es false, el agente no lo lista como opcion elegible en el menu del tray.
-- El estado sigue existiendo en el catalogo (puede seguir llegando por otra via, automatica o API).
-- Default true para que las filas existentes no desaparezcan del menu de nadie de golpe.
ALTER TABLE `states` ADD COLUMN `show_in_menu` BOOLEAN NOT NULL DEFAULT true;
