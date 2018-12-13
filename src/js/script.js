const btnReturnTop = document.querySelector('.topBtn'),
      addNewUser = document.querySelector('.btn-add-user'),
      btnPullUsers = document.querySelector('.pull-users'),
      btnSaveChange = document.querySelector('#btnSaveChange'),
      blockPullUsers = document.querySelector('#pull-data'),
      stateDisplay = getComputedStyle(blockPullUsers, null),
      formAddUser = document.querySelector('#add-user-form'),
      formEdidUser = document.querySelector('#edid-user-form'),
      blockUserCards = document.querySelector('.user-cards');

const URL = 'https://test-users-api.herokuapp.com';

window.onscroll = () => {
  if (document.documentElement.scrollTop > 300) {
    btnReturnTop.classList.add('showTopButton');
  } else {
    btnReturnTop.classList.remove('showTopButton');
  }
};

function scrollTop() {
  let scrollStep = -window.scrollY / 30;
  let scrollInterval = setInterval(() => {
    if (window.scrollY != 0) {
      window.scrollBy(0, scrollStep);
    } else {
      clearInterval(scrollInterval);
    }
  }, 15);
}

btnReturnTop.addEventListener("click", () => scrollTop());

let idClickUser;

class PanelUsers {
  constructor(user, sectionUsers, deleteCard) {
    this.user = user;
    this.sectionUsers = sectionUsers;
    this.renderCardUser();
    this.deleteCard = deleteCard;
  }

  deleteDivCard(divCard) {
    this.deleteCard();
    divCard.remove();
  }

  renderCardUser() {
    let divCard = document.createElement('div'),
        divView = document.createElement('div'),
        divCardBody = document.createElement('div'),
        avatar = document.createElement('img'),
        userName = document.createElement('h4'),
        textAge = document.createElement('p'),
        ageUser = document.createElement('span'),
        editUser = document.createElement('a'),
        delUser = document.createElement('a');

    const photoUser = `img/newUser.png`;

    divCard.className = 'card';
    divView.className = 'view overlay';
    divCardBody.className = 'card-body';
    avatar.className = 'card-img-top';
    userName.className = 'card-title';
    textAge.className = 'card-text';
    ageUser.className = 'age-user';
    editUser.id = 'btn-edit';
    delUser.id = 'btn-delete';

    avatar.src = photoUser;
    divView.append(avatar);
    userName.innerText = this.user.name;
    divCardBody.prepend(userName);
    textAge.innerText = 'Age: ';
    ageUser.innerText = this.user.age;
    textAge.append(ageUser);
    divCardBody.append(textAge);
    editUser.innerText = 'Edit';
    divCardBody.append(editUser);
    delUser.innerText = 'Delete';
    divCardBody.append(delUser);
    divCard.prepend(divView);
    divCard.append(divCardBody);
    this.sectionUsers.prepend(divCard);

    delUser.addEventListener("click", () => {
      this.deleteDivCard(divCard);
    });

    editUser.addEventListener("click", () => {
      $('#editDataUser').modal();
      idClickUser = ctrl.editUser.bind(null, userName, ageUser, this.user.id);
    });

    return divCard;
  }
}

class ControlPanel {
  constructor(URL, sectionUsers) {
    this.url = URL;
    this.sectionUsers = sectionUsers;
    this.users = [];
  }

  async getUsers() {
    try {
      const users = await axios.get(`${this.url}/users/`)
      blockUserCards.innerHTML = '';
      const arrUsers = users.data.data;
      arrUsers.forEach((user) => {
        this.users.push(new PanelUsers(user, blockUserCards,
          this.deleteUser.bind(this, user.id)));
      });
    } catch (err) {
      alert(err);
    }
  }

  async createOneUser() {
    const name = document.querySelector('#id-name').value,
      age = Number(document.querySelector('#id-age').value);

    if (name === '' || age <= 0) {
      alert("Please, fill in all fields");
    } else if (stateDisplay.display == "block") {
      alert("First you need to output users from the server!");
    } else {
      try {
        const createNewUser = await axios.post(`${this.url}/users/`, {
          name,
          age
        })
        const showName = createNewUser.data.data.name;
        formAddUser.reset();
        toastr.success(`Added new user: ${showName}`);
      } catch (err) {
        alert(err);
      }
      this.getUsers();
    }
  }

  async editUser(userName, ageUser, id) {
    let name = document.querySelector('#edit-name').value,
      age = Number(document.querySelector('#edit-age').value);

    if (name == "" && age <= 0) {
      return alert("You can not save. Fill in fields (name and age or name or age).");
    } else if (name == "" && age > 0) {
      name = userName.innerText;
    } else if (name && age <= 0) {
      age = ageUser.innerText;
    }

    try {
      const response = await axios.put(`${URL}/users/${id}`, {
        name,
        age
      })
      const data = response.data.data;
      userName.innerText = data.name;
      ageUser.innerText = data.age;
      formEdidUser.reset();
    } catch (err) {
      alert(err);
    }
  }

  async deleteUser(id) {
    try {
      const response = await axios.delete(`${this.url}/users/${id}`);
    } catch (err) {
      alert(err);
    }
  }

}

const ctrl = new ControlPanel(URL, blockUserCards);

btnPullUsers.addEventListener("click", () => {
  blockPullUsers.classList.add('pull-data-display');
  ctrl.getUsers();
});
btnSaveChange.addEventListener("click", () => idClickUser());
addNewUser.addEventListener("click", () => ctrl.createOneUser());