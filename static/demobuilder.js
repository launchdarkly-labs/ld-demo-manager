document.addEventListener("DOMContentLoaded", () => {
    email = document.getElementById("email").value;
    getProjects(email);
});



function demobuilder(email) {
    document.getElementById("project_name").innerHTML = "";
    document.getElementById("client_id").innerHTML = "";
    document.getElementById("error_message").innerHTML = "";

    var xhr = new XMLHttpRequest();
    var url = "https://2rwthfsr2g4a7uomntrgbkzymq0oxepl.lambda-url.us-east-2.on.aws/";
    document.getElementById("current_status").innerHTML = "Building your demo, please wait...";
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

function getProjects(email) {
    var xhr = new XMLHttpRequest();
    var url = "https://goqtp7svxwsfbcsv7zbfkvafe40hohet.lambda-url.us-east-2.on.aws/";
    document.getElementById("project_list").innerHTML = "Loading projects...";
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                var res = JSON.parse(this.responseText);
                items = JSON.parse(res.body);
                document.getElementById("project_list").innerHTML = "";
                for (var i in items.Items) {
                    var tdate = Date.parse(items.Items[i].CreationDate);
                    var infoLink = "<div><a href=\"https://app.launchdarkly.com/projects/" + items.Items[i].ProjectKey + "/flags\" target=\"_blank\">" + items.Items[i].ProjectName + "</a></div>";
                    var infoDate = "<div class=\"pl-5\">Created: " + new Date(tdate).toLocaleDateString() + "</div>";
                    var infoClient = "<div class=\"pl-5\">Client ID: " + items.Items[i].ClientId + "</div>";
                    var infoSdk = "<div class=\"pl-5\">SDK Key: " + items.Items[i].SdkKey + "</div>";
                    var infoDelete = "<div class=\"pl-5\"><span class=\"tag is-danger\"><button class=\"delete is-small is-danger\"></button><a href=\"#\" class=\"is-danger has-text-black\" >nbsp;nbsp;nbsp;Delete this Project</a></span></div>";
                    var infoSeparator = "<div class=\"pl-5\">&nbsp;</div>";
                    document.getElementById("project_list").innerHTML += "<div>" + infoLink + infoDate + infoClient + infoSdk + infoDelete + infoSeparator + "</div>"
                }
            } else {
                document.getElementById("project_list").innerHTML = "There was an error retrieving your projects."
            }
        }
    }
    xhr.send(JSON.stringify({ "email": email }));
}
