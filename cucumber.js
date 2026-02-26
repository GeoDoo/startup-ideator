module.exports = {
  default: {
    requireModule: ["tsx"],
    require: ["features/step-definitions/**/*.ts"],
    paths: ["features/**/*.feature"],
    format: [
      "summary",
      "html:reports/cucumber-report.html",
    ],
    publishQuiet: true,
  },
};
