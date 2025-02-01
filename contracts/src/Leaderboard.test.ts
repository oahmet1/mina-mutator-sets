import { Leaderboard, Account } from './Leaderbord';
import { Field, Mina, PrivateKey, PublicKey, AccountUpdate,SmartContract,
    Poseidon, State,state,method,UInt32,MerkleTree,MerkleWitness } from 'o1js';

let proofsEnabled = true;
class MyMerkleWitness extends MerkleWitness(8) {}


describe('Mutator Sets ', () => {
  let 
    contract: Leaderboard,
    initialBalance = 10_000_000_000,
    contractAccount: Mina.TestPublicKey,
    feePayer : Mina.TestPublicKey,
    Accounts: Map<string, Account>;

  const Tree = new MerkleTree(8);

  type Names = 'Bob' | 'Alice' | 'Charlie' | 'Olivia';

  beforeAll(async () => {
    

    let Local = await Mina.LocalBlockchain({ proofsEnabled: proofsEnabled });
    Mina.setActiveInstance(Local);

    [feePayer] = Local.testAccounts;

    contractAccount = Mina.TestPublicKey.random();

    // this map serves as our off-chain in-memory storage
    Accounts = new Map<Names, Account>(
      ['Bob', 'Alice', 'Charlie', 'Olivia'].map((name: string, index: number) => {
        return [
          name as Names,
          new Account({
            publicKey: Local.testAccounts[index + 1], // `+ 1` is to avoid reusing the account aliased as `feePayer`
            points: UInt32.from(0),
          }),
        ];
      })
    );

    // we now need "wrap" the Merkle tree around our off-chain storage
    // we initialize a new Merkle Tree with height 8
    

    Tree.setLeaf(0n, Accounts.get('Bob')!.hash());
    Tree.setLeaf(1n, Accounts.get('Alice')!.hash());
    Tree.setLeaf(2n, Accounts.get('Charlie')!.hash());
    Tree.setLeaf(3n, Accounts.get('Olivia')!.hash());

    // now that we got our accounts set up, we need the commitment to deploy our contract!
    contract = new Leaderboard(contractAccount);
    console.log('Deploying leaderboard..');
    if (proofsEnabled) {
      await Leaderboard.compile();
    }

  });

  it('generates and deploys the `Leaderboard` smart contract', async () => {
    let tx = await Mina.transaction(feePayer, async () => {
      AccountUpdate.fundNewAccount(feePayer).send({
        to: contractAccount,
        amount: initialBalance,
      });
      await contract.deploy();
      await contract.set_commitment(Tree.getRoot());
    });
    await tx.prove();
    await tx.sign([feePayer.key, contractAccount.key]).send();
    
    console.log('Initial points: ' + Accounts.get('Bob')?.points);
  });

  async function makeGuess(name: Names, index: bigint, guess: number) {
    let account = Accounts.get(name)!;
    let w = Tree.getWitness(index);
    let witness = new MyMerkleWitness(w);
  
    let tx = await Mina.transaction(feePayer, async () => {
      //print the commitment
      console.log('Commitment: ' + Tree.getRoot());
      await contract.guessPreimage(Field(guess), account, witness);
    });
    await tx.prove();
    await tx.sign([feePayer.key, contractAccount.key]).send();
  
    // if the transaction was successful, we can update our off-chain storage as well
    account.points = account.points.add(1);
    Tree.setLeaf(index, account.hash());
    contract.commitment.get().assertEquals(Tree.getRoot());
  }

  it('correctly updates the state on the `Leaderboard` smart contract', async () => {
    
    await makeGuess('Bob', 0n, 22);
    console.log('Final points: ' + Accounts.get('Bob')?.points);
  });
});