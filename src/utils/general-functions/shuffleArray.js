export const shuffleArray = (array) => {
    let arrayAux = [...array];
    let currentIndex = arrayAux.length, temporaryValue, randomIndex;
  
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      temporaryValue = arrayAux[currentIndex];
      arrayAux[currentIndex] = arrayAux[randomIndex];
      arrayAux[randomIndex] = temporaryValue;
    }
  
    return arrayAux;
};