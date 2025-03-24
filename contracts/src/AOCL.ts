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
import { prop } from 'o1js/dist/node/lib/provable/types/circuit-value';

import { CircuitValue, arrayProp } from 'o1js/src/lib/provable/types/circuit-value';
export {AOCL};


const MAX_ELEMENTS = UInt64.from(100);

export class AOCLWitness extends Struct({
    elementIndex: UInt64,
    message: Field,
    randomNumber: Field,
}) {}

export class AOCLReturn extends Struct({
    elementIndex: UInt64,
    message: Field,
    randomNumber: Field,
}) {}

export class BaseAOCL extends Struct({
    numElements: UInt64,
    commitmentList: Provable.Array(Field, Number(MAX_ELEMENTS)),
    size(): number {
      return (this.constructor as any).size;
    }
  }) {
    constructor() {
      super({
        size: 0,
        numElements: UInt64.zero,
        commitmentList: Array(Number(MAX_ELEMENTS)).fill(Field(0))
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

function AOCL(size: number): typeof BaseAOCL {
  class AOCL_ extends BaseAOCL {
    @prop static size : number = size;
  }
  arrayProp(Field, size - 1)(AOCL_.prototype, 'commitmentList');
  //arrayProp(Bool, height - 1)(AOCL_.prototype, 'isLeft');
  return AOCL_;
}