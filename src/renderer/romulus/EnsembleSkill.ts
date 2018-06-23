import Hub from './Hub';
import Skill from './Skill';
// import Robot from '../model/Robot';

export default abstract class EnsembleSkill extends Skill {

    public hubMap: Map<string, Hub>;

    protected constructor(id: string, launchIntent: string) {
        super (undefined, id, launchIntent);
        this.hubMap = new Map<string, Hub>();
    }

    addHub(hub: Hub): void {
        this.hubMap.set(hub.robotSerialName, hub);
    }

    getShuffledArrayOfHubs(): any[] {
        return this.shuffleInPlace(Array.from( this.hubMap.values()));
    }

    shuffleInPlace<T>(array: T[]): T[] {
        if (array.length <= 1) return array;
        for (let i = 0; i < array.length; i++) {
            const randomChoiceIndex = this.getRandomInt(i, array.length - 1);
            [array[i], array[randomChoiceIndex]] = [array[randomChoiceIndex], array[i]];
        }

        return array;
    }

    getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }

}
