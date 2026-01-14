const { seedTest } = require("./db-utils");

seedTest()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
