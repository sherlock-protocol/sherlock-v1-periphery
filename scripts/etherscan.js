const hre = require('hardhat');

async function main() {
  //   const x0 = '0xBcbDD22a610Ba01c403b047712A14Aa83898d9D6';
  //   const x1 = '0x2bC851ae733E1c515ef8b1aCC3d2a5cD284E4aF5';
  //   const x2 = '0x64A191dbd38Ce00467Cee52Eec757EB54F769083';
  // const x3 = '0x2eEEF90E1a83E77c45C7e8088528eb5A16db009d';
  //const x4 = '0x1C4EC216a835258ABbe812307B55dCd67a68856a';
  //const x5 = '0x04771C4F17684054C924C8103e3390CE30f9b545';
 // const x6 = '0x2d15630b519BD4aA2431D23C7C1465ae40964D75';
  const x7 = '0x675b17EdCc7323E2491B0320DEAC829cD051a1Cc';


  await hre.run('verify:verify', {
    address: x7,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
