import Skill from './Skill';
import Robot, { RobotIntentData } from '../model/Robot';
import PersistenceManager from './PersistenceManager';

export type Joke = {
    id: string;
    name: string;
    prompt: string;
}

export default class JokeSkill extends Skill {

    public jokeMap: Map<string, Joke> = new Map<string, Joke>();
    public jokeIterator: Iterator<Joke> = this.jokeMap.values();

    constructor(robot: Robot) {
        super(robot, 'JokeSkill', 'launchJoke');
        console.log(`JokeSkill: constructor: ${robot.serialName}`);
        this.initJokes();
    }

    initJokes(): void {
        let jokeData: any = [
            {id: "001", name: "sleevies", prompt: "Where does the General keep his armies? <anim name='Thinking_01' /> In his sleevies!"},
            {id: "002", name: "chicken", prompt: "Why did the chicken cross the road? <anim name='Thinking_01' /> To get to the other side."},
            {id: "003", name: "elephant", prompt: "You know why you never see elephants hiding up in trees? <anim name='Thinking_01' /> Because they’re really good at it."},
            {id: "004", name: "paint", prompt: "What is red and smells like blue paint? <anim name='Thinking_01' /> Red paint."}
        ];

        jokeData.forEach((joke: any) => {
            this.jokeMap.set(joke.id, joke)
        });

        this.jokeIterator = this.jokeMap.values();
    }



    launch(data: RobotIntentData) :void {
        if (this.robot) {
            console.log(`JokeSkill: launch: ${this.robot.serialName}`);
            let joke: Joke = this.jokeIterator.next().value;
            if (!joke) {
                this.jokeIterator = this.jokeMap.values();
                joke = this.jokeIterator.next().value;
            }
            let jokePrompt: string = joke.prompt;
            if (this.robot.requester) {
                // let p = this.robot.requester.play.say(jokePrompt).complete;
                let p = this.robot.requester.expression.say(jokePrompt).complete;
                p.then( () => {
                    // console.log(`JokeSkill: launch: done`);
                    this.running = false;
                    if (this.robot) {
                        let launchId: string = 'na';
                        if (data && data.launchId) {
                            launchId = data.launchId;
                        }
                        PersistenceManager.Instance.persistJoke(this.robot, joke, launchId);
                    }
                })
                .catch((result: any) => {
                    if (this.robot) {
                        this.robot.updateRobotStatusMessages(JSON.stringify(result, null, 2));
                    }
                })
            }
        } else {
            console.log(`JokeSkill: launch: error: robot is undefined`);
        }

    }

    tick(frameTime: number, elapsedTime: number): void {

    }
}
