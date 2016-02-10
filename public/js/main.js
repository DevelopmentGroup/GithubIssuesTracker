
// jQuery.githubUser = function(username, callback) {
//    jQuery.getJSON('https://api.github.com/users/'+username+'/repos?callback=?',callback);
// }


//Constructs a request from the following parameters: project owner, project name, page number (of issues)
jQuery.getIssues = function(username, repoName, pageNumber, callback) {
	jQuery.getJSON('https://api.github.com/repos/' + username + '/' +repoName + '/issues?page='+pageNumber, callback);
}

//Displays up to 30 latest issues into the target div
jQuery.fn.getAndDisplayIssues = function(username, repoName) {
    this.html("<span>Getting issues for " + username +"'s project " + repoName + ".</span>");
     
    var target = this;
    $.getIssues(username, repoName, 1, function(data) {
        var repos = data; // JSON Parsing

        //check if the project has no issues.
        if(Object.keys(data).length <= 0){
        	alert("This project either has no issues (unlikely!) or we failed to retrieve them.");
        }
        sortByUpdateDate(repos);
        console.log(repos);    
     
        var list = $('<dl/>');
        target.empty().append(list);
        $(repos).each(function() {
            if (this.name != (username.toLowerCase()+'.github.com')) {
                list.append('<dt><a href="'+ (this.homepage?this.homepage:this.html_url) +'">' + this.title + '</a> <em>'+(this.language?('('+this.language+')'):'')+'</em></dt>');
                var trimmedBody = trimStringLength(this.body);
                list.append('<dd>' + trimmedBody +'</dd>');
                list.append('<dd>' + this.updated_at + '</dd>');
                list.append('<dd>#' + this.number + '</dd>');
                list.append('</br>');
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


function submitTargetRepo(){
	console.log("ran");
	var inputOwner = $("#input-owner").val();
	var inputRepoName = $("#input-repo-name").val();
	console.log(inputOwner);
	$("#issues-list").getAndDisplayIssues(inputOwner, inputRepoName);
}