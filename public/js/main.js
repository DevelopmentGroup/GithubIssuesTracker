
// jQuery.githubUser = function(username, callback) {
//    jQuery.getJSON('https://api.github.com/users/'+username+'/repos?callback=?',callback);
// }


//Constructs a request from the following parameters: project owner, project name, page number (of issues)
jQuery.getIssues = function(username, repoName, pageNumber, callback) {
	jQuery.getJSON('https://api.github.com/repos/' + username + '/' +repoName + '/issues?page='+pageNumber, callback);
}

//Displays up to 30 latest issues into the target div
jQuery.fn.getAndDisplayIssues = function(username, repoName, pageNumber) {
    this.html("<span>Getting issues for " + username +"'s project " + repoName + ".</span>");
     
    var target = this;
    $.getIssues(username, repoName, pageNumber, function(data) {
        var repos = data; // JSON Parsing

        //check if the project has no issues.
        if(Object.keys(data).length <= 0){
        	alert("This project either has no issues (unlikely!) or we failed to retrieve them.");
        }
        sortByUpdateDate(repos);
        console.log(repos);    
     
        var list = $('<dl/>');
        target.empty().append(list);
        counterX = 0;
        $(repos).each(function() {
        	counterX++;
            if (this.name != (username.toLowerCase()+'.github.com')) {
            	var trimmedBody = trimStringLength(this.body);
            	list.append('<div class=\'card card-1\'><div class=\'row\' style=\'margin:3em;\'><div style=\'\' class=\"col-sm-2\"><img width=75px height=75px src=' + this.user.avatar_url +'></div><div class=\"col-sm-10\"><div id=\'target' + counterX + '\'></div>' + '</div></br>'+'</div></div>');
                var targetDiv = "#target" + counterX;
                //console.log(targetDiv);
                $(targetDiv).append('<a href="'+ './issue.html?number=' + this.number + '&owner=' + username + '&repo=' + repoName +'">' +'#' + this.number + ": " + this.title + '</a> <em>'+(this.language?('('+this.language+')'):'')+'</em>&nbsp;&nbsp;&nbsp;&nbsp;');
                
                for (var i = 0; i < this.labels.length; i++){
                	$(targetDiv).append('<span style=color:' + this.labels[i].color+ '>label:' + this.labels[i].name + '</span>');
                }
                $(targetDiv).append('<br>' + trimmedBody + '');
                //console.log(this.user.avatar_url);
                // list.append('</div></br>'+'</div>')
            }
        });      
      });
    
    //sorts input repositories by date
    function sortByUpdateDate(repos) {
        repos.sort(function(a,b) {
        	//console.log("updated at: " + a.updated_at);
        	//console.log(a.updated_at - b.updated_at);
        return new Date(b.updated_at) - new Date(a.updated_at);
       });
    }


    //Trims an 'inputString' to 'x' characters, ending on a clean line or word break, and returns the trimmed string. It also has a catch to return "<em><no description found></em>" if blank
    function trimStringLength(inputString, x) {
    	var trimmedString = inputString;

    	//check for null or zero length descriptions 
    	if (inputString == null){
    		trimmedString = "<em>&#60;someone was lazy. no description found&#62;</em>";
    		return trimmedString;
    	}
    	if (inputString.length <= 0){
    		trimmedString = "<em>&#60;someone was lazy. no description found&#62;</em>";
    		return trimmedString;
    	}

    	if (inputString.length > 140){
    		inputString = inputString.substr(0,140);
    		var indexOfLastSpace = 5;
    		indexOfLastSpace = inputString.lastIndexOf(" ");
    		var indexOfLine = inputString.lastIndexOf("\n");
    		if (indexOfLine > indexOfLastSpace){
    			indexOfLastSpace = indexOfLine;
    		}
    		trimmedString = inputString.substr(0, indexOfLastSpace) + "...";
    	} else {
    		return inputString;
    	}

    	return trimmedString;
    } 
};


var inputOwner = "";
var inputRepoName = "";
//calls getAndDisplayIssues with parameters pulled from the data input fields "input-owner" and "input-repo-name"
function submitTargetRepo(){
	console.log("ran");
	inputOwner = $("#input-owner").val();
	inputRepoName = $("#input-repo-name").val();
	console.log(inputOwner);
	$("#issues-list").getAndDisplayIssues(inputOwner, inputRepoName, 1);
}

//validates a Github username (from the input field "input-owner") and returns a boolean.
function validateGithubUsername(){
	var username = $("#input-owner").val();
	$.getUser(username, function(data) {
        var repos = data; // JSON Parsing
		console.log(repos);

        //check if the user is valid
        if(Object.keys(data).length >= 4){
        	//alert("Valid user!");
        }
      });
    
}

//Constructs a request for a Github user from the following parameters: username
jQuery.getUser = function(username, callback) {
	//jQuery.getJSON('https://api.github.com/users/' + username, callback);

	$.ajax({
    url: 'https://api.github.com/users/' + username,
    dataType: "json",
    success: function(data){
      $("#valid-user-icon").attr("src", "https://cdn0.iconfinder.com/data/icons/weboo-2/512/tick.png");
    },
    error: function(data){
      $("#valid-user-icon").attr("src", "https://cdn4.iconfinder.com/data/icons/icocentre-free-icons/114/f-cross_256-128.png");
    },
    complete: function(data) {
      //alert('complete')
    }})
}

//The two functions below will display the next or previous 30 issues.
var currentPage = 1;
function getNextIssues(){
	$("#issues-list").getAndDisplayIssues(inputOwner, inputRepoName, currentPage + 1);
	currentPage++;
}

function getPreviousIssues(){
	$("#issues-list").getAndDisplayIssues(inputOwner, inputRepoName, currentPage - 1);
	currentPage--;
}


//This function parses variables from the URL
$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
}

function getSingleIssue(owner, repoName, issueNumber){
	$("#issues-list").getSingleIssueJQ(owner, repoName,issueNumber);
}

jQuery.fn.getSingleIssueJQ = function(owner, repoName, issueNumber) {
	//jQuery.getJSON('https://api.github.com/users/' + username, callback);

	$.ajax({
    url: 'https://api.github.com/repos/' + owner + '/' + repoName + '/issues/' + issueNumber,
    dataType: "json",
    success: function(data){
      console.log(data);
      var target = this;
      var list = $('#issue');
      var formattedBody = codeFormatText(data.body);

      // var state;
      // if(data.state == "open"){
      // 	state 
      // } else {

      // }
      // target.empty().append(list);
      if (data.name != (owner.toLowerCase()+'.github.com')) {
            	list.append('<div class=\'card card-2\' style=\'padding-top:1em\'><div class=\'row\' style=\'margin:3em;\'><div class=\"col-sm-4\"><img width=250px height=250px src=' + data.user.avatar_url +'></div><div class=\"col-sm-8\" style=\'white-space:pre-wrap;font-size:2.5em; padding-left:1em\'><div id=\'targetTitle\'></div></div><div class=\'row\'><div class=\'col-md-12\'><div id=\'targetDiv' + '\'></div></div></div></br>'+'</div></div>');
                var targetDiv = "#targetDiv";
                //console.log(targetDiv);
                $('#targetTitle').append('<a href="'+ (data.homepage?data.homepage:data.html_url) +'">' +'#' + data.number + "<br>" + data.title + '</a> <em></br>' +data.state +(data.language?('('+data.language+')'):'')+'</em>&nbsp;');
                
                for (var i = 0; i < data.labels.length; i++){
                	$(targetDiv).append('<span style=color:' + data.labels[i].color> + 'label:' + data.labels[i].name + '</span>');
                }
                $(targetDiv).append('<br><div style=\'white-space:pre-wrap\'>' + formattedBody + '</div>');
                //console.log(this.user.avatar_url);
                // list.append('</div></br>'+'</div>')
            }

    },
    error: function(data){
      $("#valid-user-icon").attr("src", "https://cdn4.iconfinder.com/data/icons/icocentre-free-icons/114/f-cross_256-128.png");
    },
    complete: function(data) {
      //alert('complete')
    }})
}


//This function takes an input string and returns a string where ''' has been correctly replaced with the <pre><code> tag(s)
function codeFormatText(input){
	//var p = '%22';
	var first = true;


	while (input.indexOf("```") != -1){
		if(first == true){
			input = input.replace("```", "<pre><code>");
			//console.log(true);
			first = false;
		} else {
			input = input.replace("```", "</code></pre>");
			first = true;
		}
	}
	//var x = input.indexOf("```");
	//console.log("HERE: " + x);
	//console.log(input);
	return input;
}