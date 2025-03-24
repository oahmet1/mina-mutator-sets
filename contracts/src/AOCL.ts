import {
    Field,
    Struct,
    Poseidon,
    Bool,
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
    commitmentList: MerkleMap,
  }) {
    constructor() {
      super({
        size: Field.from(8),
        numElements: Field.from(1),
        commitmentList: new MerkleMap()
      });
    }

    add(message: Field, randomNumber : Field): AOCLReturn {
        const commitment = Poseidon.hash([message, randomNumber]);
        const index = this.numElements;

        let smokeMerkleMap = new MerkleMap();
        smokeMerkleMap.insert(index, commitment);
        
        let commList : MerkleMap = this.commitmentList
        commList.insert(index, commitment); // This line fails
        this.numElements = this.numElements.add(1);

        return new AOCLReturn({ elementIndex: index, commitment, randomNumber: randomNumber });
    }

    verify(message: Field, index : Field, randomNumber : Field): Bool {

        const commitment = Poseidon.hash([message, randomNumber]);
        const expectedCommitment = this.commitmentList.getOption(index).orElse(Field(0));
        
        return commitment.equals(expectedCommitment);
    }

}