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
    MerkleTree,
    MerkleWitness,
    Struct,
  } from 'o1js';
  
  const doProofs = true;
  
  export class MyMerkleWitness extends MerkleWitness(8) {}
  
  export class Account extends Struct({
    publicKey: PublicKey,
    points: UInt32,
  }) {
    hash(): Field {
      return Poseidon.hash(Account.toFields(this));
    }
  
    addPoints(points: number) {
      return new Account({
        publicKey: this.publicKey,
        points: this.points.add(points),
      });
    }
  }
  // we need the initiate tree root in order to tell the contract about our off-chain storage
  /*
    We want to write a smart contract that serves as a leaderboard,
    but only has the commitment of the off-chain storage stored in an on-chain variable.
    The accounts of all participants will be stored off-chain!
    If a participant can guess the preimage of a hash, they will be granted one point :)
  */  
    
export class Leaderboard extends SmartContract {
    // a commitment is a cryptographic primitive that allows us to commit to data, with the ability to "reveal" it later
    @state(Field) commitment = State<Field>();
  
    @method async init() {
      super.init();
      this.commitment.set(Field(0));
    }

    @method async set_commitment(commitment_arg: Field) {
      this.commitment.set(commitment_arg);
    }
  
    @method
    async guessPreimage(guess: Field, account: Account, path: MyMerkleWitness) {
      // this is our hash! its the hash of the preimage "22", but keep it a secret!
      let target = Field(
        '17057234437185175411792943285768571642343179330449434169483610110583519635705'
      );
      // if our guess preimage hashes to our target, we won a point!
      Poseidon.hash([guess]).assertEquals(target);
  
      // we fetch the on-chain commitment
      let commitment = this.commitment.get();
      this.commitment.requireEquals(commitment);
      //print commitment
      Provable.log(commitment);

      // we check that the account is within the committed Merkle Tree
      path.calculateRoot(account.hash()).assertEquals(commitment);
  
      // we update the account and grant one point!
      let newAccount = account.addPoints(1);
  
      // we calculate the new Merkle Root, based on the account changes
      let newCommitment = path.calculateRoot(newAccount.hash());
  
      this.commitment.set(newCommitment);
    }
  }