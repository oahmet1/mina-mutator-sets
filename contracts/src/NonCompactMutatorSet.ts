import {
    Field,
    SmartContract,
    UInt64,
    Struct,
    Poseidon,
    state,
    State,
    method,
    Circuit,
    Bool,
    Provable,
  } from 'o1js';
  

const MAX_ELEMENTS = 1; // 2,097,151 = 2^(h+1)-1   max_height=20
/**
 * Proof structure for inclusion proofs.
 */
export class AOCLWitness extends Struct({
    elementIndex: UInt64,
    message: Field,
    randomNumber: Field,
}) {}

export class AOCL extends Struct({
    numElements: UInt64,
    commitmentList: [Field, MAX_ELEMENTS]
  }) {
    constructor() {
      super({
        numElements: UInt64.zero,
        commitmentList: Array(MAX_ELEMENTS).fill(Field(0))
      });
    }

    add(message: Field): AOCLWitness {
        const random_num = Field.random();
        const commitment = Poseidon.hash([message, random_num]);

        const index = this.numElements;
        
        this.commitmentList[Number(index)] = commitment;
        this.numElements = this.numElements.add(UInt64.one);

        return new AOCLWitness({ elementIndex: index, message, randomNumber: random_num });
    }

    verify(witness: AOCLWitness): Bool {
        const index = Number(witness.elementIndex);

        const commitment = this.commitmentList[index];
        const expectedCommitment = Poseidon.hash([witness.message, witness.randomNumber]);
        
        return commitment.equals(expectedCommitment);
    }

}

export class 
