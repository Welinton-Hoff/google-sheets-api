function getTableRow(rows, paramID) {
  let rowIndex = 0;
  // const bodyID = paramID.ID;

  for (let index = 0; index < rows.length; index++) {
    const element = rows[index];

    if (String(element[0]) === paramID) {
      rowIndex = index;
      break;
    }
  }

  return rowIndex;
}

exports.getTableRow = getTableRow;
