import { getTableFields } from '../extraction/getSqlServerFields.js';
import { getMysqlTableFields } from '../extraction/getMysqlFields.js';

export async function compareFields(tableName) {
    const sqlFields = await getTableFields(tableName);
    const mysqlFields = await getMysqlTableFields(tableName);

    //filter and compare
    const sameFields = mysqlFields.filter( fieldName =>  {
        const mysqlFieldsInLowerCase = fieldName.COLUMN_NAME.toLowerCase();
        return sqlFields.some(columnName => columnName.COLUMN_NAME.toLowerCase() === mysqlFieldsInLowerCase);
    });

    console.log(sameFields);
    return sameFields;

}
// compareFields().catch(err => console.error(err));
