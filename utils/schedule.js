export function groupBy(data, key) {
  return data.reduce((acc, item) => {
    if (!acc[item[key]]) acc[item[key]] = [];
    acc[item[key]].push(item);
    return acc;
  }, {});
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString();
}
