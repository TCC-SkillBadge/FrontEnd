export const selectionSortObject = (array, arrayProperty) => {
    const arrayAux = [...array];
    for(let i = 0; i < arrayAux.length - 1; i++){
        let min = i;
        for(let j = i + 1; j < arrayAux.length; j++){
            if(arrayAux[j][arrayProperty] > arrayAux[min][arrayProperty]){
                min = j;
            }
        }
        if(i !== min){
            let aux = arrayAux[i];
            arrayAux[i] = arrayAux[min];
            arrayAux[min] = aux;
        }
    }
    return arrayAux;
};