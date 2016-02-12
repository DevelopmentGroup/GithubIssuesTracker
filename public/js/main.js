
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
    $('#page-number').html("<span>page " + currentPage +"</span>");



    //do right column info display
    

    $.ajax({
    url: 'https://api.github.com/repos/' + username + '/' +repoName,
    dataType: "json",
    success: function(data){
      $('#repo-name').html("<a href=\'" + data.html_url +"\'><h3>" + data.full_name + "</h3></a>");
      $('#repo-image').html("<a href=\'" + data.owner.html_url +"\'><img width=\'70%\' height=\'70%\' src =\'" + data.owner.avatar_url +"\'></a>");
      $('#open-issues').html("<h5>" + data.open_issues + " open issues</h5>");
      $('#watched').html("<h5>watched by " + data.subscribers_count + " users</h5>");
      $('#forked').html("<h5>forked by " + data.network_count + " users</h5>");
      $('#starred').html("<h5>starred by " + data.stargazers_count + " users</h5>");
    },
    error: function(data){
      //nothing
    },
    complete: function(data) {
      //alert('complete')
    }})


    var target = this;

    $.ajax({
    url: 'https://api.github.com/repos/' + username + '/' +repoName + '/issues?page='+pageNumber,
    dataType: "json",
    success: function(data){
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
        	var formattedBody = codeFormatText(this.body); 
            if (this.name != (username.toLowerCase()+'.github.com')) {
            	var trimmedBody = trimStringLength(formattedBody);
            	list.append('<div class=\'card card-1\' style=\'margin:3em;\'><div class=\'row\' style=\'margin:0em;\'><div style=\'padding-left:0px;\' class=\"col-sm-3\"><a href=\''+this.user.html_url +'\'><img width=100% height=100% src=' + this.user.avatar_url +'></a></div><div class=\"col-sm-9\"><div id=\'target' + counterX + '\'></div>' + '</div></br>'+'</div></div>');
                var targetDiv = "#target" + counterX;
                //console.log(targetDiv);
                $(targetDiv).append('<div style=\'font-size:1.3em\'>'+ this.user.login +', <a href="'+ './issue.html?number=' + this.number + '&owner=' + username + '&repo=' + repoName +'">' +'#' + this.number + ": " + this.title + '</a> <em>'+(this.language?('('+this.language+')'):'')+'</em></div>');
                
                if(this.labels.length > 1){
                	$(targetDiv).append('<br>labels: ');
	                for (var i = 0; i < this.labels.length; i++){
	                	if((i+1)<this.labels.length){
	                		$(targetDiv).append('<span style=\'color:#' + this.labels[i].color+ '\'>' + this.labels[i].name + ', </span>');
	                	} else {
	                		$(targetDiv).append('<span style=\'color:#' + this.labels[i].color+ '\'>' + this.labels[i].name + ' </span>');
	                	}
	                	
	                }
            	} else if (this.labels.length == 1){
            		$(targetDiv).append('<br>label: ');
            		for (var i = 0; i < this.labels.length; i++){
            			$(targetDiv).append('<span style=\'color:#' + this.labels[i].color+ '\'>' + this.labels[i].name + ' </span>');
            		}
            	} else {
            		//do nothing
            	}
                $(targetDiv).append('<br></br><div style=\'white-space:pre-wrap\'>' + trimmedBody + '</div>');
                //console.log(this.user.avatar_url);
                // list.append('</div></br>'+'</div>')
            }
        });      
    },
    error: function(data){
      alert("Error: could not retrieve target repository.");
    },
    complete: function(data) {
      //alert('complete')
    }})




    
    
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
	currentPage = 1;
	$('#page-buttons').css("display", "block");
	//$('#page-buttons').css("text-align", "center");
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
      $("#valid-user-icon").attr("src", "./images/check.png");
    },
    error: function(data){
      $("#valid-user-icon").attr("src", "./images/x.png");
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
	$('#page-number').html("<span>page " + currentPage + "</span>");
}

function getPreviousIssues(){
	$("#issues-list").getAndDisplayIssues(inputOwner, inputRepoName, currentPage - 1);
	currentPage--;
	if(currentPage <= 0){
		currentPage = 1;
	}
	$('#page-number').html("<span>page " + currentPage + "</span>");
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
            	list.append('<div class=\'card card-2\' style=\'padding-top:1em\'><div class=\'row\' style=\'margin:3em;\'><div class=\"col-sm-4\"><a href=\''+data.user.html_url +'\'><img width=250px height=250px src=' + data.user.avatar_url +'></a></div><div class=\"col-sm-8\" style=\'font-size:2.5em; padding-left:1em\'><div id=\'targetTitle\'></div></div><div class=\'row\'><div class=\'col-md-12\'><div id=\'targetDiv' + '\'></div></div></div></br>'+'</div></div>');
                var targetDiv = "#targetDiv";
                //console.log(targetDiv);
                $('#targetTitle').append('<a href="'+ (data.homepage?data.homepage:data.html_url) +'">' + data.user.login +'<br>#' + data.number + ": " + data.title + '</a> <em></br>' +data.state +(data.language?('('+data.language+')'):'')+'</em>&nbsp;<br><br><br>');
                
                if(data.labels.length > 1){
                	$(targetDiv).append('labels: ');
	                for (var i = 0; i < data.labels.length; i++){
	                	if((i+1)<data.labels.length){
	                		$(targetDiv).append('<span style=\'color:#' + data.labels[i].color+ '\'>' + data.labels[i].name + ', </span>');
	                	} else {
	                		$(targetDiv).append('<span style=\'color:#' + data.labels[i].color+ '\'>' + data.labels[i].name + ' </span>');
	                	}
	                	
	                }
            	} else if (data.labels.length == 1){
            		$(targetDiv).append('label: ');
            		for (var i = 0; i < data.labels.length; i++){
            			$(targetDiv).append('<span style=\'color:#' + data.labels[i].color+ '\'>' + data.labels[i].name + ' </span>');
            		}
            	} else {
            		//do nothing
            	}
                $(targetDiv).append('<br><br><br><div style=\'white-space:pre-wrap\'>' + formattedBody + '</div>');



                // list.append('<div class=\'card card-2\' style=\'padding-top:1em\'><div class=\'row\' style=\'margin:3em;\'><div class=\"col-sm-4\"><a href=\''+data.user.html_url +'\'><img width=250px height=250px src=' + data.user.avatar_url +'></a></div><div class=\"col-sm-8\" style=\'font-size:2.5em; padding-left:1em\'><div id=\'targetTitle\'></div></div><div class=\'row\'><div class=\'col-md-12\'><div id=\'targetDiv' + '\'></div></div></div></br>'+'</div></div>');
                //console.log(this.user.avatar_url);
                // list.append('</div></br>'+'</div>')
            }
            $('#comments').getComments(data.comments_url);
    },
    error: function(data){
      $("#valid-user-icon").attr("src", "https://cdn4.iconfinder.com/data/icons/icocentre-free-icons/114/f-cross_256-128.png");
    },
    complete: function(data) {
      //alert('complete')
    }})
}

//fetches the comments and displays them 
jQuery.fn.getComments= function(commentURL){

	var target = this;
	
	$.ajax({
    url: commentURL,
    dataType: "json",
    success: function(data){
      var list = $('#comments');
      target.empty().append(list);
      console.log(data);
      counterY = 0;

      $(data).each(function() {
        	counterY++;
        	var formattedBody = codeFormatText(this.body); 
            if (true) {
            	var d = new Date(this.updated_at);
            	var trimmedBody = formattedBody;
            	list.append('<div class=\'card card-1\' style=\'margin-bottom:3em;width:100%\'><div class=\'row\' style=\'margin:0em;\'><div style=\'padding-left:0px;\' class=\"col-sm-3\"><a href=\''+this.user.html_url +'\'><img width=100% height=100% src=' + this.user.avatar_url +'></a></div><div class=\"col-sm-9\"><div id=\'target' + counterY + '\'></div>' + '</div></br>'+'</div></div>');
                var targetDiv = "#target" + counterY;
                //console.log(targetDiv);
                $(targetDiv).append('<div style=\'font-size:1.3em\'>'+ this.user.login +', <a href=\''+this.html_url +'\'> ' +d.toLocaleDateString() + '</a> <em>'+(this.language?('('+this.language+')'):'')+'</em></div>');
                
                $(targetDiv).append('<br></br><div style=\'white-space:pre-wrap\'>' + trimmedBody + '</div>');
                //console.log(this.user.avatar_url);
                // list.append('</div></br>'+'</div>')
            }
        });      
    },
    error: function(data){
      $("#valid-user-icon").attr("src", "https://cdn4.iconfinder.com/data/icons/icocentre-free-icons/114/f-cross_256-128.png");
    },
    complete: function(data) {
      //alert('complete')
    }})
}


//This function takes an input string and returns a string where ''' has been correctly replaced with the <pre><code> tag(s). Also checks for bold, @user.
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

	var first1 = true;
	while (input.indexOf("**") != -1){
		if(first1 == true){
			input = input.replace("**", "<strong>");
			//console.log(true);
			first1 = false;
		} else {
			input = input.replace("**", "</strong>");
			first1 = true;
		}
	}

	var failsafe = 0;
	while (input.indexOf(" @") != -1 && failsafe <= 9){
		failsafe++;
		var m = input.indexOf(" @");
		var subInput = input.substr(m+1, input.length);
		//console.log(subInput);
		var q = subInput.indexOf(" ");
		var sname = subInput.substr(0,q);
		var urlname = subInput.substr(1, q);
		//console.log(m + ", " + q);
		console.log(sname);
		input = input.replace(sname, "<a href=\'https://github.com/" + urlname + "\'>"+ ".@" + urlname +"</a>");

		// $.ajax({
	 //    url: 'https://api.github.com/users/' + urlname,
	 //    dataType: "json",
	 //    success: function(data){
	 //    	console.log("hit");
	 //    	console.log(input.indexOf(sname));
	 //    	input = input.replace("e", "wASBWE");
	 //      	// input = input.replace(sname, "<a href=\'https://github.com/" + urlname + "\'>"+ ".@." + urlname +"</a>");
	 //    },
	 //    error: function(data){
	 //      //do nothing
	 //    },
	 //    complete: function(data) {
	 //      //alert('complete')
	 //    }})



	}


	//var x = input.indexOf("```");
	//console.log("HERE: " + x);
	//console.log(input);
	return input;
}