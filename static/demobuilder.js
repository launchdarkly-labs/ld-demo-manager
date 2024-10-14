document.addEventListener("DOMContentLoaded", () => {
    email = document.getElementById("email").value;
    getProjects(email);
});



function demobuilder(email) {
    document.getElementById("project_name").innerHTML = "";
    document.getElementById("client_id").innerHTML = "";
    document.getElementById("error_message").innerHTML = "";

    customName = document.getElementById("demo-custom-name").value.trim();
    demoType = "fintech";
    selDemos = document.getElementsByName("demotyperadio");
    for (var i = 0; i < selDemos.length; i++) {
        if (selDemos[i].checked) {
            demoType = selDemos[i].value;
        }
    }
    if (customName != "") {
        if (customName.length < 15) {
            if (!document.getElementById("custom-name-error")) {
                newdiv = document.createElement("div");
                newdiv.setAttribute("id", "custom-name-error");
                newdiv.classList.add("notification", "is-danger");
                document.getElementById("new-demo-content-section").appendChild(newdiv);
            }
            document.getElementById("custom-name-error").innerHTML = "Custom name must be at least 15 characters long.";
            return;
        }
    }
    hideModal("new-demo-dialog");
    var xhr = new XMLHttpRequest();
    var url = "https://cugrwx4wvk4y3jrp462qlrbrzm0zmmuk.lambda-url.us-east-2.on.aws/";
    document.getElementById("current_status").innerHTML = "Building your demo, please wait...";
    disableBuild();
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                var res = JSON.parse(this.responseText);
                document.getElementById("current_status").innerHTML = "Done!";
                document.getElementById("project_name").innerHTML = "Project Name: <a class=\"has-text-link-40\" href=\"https://app.launchdarkly.com/projects/" + res.body.projectKey + "/flags\" target=\"_blank\">" + res.body.projectName + "</a>";
                document.getElementById("client_id").innerHTML = "Client ID: " + res.body.clientId;
                getProjects(email);
                enableBuild();
                populateExp(res.body.sdkKey, res.body.projectKey);
                // runEvals(projectKey);
            } else {
                document.getElementById("current_status").innerHTML = "There was an error building the demo project."
                document.getElementById("error_message").innerHTML = this.responseText;
                enableBuild();
                getProjects(email);
            }
        }
    }
    xhr.send(JSON.stringify({ "action": "build", "email": email, "customName": customName, "demoType": demoType }));
}

function populateExp(sdkKey, projectKey) {
    var xhr = new XMLHttpRequest();
    var url = "https://3ucrtyghyspmxp5vxuo27p5kby0dwohk.lambda-url.us-east-2.on.aws/";
    // document.getElementById("current_status").innerHTML = "Populating Experiment with data...";
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-type', 'application/json');
    // xhr.onreadystatechange = function () {
    //     if (this.readyState == 4) {
    //         if (this.status == 200) {
    //             var res = JSON.parse(this.responseText);
    //             runEvals(projectKey);
    //         } else {
    //             document.getElementById("current_status").innerHTML = "There was an error populating the experiment with data."
    //             document.getElementById("error_message").innerHTML = this.responseText;
    //             enableBuild();
    //         }
    //     }
    // }
    xhr.send(JSON.stringify({ "sdk_key": sdkKey, "num_iterations": 1047 }));
}

function runEvals(projectKey) {
    var xhr = new XMLHttpRequest();
    var url = "https://plit32btpvkcwkmaehdcipmlfy0cwloc.lambda-url.us-east-2.on.aws/";
    // document.getElementById("current_status").innerHTML = "Evaluating flags...";
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-type', 'application/json');
    // xhr.onreadystatechange = function () {
    //     if (this.readyState == 4) {
    //         if (this.status == 200) {
    //             var res = JSON.parse(this.responseText);
    //             document.getElementById("current_status").innerHTML = "Done!";
    //         } else {
    //             document.getElementById("current_status").innerHTML = "Done!";
    //             // document.getElementById("current_status").innerHTML = "There was an error evaluating flags."
    //             // document.getElementById("error_message").innerHTML = this.responseText;
    //         }
    //         enableBuild();
    //     }
    // }
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
    link.onclick = function () { showModal('new-demo-dialog'); return false; };
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
                if (items.Items.length == 0) {
                    document.getElementById("project_list").innerHTML = "You have no existing projects.";
                } else {
                    for (var i in items.Items) {
                        demox = items.Items[i].DemoType ? items.Items[i].DemoType : "FinTech";
                        var tdate = Date.parse(items.Items[i].Created);
                        var infoLink = "<div><a href=\"https://app.launchdarkly.com/projects/" + items.Items[i].ProjectKey + "/flags\" target=\"_blank\">" + items.Items[i].ProjectName + "</a></div>";
                        var infoDemoType = "<div class=\"pl-5\">Demo Type: " + demox + "</div>";
                        var infoDate = "<div class=\"pl-5\">Created: " + new Date(tdate).toLocaleDateString() + " at " + new Date(tdate).toLocaleTimeString() + "</div>";
                        var infoClient = "<div class=\"pl-5\">Client ID: " + items.Items[i].ClientId + "</div>";
                        var infoSdk = "<div class=\"pl-5\">SDK Key: " + items.Items[i].SdkKey + "</div>";
                        var infoDelete = "<div class=\"pl-5\"><span class=\"tag is-danger\"><button class=\"delete is-small is-danger\"></button><a href=\"#\" class=\"is-danger has-text-black\" id=\"deletebutton" + i + "\" onclick=\"deleteProject('" + items.Items[i].ProjectKey + "', " + i + ");return false;\">&nbsp;&nbsp;&nbsp;Delete this Project</a></span></div>";
                        var infoSeparator = "<div class=\"pl-5\">&nbsp;</div>";
                        document.getElementById("project_list").innerHTML += "<div>" + infoLink + infoDemoType + infoDate + infoClient + infoSdk + infoDelete + infoSeparator + "</div>"
                    }
                }
            } else {
                document.getElementById("project_list").innerHTML = "There was an error retrieving your projects. <a href=\"#\" onclick=\"getProjects('" + email + "');return false;\">Try again</a>";
            }
        }
    }
    xhr.send(JSON.stringify({ "email": email }));
}

function deleteProject(projectKey, index) {
    if (confirm("Are you sure you want to delete this project?")) {
        var xhr = new XMLHttpRequest();
        var url = "https://cugrwx4wvk4y3jrp462qlrbrzm0zmmuk.lambda-url.us-east-2.on.aws/";
        document.getElementById("deletebutton" + index).innerHTML = "&nbsp&nbsp&nbsp;Deleting project...";
        xhr.open("POST", url, true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status != 200) {
                    alert("There was an error deleting the project.");
                }
                getProjects(document.getElementById("email").value);
            }
        }
        xhr.send(JSON.stringify({ "action": "cleanup", "project-key": projectKey }));
    }
}

function showModal(modalId) {
    var modal = document.getElementById(modalId);
    modal.classList.add("is-active");
}

function hideModal(modalId) {
    if (document.getElementById("custom-name-error")) {
        document.getElementById("custom-name-error").remove();
    }
    document.getElementById("demo-custom-name").value = "";
    var modal = document.getElementById(modalId);
    modal.classList.remove("is-active");
}
