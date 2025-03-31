import {
    Field,
    Struct,
    Poseidon,
    Bool,
    Provable,
  } from 'o1js';
import { integerDivision, modulo, elementAtIndex, booleanElementAtIndex } from './utils';

/*
Recommendations :
MAX_ELEMENTS > 1.5 * WINDOW_SIZE
WINDOW_SIZE >> NUM_HASHES * BATCH_SIZE
STEP_SIZE > NUM_HASHES * BATCH_SIZE / 8
*/


// decreasing the sizes for fast testing 
const MAX_ELEMENTS = 16; //2048; // Maximum number of elements in the filter
const WINDOW_SIZE = 8; //1024; // Number of bits in the active window
const NUM_HASHES = 2; //2; // Number of hash functions used
const STEP_SIZE = 2; //4; // Step size for sliding window
const BATCH_SIZE = 2; //8; // Number of items processed in a batch

export class SWBFReturn extends Struct({
  indices: Provable.Array(Field, NUM_HASHES),
}) {}

export class SWBF extends Struct({
  bitArray: Provable.Array(Bool, MAX_ELEMENTS),
}) {
  constructor() {
    super({
      bitArray : Array(MAX_ELEMENTS).fill(Bool(false))
    });
  }

  add(message: Field, timestamp: Field, randomNumber: Field): SWBFReturn {
    let indices = Provable.Array(Field, NUM_HASHES).fromFields(Array(NUM_HASHES).fill(Field(0)));
    const offset = integerDivision(timestamp, Field(BATCH_SIZE)).mul(Field(STEP_SIZE));

    indices = indices.map((_, i) => {

      const hashValue = Poseidon.hash([timestamp, message, randomNumber, Field(i)]);
      const index = modulo(hashValue, Field(WINDOW_SIZE));
      const indexWithOffset = index.add(offset);

      this.bitArray = this.bitArray.map((value, j) =>
        Provable.if(indexWithOffset.equals(Field(j)), Bool(true), value)
      );
      return index;
    });

    return new SWBFReturn({indices : indices});
  }

  /**
   * Checks if an item might be in the filter.
   * False positives are possible, but false negatives are not.
   */
  probe(message: Field, timestamp: Field, randomNumber: Field): Bool {
    let result = Bool(true);
    const offset = integerDivision(timestamp, Field(BATCH_SIZE)).mul(Field(STEP_SIZE));

    for (let i = 0; i < NUM_HASHES; i++) {
      const hashValue = Poseidon.hash([timestamp, message, randomNumber, Field(i)]);
      const index = modulo(hashValue, Field(WINDOW_SIZE));
      const indexWithOffset = index.add(offset);

      result = result.and(booleanElementAtIndex(this.bitArray, indexWithOffset));
    }
    return result;
  }
}

