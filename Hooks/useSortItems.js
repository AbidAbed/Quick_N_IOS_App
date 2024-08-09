function useSortItems(sortKey) {
  return (a, b) => {
    var nameA = a[sortKey]?.toUpperCase(); // convert to uppercase for case-insensitive comparison
    var nameB = b[sortKey]?.toUpperCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0; // names are equal
  };
}
export default useSortItems;
