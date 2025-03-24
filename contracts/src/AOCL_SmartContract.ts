import {
    Provable,
    SmartContract,
    Poseidon,
    Field,
    State,
    state,
    PublicKey,
    Mina,
    method,
    UInt32,
    AccountUpdate,
    Struct,
    UInt64,
  } from 'o1js';

import { IndexedMerkleMap } from 'o1js/dist/node/lib/provable/merkle-tree-indexed';
class MerkleMap extends IndexedMerkleMap(33) {}


import {AOCL, AOCLWitness, BaseAOCL} from './AOCL';

const doProofs = true;
class MyAOCL extends AOCL(8) {}

const smth = new MyAOCL();
smth.add(Field(22));

export class AOCL_Update extends SmartContract {
    events = {
        "add-merkle-leaf": Field,
        "update-merkle-leaf": Field,
    }

    // a commitment is a cryptographic primitive that allows us to commit to data, with the ability to "reveal" it later
    @state(Field) commitment = State<Field>();
  
    @method async init() {
      super.init();
      this.commitment.set(Field(0));
    }

    @method async set_commitment(commitment_arg: Field) {
      this.commitment.set(commitment_arg);
    }

    @method.returns(AOCLWitness)
    async add_element(aocl : MyAOCL, message: Field, random: Field) {
    
    const commitment = Poseidon.hash([message, random]);
    const index = aocl.numElements;
    
    const aocl_size : number = Number(aocl.size);
    let oneHot = Array.from({ length: aocl_size }, (_, i) => index.equals(UInt64.from(i)));
    // Use Provable.switch to select the correct Field from fieldArray
    let elementAtIndex = Provable.switch(oneHot, Field, aocl.commitmentList);
    aocl.commitmentList[Number(index.toBigInt())] = commitment;

    aocl.numElements = aocl.numElements.add(UInt64.one);

    return new AOCLWitness({ elementIndex: index, message, randomNumber: random});
    }
  }