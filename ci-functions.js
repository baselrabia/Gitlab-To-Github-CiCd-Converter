function convert_image(name, key, value) {
  let newVal = value;
  if (value.name) {
    newVal.image = value.name;
    delete newVal.name;
  }
  newVal.options= "--user root";

  if (value.entrypoint) delete newVal.entrypoint;

  return {
    key: "container",
    value: newVal,
  };
}

function convert_script(name, key, value) {
  // console.log(name, key, value);
  const steps = [];
  value.forEach((step, i) => {
    steps[i] = {
      name: "Check Out " + name + " step " + i,
      run: step,
    };
  });

  return {
    key: "steps",
    value: steps,
  };
}

//convert_before_script
function convert_before_script(name, key, value) {
  //duplicate
  const steps = [];
  value.forEach((step, i) => {
    steps[i] = {
      name: "Check before_script " + name + " step " + i,
      run: step,
    };
  });

  return {
    key: "steps",
    value: steps,
  };
}
//convert_allow_failure
function convert_allow_failure(name, key, value) {
  return {
    key: "continue-on-error",
    value: true,
  };
}

//convert_except
function convert_except(name, key, value) {
  return {
    key: "if",
    value:
      "${{ !contains(fromJson('[\"" +
      value.join('","') +
      "\"]'), github.ref_name) }}",
  };
}
//convert_only
function convert_only(name, key, value) {
  return {
    key: "if",
    value:
      "contains(fromJson('[\"" + value.join('","') + "\"]'), github.ref_name)",
  };
}

//convert_variables
function convert_variables(name, key, value) {
  return {
    key: "env",
    value: value,
  };
}

module.exports = {
  convert_image,
  convert_script,
  convert_allow_failure,
  convert_except,
  convert_only,
  convert_variables,
  convert_before_script,
};
