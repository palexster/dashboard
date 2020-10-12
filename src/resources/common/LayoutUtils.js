export const pruneLayouts = l => {
  Object.keys(l).forEach(br => {
    l[br].forEach(item => {
      delete item.isDraggable;
      delete item.moved;
      delete item.static;
      delete item.isBounded;
      delete item.isResizable;
      delete item.maxH;
      delete item.maxW;
      delete item.minH;
      delete item.minW;
    })
  })
  return l;
}

export const pruneLayout = l => {
  l.forEach(item => {
    item.i = item.i.split('_').slice(0, -1).join('');
    //console.log(item.i.split('_').slice(0, -1).join(''))
    delete item.isDraggable;
    delete item.moved;
    delete item.static;
    delete item.isBounded;
    delete item.isResizable;
    delete item.maxH;
    delete item.maxW;
    delete item.minH;
    delete item.minW;
  })
  return l;
}
