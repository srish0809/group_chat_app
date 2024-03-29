const form = document.getElementById('chat-form');
const backendAPIs = 'http://localhost:3000/chat';
const chat = document.getElementById('chat');
const searchBoxForm = document.getElementById('form-group');

const token = localStorage.getItem('token');
const groupId = localStorage.getItem('groupId');
const groupName = localStorage.getItem('groupName');
let userEmail = localStorage.getItem('email');
let username = localStorage.getItem('username');

let chatArray = [];
let lastMessageId;


window.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('groupname').innerText = groupName;
    document.getElementById('username').innerText = `Welcome!! ${username.split(" ")[0]}`;

    let message = JSON.parse(localStorage.getItem(`messages${groupId}`));

    if (message == undefined || message.length == 0) {
        lastMessageId = 0;
    } else {
        lastMessageId = message[message.length - 1].id;
    }

    const response = await axios.get(`${backendAPIs}/getMessage/${groupId}?lastMessageId=${lastMessageId}`, { headers: { 'Authorization': token } });
    // console.log(response.data);
    const backendArray = response.data.arrayOfMessages;
    console.log(backendArray);

    if (message) {
        chatArray = message.concat(backendArray);
    } else {
        chatArray = chatArray.concat(backendArray);
    }


    if (chatArray.length > 20) {
        chatArray = chatArray.slice(chatArray.length - 20);
    }

    const localStorageMessages = JSON.stringify(chatArray);

    localStorage.setItem(`messages${groupId}`, localStorageMessages);
    
    chatArray.forEach(ele => {
        if (ele.currentUser) {
            showMyMessageOnScreen(ele);
        } else {
            showOtherMessgeOnScreen(ele);
        }
    });
})

form.addEventListener('click', async (e) => {
    if (e.target.classList.contains('sendchat')) {
        try {
            e.preventDefault();
            const message = e.target.parentNode.message.value;

            const response = await axios.post(`${backendAPIs}/sendMessage/${groupId}`, { message: message }, { headers: { 'Authorization': token } });
            console.log(response.data);
            showMyMessageOnScreen(response.data.data);
            e.target.parentNode.message.value = null;

        } catch (err) {
            console.log(err);
            if (err.response.status == 400) {
                return alert(err.response.data.message);
            }
            return document.body.innerHTML += `<div class="error">Something went wrong !</div>`;
        }

    }
})


searchBoxForm.addEventListener('click', async (e) => {
    if (e.target.classList.contains('search-btn')) {
        try {
            e.preventDefault();
            const email = e.target.parentNode.email.value.trim();
            const response = await axios.post(`${backendAPIs}/addUser/${groupId}`, { email: email }, { headers: { 'Authorization': token } });

            console.log(response);

            alert(response.data.message);
        } catch (err) {
            console.log(err);
            alert(err.response.data.message);
        }

        e.target.parentNode.email.value = "";

    }
})


function showMyMessageOnScreen(obj) {
    const timeForUser = time(obj.createdAt);
    const dateOfUser = date(obj.createdAt);
    chat.innerHTML += `
            <li class="me">
            <div class="entete">
              <h3>${timeForUser}, ${dateOfUser}</h3>
              <h2>${username}</h2>
              <span class="status blue"></span>
            </div>
            <div class="triangle"></div>
            <div class="message">
              ${obj.message}
            </div>
          </li>
          `
}

function showOtherMessgeOnScreen(obj) {
    const timeForUser = time(obj.createdAt);
    const dateOfUser = date(obj.createdAt);

    chat.innerHTML += `
            <li class="you">
                <div class="entete">
                    <span class="status green"></span>
                    <h2>${obj.name}</h2>
                    <h3>${timeForUser}, ${dateOfUser}</h3>
                </div>
                <div class="triangle"></div>
                <div class="message">
                    ${obj.message}
                </div>
            </li>
          `
}




const allName = document.getElementById('group');

const burgerButton = document.querySelector(".burger-button");
const burgerMenu = document.querySelector(".burger-menu");

burgerButton.addEventListener("click", function() {
    burgerButton.classList.toggle("active");
    burgerMenu.classList.toggle("active");
    openBox();
});


let numOfUsers;
async function openBox() {
    const users = await axios.get(`${backendAPIs}/getUsers/${groupId}`);
    // console.log(users.data);
    numOfUsers = users.data.userDetails.length;

    allName.innerHTML = `
    <li class="names"><u>User(${numOfUsers})</u><span style="float:right;"><u>Admin Status</u></span></li>
    `
    if (users.data.adminEmail.includes(userEmail)) {
        users.data.userDetails.forEach(user => {
            displayNameForAdmin(user);
        })
    } else {
        users.data.userDetails.forEach(user => {
            displayNameForOther(user);
        })
    }

}


function displayNameForAdmin(user) {
    if (user.isAdmin) {
        allName.innerHTML += `
        <li class="names" id="name${user.email}">${user.name}<button class="delete" onClick="deleteUser('${user.email}')">X</button><button id="admin${user.email}" class="userButton" onClick="removeAdmin('${user.email}')">remove admin</button></li>
        `
    } else {
        allName.innerHTML += `
        <li class="names" id="name${user.email}">${user.name}<button class="delete" onClick="deleteUser('${user.email}')">X</button><button id="admin${user.email}" class="userButton" onClick="makeAdmin('${user.email}')">make admin</button></li>
        `
    }
    if (user.email == userEmail) {
        document.getElementById(`name${userEmail}`).style.color = "rgb(186, 244, 93)";
    }
}


function displayNameForOther(user) {
    if (user.isAdmin) {
        allName.innerHTML += `
        <li class="names" id="name${user.email}">${user.name}</button><button class="userButton">✔️</button></li>
        `
    } else {
        allName.innerHTML += `
        <li class="names" id="name${user.email}">${user.name}</li>
        `
    }

    if (user.email == userEmail) {
        document.getElementById(`name${userEmail}`).style.color = "rgb(186, 244, 93)";
        document.getElementById(`name${userEmail}`).innerHTML += `
        <button class="delete" onClick="deleteUser('${userEmail}')">X</button>
        `
    }
}

async function makeAdmin(email) {
    // console.log(email);
    try {
        const response = await axios.post(`${backendAPIs}/makeAdmin/${groupId}`, { email: email }, { headers: { 'Authorization': token } });
        console.log(response);
        document.getElementById(`admin${email}`).innerText = 'remove admin';
        document.getElementById(`admin${email}`).setAttribute('onClick', `removeAdmin('${email}')`);

        alert(response.data.message);
    } catch (err) {
        console.log(err);
        alert(err.response.data.message);
    }

}


async function deleteUser(email) {
    if (confirm('Are you sure')) {
        try {
            console.log(email);
            const response = await axios.post(`${backendAPIs}/deleteUser/${groupId}`, { email: email }, { headers: { 'Authorization': token } });
            console.log(response);
            allName.removeChild(document.getElementById(`name${email}`));
            
            numOfUsers = +numOfUsers - 1;
            allName.firstElementChild.firstElementChild.innerText = `User(${numOfUsers})`;

            alert(response.data.message);
        } catch (err) {
            console.log(err);
            alert(err.response.data.message);
        }
    }
}


async function removeAdmin(email) {
    try {
        if(confirm(`Are you sure ?`)){
            console.log(email);
            const response = await axios.post(`${backendAPIs}/removeAdmin/${groupId}`, { email: email }, { headers: { 'Authorization': token } });
            console.log(response);
            document.getElementById(`admin${email}`).innerText = 'make admin';
            document.getElementById(`admin${email}`).setAttribute('onClick', `makeAdmin('${email}')`);
    
            alert(response.data.message);
        }
    } catch (err) {
        console.log(err);
        alert(err.response.data.message);
    }
}



function logout(){
    if(confirm('Are you sure ?')){
        localStorage.clear();
        return window.location.href = './login.html';
    }
}
