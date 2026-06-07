/**
 * formatea un string (`value`) a numero.
 * 
 * ejemplo: "1.000.000" -> "1000000"
 * 
 * - `value` - el string a formatear.
 * - retorna el string como numero.
 * 
 */
export const parseMoneyNumber = (value) => (value !== undefined || value !== null) && Number(String(value).replace(/\D/g, ''));

/**
 * formatea un numero (`value`) a un formato string.
 * 
 * ejemplo: "1000000" -> "1.000.000".
 * 
 * - `value` - el valor (numero) a formatear.
 * - retorna el valor formateado.
 */
export const parseMoneyString = (value) => (value !== undefined || value !== null) && String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/**
 * formatea un numero (`value`) a un formato string bonito (xD).
 * 
 * ejemplo: "1000000" -> "CLP 1.000.000".
 * 
 * - `value` - el valor (numero) a formatear.
 * - retorna el valor formateado.
 * 
 */
export const parseMoneyStringMoney = (value) => (value !== undefined || value !== null) && '$ ' + parseMoneyString(value);

/**
 * formatea un rut, para que tenga el formato correcto.
 * 
 * ejemplo: "11111111" -> "1.111.111-1"
 * 
 * - rut - el rut a formatear.
 * - retorna el rut formateado.
 */
export const parseRut = (rut) => {
    if (rut.length < 2) return rut;
    if (rut.length > 12) return rut.slice(0, 12);
    let rutLimpio =  rut.replace(/[^0-9kK]/g, '').toUpperCase();

    let cuerpo = rutLimpio.slice(0, -1);
    let dv = rutLimpio.slice(-1);

    let aux = '';
    let i = 0;
    for (let pos = cuerpo.length - 1; pos >= 0; pos--) {
        aux = cuerpo[pos] + aux;
        i++;
        if (i % 3 === 0 && pos !== 0) {
            aux = '.' + aux;
        }
    }
    return aux + '-' + dv;
}

export const parseDateString = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString();
};

export const parseTimestampString = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString();
};