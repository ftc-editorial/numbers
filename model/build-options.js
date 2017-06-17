module.exports = function(options) {
  return options.reduce((o, row) => {
    o[row.name] = {
      text: row.value,
      html: row.html || row.value
    };
    return o;
  }, {});
}