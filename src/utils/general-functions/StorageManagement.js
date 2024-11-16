
const SessionStorageChange = new Event('sessionStorageChange');

export const customSessionStorageSetItem = (key, value) => {
    const oldValue = sessionStorage.getItem(key);

};