import { AOCL_Update } from './AOCL_SmartContract';
import { AOCL, AOCLReturn } from './AOCL';
import { Field, Mina, PrivateKey, PublicKey, AccountUpdate,SmartContract,
    Poseidon, State,state,method,UInt32, UInt64 } from 'o1js';

let proofsEnabled = true;

describe('AOCL Test ', () => {
  let 
    contract: AOCL_Update,
    initialBalance = 10_000_000_000,
    contractAccount: Mina.TestPublicKey,
    feePayer : Mina.TestPublicKey;
    
  beforeAll(async () => {
    
    let Local = await Mina.LocalBlockchain({ proofsEnabled: proofsEnabled });
    Mina.setActiveInstance(Local);

    [feePayer] = Local.testAccounts;
    contractAccount = Mina.TestPublicKey.random();

    contract = new AOCL_Update(contractAccount);

    // check how many rows are generated
    //const res_analyzemethods = await AOCL_Update.analyzeMethods()
    //console.log('The result of the analyze methods is: ', res_analyzemethods );
    
    console.log('Compiling the smart contract');
    if (proofsEnabled) {
      await AOCL_Update.compile();
    }

  });

  it('generates and deploys the `AOCL` smart contract', async () => {
    let tx = await Mina.transaction(feePayer, async () => {
      AccountUpdate.fundNewAccount(feePayer).send({
        to: contractAccount,
        amount: initialBalance,
      });
      await contract.deploy();
    });
    await tx.prove();
    await tx.sign([feePayer.key, contractAccount.key]).send();
  });

  it('add an element to the AOCL', async () => {
    let aocl = new AOCL();
    const random_num = Field.random();

    let tx = await Mina.transaction(feePayer, async () => {
        let res = await contract.add_element(aocl, Field(22), random_num);
      });

    await tx.prove();
    await tx.sign([feePayer.key, contractAccount.key]).send();

    aocl.add(Field(22), random_num);
    await contract.commitment.get().assertEquals(aocl.commitmentList.get(Field.from(0)));
  });

});