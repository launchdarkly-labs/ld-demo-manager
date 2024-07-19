function demobuilder(email) {
    document.getElementById("project_name").innerHTML = "";
    document.getElementById("client_id").innerHTML = "";
    document.getElementById("error_message").innerHTML = "";

    var xhr = new XMLHttpRequest();
    var url = "https://2rwthfsr2g4a7uomntrgbkzymq0oxepl.lambda-url.us-east-2.on.aws/";
    document.getElementById("current_status").innerHTML = "Building your demo, please wait...";
    //document.getElementById("build_button").disabled = true;
    disableBuild();
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                var res = JSON.parse(this.responseText);
                document.getElementById("project_name").innerHTML = "Project Name: <a href=\"https://app.launchdarkly.com/projects/" + res.body.projectKey + "/flags\" target=\"_blank\">" + res.body.projectName + "</a>";
                document.getElementById("client_id").innerHTML = "Client ID: " + res.body.clientId;
                populateExp(res.body.sdkKey, res.body.projectKey);
            } else {
                document.getElementById("current_status").innerHTML = "There was an error building the demo project."
                document.getElementById("error_message").innerHTML = this.responseText;
                //document.getElementById("build_button").disabled = false;
                enableBuild();
            }
        }
    }
    xhr.send(JSON.stringify({ "action": "build", "email": email }));
}

function populateExp(sdkKey, projectKey) {
    var xhr = new XMLHttpRequest();
    var url = "https://3ucrtyghyspmxp5vxuo27p5kby0dwohk.lambda-url.us-east-2.on.aws/";
    document.getElementById("current_status").innerHTML = "Populating Experiment with data...";
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                var res = JSON.parse(this.responseText);
                runEvals(projectKey);
            } else {
                document.getElementById("current_status").innerHTML = "There was an error populating the experiment with data."
                document.getElementById("error_message").innerHTML = this.responseText;
                //document.getElementById("build_button").disabled = false;
                enableBuild();
            }
        }
    }
    xhr.send(JSON.stringify({ "sdk_key": sdkKey, "num_iterations": 1047 }));
}

function runEvals(projectKey) {
    var xhr = new XMLHttpRequest();
    var url = "https://plit32btpvkcwkmaehdcipmlfy0cwloc.lambda-url.us-east-2.on.aws/";
    document.getElementById("current_status").innerHTML = "Evaluating flags...";
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                var res = JSON.parse(this.responseText);
                document.getElementById("current_status").innerHTML = "Done!";
            } else {
                document.getElementById("current_status").innerHTML = "There was an error evaluating flags."
                document.getElementById("error_message").innerHTML = this.responseText;
            }
            //document.getElementById("build_button").disabled = false;
            enableBuild();
        }
    }
    xhr.send(JSON.stringify({ "project_key": projectKey, "num_iterations": 35 }));
}

function disableBuild() {
    link = document.getElementById("builderlink");
    link.innerHTML = "In Progress";
    link.onclick = function () { return false; };
}

function enableBuild() {
    link = document.getElementById("builderlink");
    link.innerHTML = "Build Now";
    link.onclick = function () { demobuilder(document.getElementById("email").value); };
}
