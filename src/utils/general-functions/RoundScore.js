export const roundScore = (score) => {
    const aux = Math.floor(score);
    if(score - aux >= 0.75){
        return aux + 1;
    }
    else if(score - aux <= 0.25){
        return aux;
    }
    else return aux + 0.5;
};