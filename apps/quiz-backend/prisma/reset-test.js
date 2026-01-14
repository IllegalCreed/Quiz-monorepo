const { resetTest } = require("./db-utils");

resetTest()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
