
/*
  createQuizScript.js
  This file handle the behaviour of the index.html
  */


var questionsFromServer;
var listQuestions = [];
var object;


// INCLUDE in onload
function loadSelect(){

  let categorySelect = document.getElementById("category");
  let difficultySelect = document.getElementById("difficulty");

  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200){
      var selectOptions = JSON.parse(this.responseText); // parses the string version

      // adds the values of the arrays to the select tags for categories
      for (c of selectOptions.cat){
        let cOption = document.createElement("option");
        cOption.text = c;
        categorySelect.add(cOption);
      } // end of c of selectOptions.cat loop

      // adds the values of the arrays to the select tags for difficulties
      for (d of selectOptions.dif){
        let dOption = document.createElement("option");
        dOption.text = d;
        difficultySelect.add(dOption);
      } // end of d of selectOptions.dif loop
    } // end of ready state
  }; // end of XMLHttpRequest

  // get the distinct categories and difficulties from the database for the questions
  xhttp.open("GET", "http://localhost:3000/createquiz", true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send();
}


function selectChange(){

  let cSelect = document.getElementById("category");
  let dSelect = document.getElementById("difficulty");

  // gets the category and difficulty based on what the user has selected
  var categoryText = cSelect.options[cSelect.selectedIndex].text;
  var difficultyText = dSelect.options[dSelect.selectedIndex].text;

  let searchAdd = document.getElementById("search/add");
  // clears the div before we go and add anything
  searchAdd.innerHTML = "";

  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200){
      // console.log(this.responseText);
      let obj = JSON.parse(this.responseText); // parses the string version
      questionsFromServer = obj.questions; // gets the array of questions

      for (var i = 0; i < questionsFromServer.length; i++){
        let questionHREF = document.createElement("a");
        questionHREF.setAttribute("href" , "http://localhost:3000/questions/" + questionsFromServer[i]._id);
        questionHREF.setAttribute("target" , "_blank");
        questionHREF.setAttribute("id" , i);
        questionHREF.innerHTML = questionsFromServer[i].question;

        let checkBox = document.createElement("INPUT");
        checkBox.setAttribute("type" , "checkbox");
        checkBox.setAttribute("onclick" , "addQuestionToDiv()");
        checkBox.setAttribute("id" , i);

        let breakLine = document.createElement("br");

        searchAdd.appendChild(questionHREF);
        searchAdd.appendChild(checkBox);
        searchAdd.appendChild(breakLine);
      } // end of for i in questions loop
    } // end of ready state
  };


  // encodes the string if they have & in them
  var categoryURL = encodeURIComponent(categoryText);
  var difficultyURL = encodeURIComponent(difficultyText);

  // this is 25 questions from the server
  xhttp.open("GET", `http://localhost:3000/questions?category=${categoryURL}&difficulty=${difficultyURL}`, true);
  // set the header to JSON and get the object with the questions
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send();
}


function addQuestionToDiv(){

  let searchAdd = document.getElementById("search/add");
  let questionList = document.getElementById("questionList");
  let qChildren = questionList.childNodes;
  let sAChildren = searchAdd.childNodes;

  for (var i = 0; i < sAChildren.length; i++){
    if (sAChildren[i].tagName == "INPUT" && sAChildren[i].checked == true && sAChildren[i].disabled == false){

      let index = Number(sAChildren[i].id);

      for (q of qChildren){
        if (q.innerHTML === sAChildren[i-1].innerHTML){
          return;
        } // this is the a tag
      }

      // if list question which holds the question on the server doens't have a certain question then we go add it to the server
      if (!listQuestions.includes(questionsFromServer[index])){
        listQuestions.push(questionsFromServer[index]);

        let quesALabel = document.createElement("a");
        quesALabel.setAttribute("href" , "http://localhost:3000/questions/" + questionsFromServer[index]._id);
        quesALabel.setAttribute("target" , "_blank");
        // this is needed so I can get the number of the index from the thing
        quesALabel.setAttribute("id" , index);
        quesALabel.innerHTML = questionsFromServer[index].question;


        let removeCheck = document.createElement("INPUT");
        removeCheck.setAttribute("type" , "checkbox");
        removeCheck.setAttribute("onclick" , "remove()");

        // once the checkbox is pressed you can not add again
        sAChildren[i].disabled = true;

        let breakLine = document.createElement("br");

        questionList.appendChild(removeCheck);
        questionList.appendChild(quesALabel);
        questionList.appendChild(breakLine);
      }
    } // end of if INPUT
  } // end of for i in children loop
}


function remove(){

  let questionList = document.getElementById("questionList");
  let children = questionList.childNodes;

  // resets the questions in the list
  listQuestions = [];

  // O(n-1)
  for (var i = 0; i < children.length; i++){
    if (children[i].tagName == "INPUT"){
      if (children[i].checked == false){
        let index = Number(children[i+1].id);
        listQuestions.push(questionsFromServer[index]);
      }
    } // end of if it is an INPUT
  } // end of for i in children loop

  // now we look through the list and get rid of the checkbox -> a tag -> breakline
  // O(i)
  for (var i = 0; i < children.length; i++){
    if (children[i].tagName == "INPUT" && children[i].checked == true){
      let d = i;

      children[d].parentNode.removeChild(children[d]); // check box
      children[d].parentNode.removeChild(children[d]); // href LINK
      children[d].parentNode.removeChild(children[d]); // breakline
      break;
    }
  }

}
// end of remove function


function saveQuiz(){

  // the object that will be sent back to the server
  let quizPost = {};

  // gets the value of the input fields
  let creator = document.getElementById("creatorName").value;
  let tags = document.getElementById("tags").value;
  tags += " ";
  tags = tags.split(" ");


  // console.log("creator => " + creator.length);
  // console.log("tags.length => " + tags.length);
  // console.log("listQuestions.length => " + listQuestions.length);
  // console.log("listQuestions => " + listQuestions);

  if (creator.length == 0 || tags.length == 1 || listQuestions.length == 0){
    alert("Something Is Not Right. Please check one of the following:\n1. Creator's Name is Not Blank\n2. There is At Least 2 Tags separated by a space i.e. –> \"Math Medium\"\n3. You have inserted Questions from the drop down\n...... :)");
  } else {

    // sets up the object to be sent to server
    quizPost["creator"] = creator;

    // convert the tags to an array by space
    quizPost["tags"] = tags;
    quizPost["questions"] = listQuestions;


    // make the xml request to the server for it beginning a post
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 201){ // status 201 for created

        let quizIdDiv = document.getElementById("yourQuizId");
        quizIdDiv.innerHTML = "";

        // takes the JSON string and parses it
        let link = `http://localhost:3000/quiz/${JSON.parse(this.responseText)}`;
        // window.open(link);
        // make the href link for the transition to the Created Quiz Page in a new page
        let quizIdLink = document.createElement("a");
        quizIdLink.setAttribute("href" , link);
        quizIdLink.setAttribute("id" , "link");
        quizIdLink.setAttribute("target" , "_blank");
        quizIdLink.innerHTML = "Click Me to See Your Quiz: –> " + this.responseText;

        // adds the question to the div
        quizIdDiv.appendChild(quizIdLink);

        alert("Saved Click link to See Quiz!");
      }
    }; // end of ready state

    // create POST here
    xhttp.open("POST", "http://localhost:3000/quizzes", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(quizPost));

  } // end of else

} // end of saveQuiz function


// this clears the div if the user wants to
function clearDiv(){

  console.log("Clearing the div!");
  var confirmChoice = confirm("Are You Sure You Want to Remove Questions and Your Quiz Id Link From DIV!");

  if (confirmChoice){
    let clearDivId = document.getElementById("yourQuizId");
    clearDivId.innerHTML = "";
    let clearDivQuestion = document.getElementById("questionList");
    clearDivQuestion.innerHTML = "";

    // resets the questions in the div to nothing since it was cleared out
    listQuestions = [];
  }
} // end of clearDiv function

// end of program
