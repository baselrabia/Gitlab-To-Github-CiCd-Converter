const yaml = require("js-yaml");
const fs = require("fs");
const ci = require("./ci-functions.js");


let runnerName = "sta-runner";



function MapStepKey(name, key, value) {
  const funName = "convert_" + key;
  //check if fun exists in ci-functions.js
  if (ci[funName]) 
     return ci[funName](name, key, value);
  else
    return { key: "", value: "" };

 }

function MapToJob(name, labJob) {
  // console.log(`${name}: ${labJob}`);
  const obj = {};
  name = name.replace(/ /g, "-");
  obj.name = labJob.stage + "_" + name;
  obj["runs-on"] = runnerName;

  Object.entries(labJob).forEach(([key, value]) => {
    if (key === "stage") return;
    console.log(`${key}: `);
    const step = MapStepKey(name, key, value);
    if (step.key ===  "") return;
    if (obj[step.key]){
       step.value.forEach((v) => {
            obj[step.key].push(v);
        });
    }else{
        obj[step.key] = step.value;
    } 

  });

  return obj;
}

// Get document, or throw exception on error
try {
  console.log("Loading yaml file...");
  const doc = yaml.load(fs.readFileSync(".gitlab-ci.yml", "utf8"));
  const newDoc = {
    name: "Github Actions CI",
    on: "push",
    jobs: {},
  };
  //    console.log(doc);
  Object.entries(doc).forEach(([key, value]) => {
    if (key === "stages") return;

    const job = MapToJob(key, value);
    newDoc.jobs[job.name] = job;

    //add at first of array checkout step to each job
    const checkoutStep = {
      name: "Checkout the repository", 
      uses: 'actions/checkout@v3'
    };
    newDoc.jobs[job.name].steps.unshift(checkoutStep);

    //delete name from job object
    delete newDoc.jobs[job.name].name;

  });
  const yFile = yaml.dump(newDoc);

   console.log("/////////////// NEW DOC ///////////////");
   console.log(yFile);

  fs.writeFile("output/github_ci.yaml", yFile, function (err) {
    if (err) throw err;
    console.log("File is created successfully.");
  });



    // writeFile function with filename, content and callback function
  fs.writeFile("output/json-doc.json", JSON.stringify(newDoc), function (err) {
    if (err) throw err;
    console.log("File is created successfully.");
  });


} catch (e) {
  console.log("error .................. ");
  console.log(e);
}

//   //   // writeFile function with filename, content and callback function
//     fs.writeFile("json-github-ci.json", JSON.stringify(doc) , function (err) {
//       if (err) throw err;
//       console.log("File is created successfully.");
//     });

//   // writeFile function with filename, content and callback function
//   fs.writeFile("json-ci.json", JSON.stringify(doc) , function (err) {
//     if (err) throw err;
//     console.log("File is created successfully.");
//   });
