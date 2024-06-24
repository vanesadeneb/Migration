
export const procesados = (id, detalle, estatus) => {
    //query a insertar en procesados
    const query = `INSERT INTO procesados (id, fecha, detalle, estatus) VALUES ( ${id}, ${GETDATE()}, ${detalle}, ${estatus} )`;
}
