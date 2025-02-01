import { Poseidon,Bool, Field, Provable } from 'o1js';
import { CircuitValue, arrayProp} from 'o1js/src/lib/provable/types/circuit-value';


class AOCL {
    num_elements: number;
    list_size: number;
    list: Field[];

    constructor(){
        this.num_elements = 0;
        this.list_size = 1;
        this.list = new Array(1);
    }

    constructorimsi(list: Field[]) {
        this.num_elements = list.length;
        //list size is equal to the smallest power of two that is bigger than num_elements
        this.list_size = nextPowerOfTwo(list.length);
        this.list = list;
    }

}

class BaseAOCLWitness extends CircuitValue {
    static list_size: number;
    random_num: Field;
    element: Field;
    height(): number {
      return (this.constructor as any).height;
    }
}

function AOCLWitness(list_size: number): typeof BaseAOCLWitness {
    class AOCLWitness_ extends BaseAOCLWitness {
      static list_size = list_size;
    }
    arrayProp(Field, height - 1)(MerkleWitness_.prototype, 'path');
    arrayProp(Bool, height - 1)(MerkleWitness_.prototype, 'isLeft');
    return MerkleWitness_;
}

function nextPowerOfTwo(n: number): number {
    if (n <= 0) return 1;
    return Math.pow(2, Math.ceil(Math.log2(n)));
}