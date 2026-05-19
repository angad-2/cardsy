const { defineConfig } = require("@prisma/config");
require("./config/env");

module.exports = defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
