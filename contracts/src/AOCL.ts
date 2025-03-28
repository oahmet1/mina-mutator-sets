import {
    Field,
    Struct,
    Poseidon,
    Bool,
    MerkleTree,
    MerkleWitness,
    Provable,
    Circuit
  } from 'o1js';

import { Experimental } from 'o1js';
const { IndexedMerkleMap } = Experimental;

class MerkleMap extends IndexedMerkleMap(8) {}

export class AOCLReturn extends Struct({
    elementIndex: Field,
    commitment: Field,
    randomNumber: Field,
}) {}

export class AOCL extends Struct({
    numElements: Field,
    size: Field,
    commitmentList: Provable.Array(Field, 10)
  }) {
    constructor() {
      super({
        size: Field.from(8),
        numElements: Field.from(0),
        commitmentList: Provable.witness(Provable.Array(Field, 10), () => {
          return Array(10).fill(Field(0));
        })
      });
    }

    add(message: Field, randomNumber : Field): AOCLReturn {
        const commitment = Poseidon.hash([message, randomNumber]);
        const index = this.numElements;

        this.commitmentList = this.commitmentList.map((value, i) =>
          Provable.if(index.equals(Field(i)), commitment, value)
       );
        this.numElements = this.numElements.add(1);

        return new AOCLReturn({ elementIndex: index, commitment: commitment, randomNumber: randomNumber });
    }

    verify(message: Field, index : Field, randomNumber : Field): Bool {

        const commitment = Poseidon.hash([message, randomNumber]);
        const expectedCommitment = this.elementAtIndex(this.commitmentList, index);
        Provable.asProver(() => { 
          console.log("Commitment:", commitment.toString());
          console.log("Expected Commitment:", expectedCommitment.toString()); })

        return commitment.equals(expectedCommitment);
    }

    elementAtIndex(FieldArray: Field[], index: Field): Field {
      const length = FieldArray.length;
      let totalIndex = Field(0);
      let totalValues = Field(0);

      for (let i = 0; i < length; i++) {
        const isIndex = index.equals(i).toField(); // `1` if index matches, otherwise `0`
        const isValue = isIndex.mul(FieldArray[i]); // Multiply to retain only the matching element

        totalValues = totalValues.add(isValue); // Accumulate the value
        totalIndex = totalIndex.add(isIndex);   // Track if exactly one index matched
      }

      // Ensure that exactly one index matched
      const errorMessage = 'Invalid index: Index out of bounds or multiple indices match!';
      totalIndex.assertEquals(1, errorMessage);

      return totalValues;
    }
}
