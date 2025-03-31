import {
    Field,
    Struct,
    Poseidon,
    Bool,
    Provable,
  } from 'o1js';
import { elementAtIndex } from './utils';

const MAX_ELEMENTS = 16; //1024;

export class AOCLReturn extends Struct({
    elementIndex: Field,
    commitment: Field,
    randomNumber: Field,
}) {}

export class AOCL extends Struct({
    numElements: Field,
    size: Field,
    commitmentList: Provable.Array(Field, MAX_ELEMENTS)
  }) {
    constructor() {
      super({
        size: Field(MAX_ELEMENTS),
        numElements: Field(0),
        commitmentList: Array(MAX_ELEMENTS).fill(Field(0))
      });
    }

    add(message: Field, randomNumber : Field): AOCLReturn {
        const commitment = Poseidon.hash([message, randomNumber]);
        const index = this.numElements;

        // Assign the new commitment to the appropriate index
        this.commitmentList = this.commitmentList.map((value, i) =>
          Provable.if(index.equals(Field(i)), commitment, value)
       );

        this.numElements = this.numElements.add(1);

        return new AOCLReturn({ elementIndex: index, commitment: commitment, randomNumber: randomNumber });
    }

    verify(message: Field, index : Field, randomNumber : Field): Bool {

        const commitment = Poseidon.hash([message, randomNumber]);
        const expectedCommitment = elementAtIndex(this.commitmentList, index);
        /*Provable.asProver(() => { 
          console.log("Commitment:", commitment.toString());
          console.log("Expected Commitment:", expectedCommitment.toString()); })
*/
        return commitment.equals(expectedCommitment);
    }

    
}
