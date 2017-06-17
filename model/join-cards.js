module.exports = function(groups, cardsByGroup) {
  return groups.map(group => {
    const id = group.id;
    let cards = null;
    if (id && cardsByGroup.hasOwnProperty(id)) {
      cards = cardsByGroup[id];
    }
    return Object.assign(group, {cards});
  })
  .filter(group => {
    return !!group.cards
  }); 
}