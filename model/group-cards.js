// Reduce array `spreadsheet.data` to an object using each element's `group` as key.
// Recategorize each element under this key.
/**
 * @param {Object[]} data - Each item is a spreadsheet row
 * @param {Object[]} numbers
 */
module.exports = function (data, numbers) {

  return data.reduce((o, row) => {
    // Use the `bignum-name` as key to search autograph data
    const bignumName = row['bignum-name'];
    const shortName = row['short-name'];
    const annualName = row['annual-name'];

    // If `big-number` exists, use it directly, else search in autograph data.
    if (typeof row['big-number'] === 'number') {
      row.bigNum = {
        value: row['big-number'],
        unit: row['bignum-units']
      }
    } else if (bignumName && numbers[bignumName]) {
      row.bigNum = numbers[bignumName];
    }

    if (typeof row['short-change'] === 'number') {
      row.shortNum = {
        value: row['short-change'],
        unit: row.units
      }
    } else if (shortName && numbers[shortName]) {
      row.shortNum = numbers[shortName];
    }

    if (typeof row['annual-change'] === 'number') {
      row.annualNum = {
        value: row['annual-change'],
        unit: row.units
      }
    } else if (annualName && numbers[annualName]) {
      row.annualNum = numbers[annualName];
    }

    const id = row.group;
    if (o[id]) {
      o[id].push(row)
    } else {
      o[id] = [row];
    }

    return o;
  }, {});
};