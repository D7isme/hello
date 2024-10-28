import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";

const path = "./data.json";

const markCommit = (x, y) => {
  const date = moment()
    .subtract(1, "y")
    .add(1, "d")
    .add(x, "w")
    .add(y, "d")
    .format();

  const data = {
    date: date,
  };

  jsonfile.writeFile(path, data, () => {
    simpleGit().add([path]).commit(date, { "--date": date }).push();
  });
};

var global = 1
var numb = 0
const makeCommits = (n) => {
  if(n===0) return simpleGit().push();
  const x = random.int(0, 54);
  const y = random.int(0, 6);
  global++
  // const date = moment().subtract(1, "y").add(1, "d").add(global, "w").add(global, "d").format();
  const date = moment().subtract(2, 'year').add(global, 'days').format();

  const data = {
    date: date,
  };
  console.log(date, ++numb);
  jsonfile.writeFile(path, data, () => {
    simpleGit().add([path]).commit(date, { "--date": date },makeCommits.bind(this,--n));
  });
};

makeCommits(100);
