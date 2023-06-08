$(document).ready(function(){
//------------- Work your magic from here-------------------------------------//
    
    //------- Toogle the instructions to Show/Hide----------
    
    $("#toggleInstructions").click(function () { 
        $("#instructions").toggle("fast");
    });

    //-------------Add a task from the main Task Input------

    var primaryTasks = [];

    $("#addTaskBtn").click(function() {
        
        let userTaskInput = $("#taskInput").val();
        primaryTasks.push(userTaskInput);

        $("#taskList").append("<li class='list-item'>" + userTaskInput + "<button class='removeTask'>X</butoon></li>");
        $('#taskInput').val("");
    });

    //------------Save the main tasks into a Saved List------------

    var fullList = [];

    $("#saveListBtn").click(function() {
        let listNameInput = $("#listNameInput").val();

        if(listNameInput && primaryTasks.length > 0){

            // Name of the list on top
            let listMain = $('<div class="saved-list"></div>');
            listMain.append("<h4>" + listNameInput + "<button class='removeList'>X</butoon></h4>");
            
            // Show/Hide Button
            let showHide = $("<button class='show-hide'>Show/Hide Tasks</button>");
            listMain.append(showHide);
            
            listMain.on("click", ".show-hide", function() {
                $(this).siblings("ul").toggle("fast");
            });

            // Date and Time Stamp
            const dateTimeStamp = getCurrentDateTime();
            listMain.append("<p class='timestamp'>" + dateTimeStamp + "</p>");

            // Tasks of the list
            var listTasks = $("<ul></ul>");
            for(let i=0; i < primaryTasks.length; i++) {
                listTasks.append("<li class='list-item'>" + primaryTasks[i] + "<button class='removeTask'>X</butoon></li>");
            }

            // Add new Tasks to Saved Lists
            listMain.append("<input type='text' class='newTaskInput' placeholder='Add a new task'>");
            listMain.append("<button class='addNewTaskBtn'>Add Task</button>");

            // Final function statements
            listMain.append(listTasks);
            addListToDOM(listMain, true);

            fullList.push(listMain);
            saveToLocalStorage();

            // Empty the inputs after Saving
            primaryTasks = [];
            $("#taskList").empty();
            $("#listNameInput").val("");
        }
    });

    //-----------Add a Remove Task button for each task-------------

    $(document).on("click", ".removeTask", function() {
        let taskIndex = $(this).parent().index();
        primaryTasks.splice(taskIndex, 1);
        saveToLocalStorage();
        $(this).parent().slideUp("fast", function() {
            $(this).remove();
            updateFullListFromDOM();
            saveToLocalStorage();
        })
        
    });

    //----------Add a Remove List button for each List--------------

    $(document).on("click", ".removeList", function() {
        let listIndex = $(this).parent().parent().index();
        fullList.splice(listIndex, 1);
        saveToLocalStorage();
        $(this).parent().parent().remove();
    });

    //-----------Produce a way to set a Task as Completed--------------

    $(document).on("click", ".list-item", function() {
        $(this).toggleClass("completed");
    });

    //--------Add Secondary Tasks to an already Saved List-------------

    $(document).on("click", ".addNewTaskBtn", function() {
        let newTaskInput = $(this).prev(".newTaskInput");
        let newTaskValue = newTaskInput.val();

        if (newTaskValue) {
            let taskList = $(this).siblings("ul");
            let newTask = $("<li class='list-item'>" + newTaskValue + "<button class='removeTask'>X</button></li>");
            newTask.hide();
            taskList.append(newTask);
            newTask.slideDown("fast");
            newTaskInput.val("");
        }
        saveToLocalStorage();
    });

    //---------Include a Date/Hour stamp on every Saved List-----------

    function getCurrentDateTime() {
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString("en-GB");
        const formattedTime = currentDate.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit"
        });

        return `${formattedDate} ${formattedTime}`;
      }

    //---------Sort the existing Saved Lists by Name, Date-------------

    $("#sortOptions").on("change", function() {
        const sortByValue = $(this).val();
        let sortedList;

        if (sortByValue === "nameUp") {
            sortedList = sortByNameUp();
        } else if(sortByValue === "nameDown") {
            sortedList = sortByNameDown();
        }else if (sortByValue === "dateUp") {
            sortedList = sortByDateUp();
        } else if (sortByValue === "dateDown") {
            sortedList = sortByDateDown();
        }

        displaySortedLists(sortedList);
    });

    const sortByNameUp = () => {
        return fullList.sort((a, b) => {
            const aName = a.find("h4").text().toLowerCase();
            const bName = b.find("h4").text().toLowerCase();

            if (aName < bName) return -1;
            if (aName > bName) return 1;
            return 0;
        });
    };

    const sortByNameDown = () => {
        return fullList.sort((a, b) => {
            const aName = a.find("h4").text().toLowerCase();
            const bName = b.find("h4").text().toLowerCase();

            if (aName < bName) return 1;
            if (aName > bName) return -1;
            return 0;
        });
    };

    const sortByDateUp = () => {
        return fullList.sort((a, b) => {
            const aDate = new Date(a.find(".timestamp").text());
            const bDate = new Date(b.find(".timestamp").text());
            return aDate - bDate;
          });
    };

    const sortByDateDown = () => {
        return fullList.sort((a, b) => {
            const aDate = new Date(a.find(".timestamp").text());
            const bDate = new Date(b.find(".timestamp").text());
            return bDate - aDate;
          });
    }

    let displaySortedLists = (sortedList) => {
        $("#listsContainer").empty();

        sortedList.forEach((listItem) => {
            $("#listsContainer").append(listItem);
            saveToLocalStorage();
        })
    };

    //------------------Expand/Colapse functionality for Saved Lists----------------------

    $(".show-hide").click(function() {
        $(this).siblings("ul").toggle("fast");
    });

        // Moved inside the #saveListBtn function as well in order to work BEFORE refreshing the page ...


//-----------------------Local Storage functionality----------------------------

    // Save to Local Storage function
    function saveToLocalStorage() {
        const listContent = fullList.map(list => {
            const listName = list.find("h4").map(function() {
                return $(this).text().slice(0, -1);
            }).get()[0];

            const timestamp = list.find(".timestamp").text();
            
            const tasks = list.find("li.list-item").map(function() {
                return $(this).text().slice(0, -1);
            }).get();
    
            return { listName, timestamp, tasks };
        });
    
        localStorage.setItem('fullList', JSON.stringify(listContent));
    };

    // Load from Local Storage function
    function loadFromLocalStorage() {
        const savedData = localStorage.getItem('fullList');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        parsedData.forEach(({ listName, timestamp, tasks }) => {
            let listMain = $('<div class="saved-list"></div>');
            listMain.append("<h4>" + listName + "<button class='removeList'>X</butoon></h4>");

            let showHide = $("<button class='show-hide'>Show/Hide Tasks</button>");
            listMain.append(showHide);

            listMain.on("click", ".show-hide", function() {
                $(this).siblings("ul").toggle("fast");
            });

            listMain.append("<p class='timestamp'>" + timestamp + "</p>");

            var listTasks = $("<ul></ul>");
            for (let i = 0; i < tasks.length; i++) {
                listTasks.append("<li class='list-item'>" + tasks[i] + "<button class='removeTask'>X</butoon></li>");
            }

            listMain.append("<input type='text' class='newTaskInput' placeholder='Add a new task'>");
            listMain.append("<button class='addNewTaskBtn'>Add Task</button>");

            listMain.append(listTasks);

            fullList.push(listMain);
            addListToDOM(listMain, false);
        });
    }
    };

    // Update Lists after removing tasks on Saved Lists
    function updateFullListFromDOM() {
        fullList = [];
        $(".saved-list").each(function () {
            fullList.push($(this));
        });
    };

    /* Function to add the Saved List to the DOM to acept a second parameter 
    so it does not animate twice */

    function addListToDOM (listMain, isNewList) { 
        if (isNewList) {
            listMain.hide();
        }
        $("#listsContainer").append(listMain);
        if (isNewList) {
            listMain.slideDown("fast");
        }
    };

    loadFromLocalStorage();

});