const { seedSystem } = require("./db-utils");

seedSystem()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
