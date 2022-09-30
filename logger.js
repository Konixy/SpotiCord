const chalk = require('chalk');
const moment = require("moment");

function getTimestamp() {
  return `[${moment().format("DD/MM/YYYY HH:mm:ss")}]`
}

function log(content) {
  const timestamp = getTimestamp();
  if (!content) return;
  console.log(
    `${chalk.cyan(timestamp)} ${chalk.blue("[LOG]")} ${chalk.blue(content)}`
  );
}

function loader(content) {
  const timestamp = getTimestamp();
  if (!content) return;
  console.log(
    `${chalk.cyan(timestamp)} ${chalk.yellowBright("[LOADER]")} ${content}`
  );
}

function error(content) {
  const timestamp = getTimestamp();
  if (!content) return;
  console.log(
    `${chalk.cyan(timestamp)} ${chalk.red("[ERROR]")} ${chalk.red(content)}`
  );
}

function warn(content) {
  const timestamp = getTimestamp();
  if (!content) return;
  console.log(
    `${chalk.cyan(timestamp)} ${chalk.yellow("[WARN]")} ${chalk.yellow(content)}`
  );
}

function command(content) {
  const timestamp = getTimestamp();
  if (!content) return;
  console.log(
    `${chalk.cyan(timestamp)} ${chalk.magenta("[COMMAND]")} ${content}`
  );
}

function start(content) {
  const timestamp = getTimestamp();
  if (!content) return;
  console.log(
    `${chalk.cyan(timestamp)} ${chalk.green(
      "[START]"
    )} ${chalk.green(content)}`
  );
}

function database(content) {
  const timestamp = getTimestamp();
  if (!content) return;
  console.log(
    `${chalk.cyan(timestamp)} ${chalk.green(
      "[DATABASE]"
    )} ${content}`
  );
}

module.exports = {
  log,
  loader,
  error,
  warn,
  command,
  start,
  database
};