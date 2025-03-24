import {
    SmartContract,
    Field,
    State,
    state,
    method,
  } from 'o1js';

import {AOCL, AOCLReturn} from './AOCL';

export class AOCL_Update extends SmartContract {
    events = {
        "add-merkle-leaf": Field,
        "update-merkle-leaf": Field,
    }

    // we store the last commitment
    @state(Field) commitment = State<Field>();
  
    @method async init() {
      super.init();
      this.commitment.set(Field(0));
    }

    @method async add_element(aocl : AOCL, message: Field, random: Field) {
      let aoclReturn : AOCLReturn = aocl.add(message, random);
      this.commitment.set(aoclReturn.commitment);
    }

  }