# Mutator Sets on Mina

This repo implements provable mutator sets for the [MINA](https://minaprotocol.com/) blockchain using [o1js](https://www.o1labs.org/o1js) libraries. Due to the constraints of writing provable code, such as not being able to use dynamically sized arrays or dynamic indexing on fixed size arrays, the time complexity of any operation is linear with regards to the length of the fixed sized arrays used to store the elements. Even though not as fast as it would be in other programming methodologies, provable code provides fast verification, and mutator sets are still useful for their privacy features.
## How to use
Example usage :
```ts
import { MS } from './MS';
import { Field} from 'o1js';


let ms = new MS();
const element = Field(22);
const random_num = Field.random();

// Adding an element 
const record = ms.add( element, random_num);

// Deleting an element
ms.drop(element, record.index, random_num);

// Checking if the element is present 
const res = ms.verify_inclusion(element, record.index, random_num);
res.assertEquals(false);
```
Even if an observers sees the content of the append only commitment list (AOCL) or the sliding window bloom filter (SWBF) used to store the added and deleted elements respectively, they can neither deduce which elements' commitments are stored nor link the commitments in the AOCL and SWBF. This enables the engineers to create more transparent systems.

The element itself, element index, and the random number that is fed to the mutator set should not be revealed, as they are the secrets being used to create the commitments.

Decrease the ```MAX_ELEMENTS``` variable in AOCL.ts and SWBF.ts files if you want to accelerate the operations, or increase it if you want to store more elements.

This implementation is fully provable, meaning you can use it in mina smart contracts as well. Feel free to check the smart contract tests in the repository.

## Why Mutator Sets ?

Current implementation of Merkle Trees by 1ojs does not provide a method to update a merkle witness without having to build the whole tree. In their example they store the whole tree, and whenever the tree is updated, new membership proofs are created from this tree. But for big trees this is quite inefficient. If the number of elements is N, then one can store the witness in O(log N) space, and ideally can update this witness in O(log N) space and time, given update records of length O(log N). This way no single node has to update all N elements. The only downside of this is, someone needs to keep track of the updates to the tree, and update the witnesses regularly.

This approach is further motivated by how mutator sets can be useful for running light clients to track the unspent transaction outputs (UTXO set). If a light client cares about only a small portion of the elements, lets say C elements, then this client can only keep the updates of this C elements, which are of size O(log N), so O(C log N) space is enough instead of O(N). A light client has orders of magnitudes small number of accounts  C to track in compare to the number of existing accounts in the whole chain N.

What mutator sets bring on top of the merkle trees is scalable privacy. This is achieved by using a random number when generating the commitment. One can describe the mutator sets shortly as succinct decoy-and-nullifier sets, or operator-free mixnets.

