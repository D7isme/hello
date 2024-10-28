import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import fs from "fs";
import pathModule from "path";

const path = "./data.json"; // Path to your JSON file

// Initialize Git
const git = simpleGit();
const gitLockPath = pathModule.join(".git", "index.lock");

// Function to check and remove index.lock if it exists
const removeLockFile = () => {
  if (fs.existsSync(gitLockPath)) {
    console.log("Removing existing index.lock file...");
    fs.unlinkSync(gitLockPath);
  }
};

// Function to mark a commit with the given date
const markCommit = async (date, retryCount = 3) => {
  const data = {
    date: date,
  };

  // Write to the JSON file
  await jsonfile.writeFile(path, data); // Use async writeFile to write data
  try {
    removeLockFile(); // Always try to remove the lock file before the Git operation
    // Try adding and committing
    await git.add([path]).commit(date, { "--date": date });
    // Introduce a delay between commits to reduce stress on the Git system
    await new Promise((resolve) => setTimeout(resolve, 100)); // Delay for 100ms
  } catch (error) {
    if (retryCount > 0 && error.message.includes("index.lock")) {
      console.log("Lock file detected. Retrying...");
      removeLockFile(); // Remove the lock file
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
      return markCommit(date, retryCount - 1); // Retry the commit
    }
    throw error; // If retries are exhausted, throw the error
  }
};

let currentDate = moment("1999-01-01"); // Start from January 1, 1999
const endDate = moment(); // Current date

const makeCommits = async () => {
  removeLockFile(); // Remove any existing lock file before starting

  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
    const date = currentDate.format();
    console.log(date); // Log the current date being used for the commit

    // Perform the commit operation
    await markCommit(date);

    // Move to the next day
    currentDate.add(1, "days");
  }

  // Push all commits to the remote repository
  await git.push();
};

// Start making commits from 1999 to the current date
makeCommits()
  .then(() => {
    console.log("All commits pushed successfully.");
  })
  .catch((err) => {
    console.error("Error making commits:", err);
  });
