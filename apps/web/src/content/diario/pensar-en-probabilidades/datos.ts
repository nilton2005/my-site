// Contenido de los paneles opcionales <Dato /> de este subartículo. Cada renglón admite HTML en línea.
// Fuentes: la historia de las tablas hash (Knuth, The Art of Computer Programming, vol. 3), los artículos de
// Bloom (1970) y Karger et al. (1997), las notas de versión de Git 2.11, la documentación de Redis y la guía
// de envío de parches del kernel de Linux.

export const historia = [
  `<strong>1953.</strong> Hans Peter Luhn, en IBM, describe en un memorando interno la idea de repartir claves en «cubetas» con una función: el comienzo de las tablas hash.`,
  `<strong>1970.</strong> Burton Bloom publica el filtro que lleva su nombre: una estructura diminuta que responde «seguro que no está» o «probablemente está». Acepta equivocarse un poco a cambio de ocupar muchísimo menos.`,
  `<strong>1997.</strong> David Karger y su equipo en el MIT presentan el <em>consistent hashing</em>: repartir datos entre servidores de modo que, si se agrega o se cae uno, solo se muevan unos pocos. Al año siguiente nace Akamai sobre esa idea.`,
  `<strong>2016, Git 2.11.</strong> Git deja de usar siempre 7 caracteres para el hash corto: calcula el largo según cuántos objetos tiene el repositorio, para que la probabilidad de un prefijo ambiguo siga siendo baja.`,
];

export const curiosos = [
  `<strong>La paradoja del cumpleaños.</strong> Con 23 personas en una sala, la probabilidad de que dos cumplan años el mismo día ya pasa del 50 %. Con 70, supera el 99,9 %. Es la misma cuenta que la de los hashes cortos.`,
  `El kernel de Linux pide citar commits con <strong>al menos 12 caracteres</strong> del hash: en un repositorio con millones de objetos, 7 ya no alcanzan para que el prefijo sea único.`,
  `Redis no revisa todas las claves para borrar las que vencieron: unas 10 veces por segundo toma <strong>20 claves al azar</strong> con vencimiento y, si más de un 25 % ya venció, repite. Una muestra le dice cuánto falta limpiar.`,
  `Redis puede contar cuántos elementos <strong>distintos</strong> hay (visitantes únicos, por ejemplo) usando unos 12 KB de memoria, con un error típico del 0,81 %: es el algoritmo HyperLogLog, detrás de <code>PFCOUNT</code>.`,
];

export const usos = [
  `<strong>Bases de datos.</strong> Cassandra y RocksDB consultan un filtro de Bloom antes de leer el disco: si dice «seguro que no está», se ahorran la lectura.`,
  `<strong>Datos repartidos.</strong> Cassandra y el diseño Dynamo de Amazon reparten las claves entre nodos con <em>consistent hashing</em>.`,
  `<strong>Observabilidad.</strong> Guardar todas las trazas de un sistema grande sale caro; OpenTelemetry permite quedarse con un porcentaje al azar (por ejemplo, el 1 %) y, con muchas peticiones, esa muestra describe bien al total.`,
  `<strong>Pruebas.</strong> Las pruebas basadas en propiedades (como fast-check en JavaScript) generan cientos de entradas al azar para buscar el caso que rompe tu función, en vez de confiar en tres ejemplos escritos a mano.`,
];
