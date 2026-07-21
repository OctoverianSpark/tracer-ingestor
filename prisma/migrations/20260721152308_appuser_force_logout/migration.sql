-- force_logout_at: marca de revocacion de sesion. El dashboard usa JWT sin estado (NextAuth,
-- sin adapter/tabla de sesiones), asi que esta es la unica forma de invalidar una sesion ya
-- emitida: el middleware compara este valor contra el que quedo "congelado" en el JWT al login.
ALTER TABLE `appuser` ADD COLUMN `force_logout_at` DATETIME(0) NULL;
