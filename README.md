# Non Compact Mutator Sets

I want to start by looking at how the merkle trees are currently used in Mina. Unfortunately, the current implementation by 1ojs does not provide a method to update you merkle witness without having to build the whole tree. In their example they store the whole tree somewhere, and whenever the tree is updated, new membership proofs are created from this tree. But for big trees this is quite inefficient. If the number of elements is N, then one can store the witness in O(log N) space, and also can update this witness, given update records of length O(log N). This way no single node has to update all N elements. The only downside of this is, now someone needs to keep track of the updates to the tree, and update the witnesses regularly.

We motivate this approach by showing how they can be useful for running light clients to track the unspent transaction outputs (UTXO set). If a light client cares about only a small portion of the elements, lets say C elements, then this client can only keep the updates of this C elements, which are of size O(log N), so O(C log N) space is enough instead of O(N). A light client has orders of magnitudes small number of accounts  C to track in compare to the number of existing accounts in the whole chain N.

What mutator sets bring on top of the merkle trees is scalable privacy. It uses merkle mountain ranges to efficiently scale the number of elements, and makes the addition and removal records unlinkable. This is achieved by using a random number when generating the commitment. This repo implements non-compact mutator sets. To compactify mutator sets, one needs to utilize Merkle Mountain Ranges on top of the implemented datastructures.

One can describe the mutator sets shortly as succinct decoy-and-nullifier sets, or operator-free mixnets. 

Mina blockchain allows the storage of only 8 State Variables. Hence one can not store a mutator set onchain. 
