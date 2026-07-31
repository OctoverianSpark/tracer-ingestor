-- productivity_settings quedo desconectado: el calculo de Productividad se reescribio 100%
-- sobre state_logs (malla horaria) y ya no lee estos pesos de apps para nada. La pagina de
-- Admin > Configuracion > Indices que los editaba se elimino junto con este endpoint/tabla.
DROP TABLE `productivity_settings`;
