import animals from './animals.json';

function getRandomItem(list: any[]){
  return list[Math.floor(Math.random() * list.length)];
}

export class Quest {
  public static getQuest() {
    return getRandomItem(animals)["es"];
  }
}