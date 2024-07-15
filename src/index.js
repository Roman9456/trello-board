import './styles.css';

const board = document.getElementById('board');

const initialState = {
  columns: [
    { id: 1, title: 'To Do', cards: [] },
    { id: 2, title: 'In Progress', cards: [] },
    { id: 3, title: 'Done', cards: [] },
  ],
};

const state = JSON.parse(localStorage.getItem('boardState')) || initialState;

const saveState = () => {
  localStorage.setItem('boardState', JSON.stringify(state));
};

const createCardElement = (card, column) => {
  const cardElement = document.createElement('div');
  cardElement.className = 'card';
  cardElement.textContent = card.text;
  cardElement.draggable = true;

  cardElement.ondragstart = (event) => {
    event.dataTransfer.setData('text/plain', JSON.stringify({ card, columnId: column.id }));
    setTimeout(() => {
      cardElement.classList.add('hide');
    }, 0);
  };

  cardElement.ondragend = () => {
    cardElement.classList.remove('hide');
  };

  const deleteButton = document.createElement('button');
  deleteButton.textContent = '×';
  deleteButton.className = 'delete-button';
  deleteButton.onclick = () => {
    column.cards = column.cards.filter(c => c !== card);
    saveState();
    renderBoard();
  };

  cardElement.appendChild(deleteButton);
  return cardElement;
};

const createColumnElement = (column) => {
  const columnElement = document.createElement('div');
  columnElement.className = 'column';

  const columnTitle = document.createElement('h2');
  columnTitle.className = 'column-title';
  columnTitle.textContent = column.title;
  columnElement.appendChild(columnTitle);

  const cardList = document.createElement('div');
  cardList.className = 'card-list';
  cardList.ondragover = (event) => {
    event.preventDefault();
  };

  cardList.ondrop = (event) => {
    event.preventDefault();
    const data = JSON.parse(event.dataTransfer.getData('text/plain'));
    const sourceColumn = state.columns.find(col => col.id === data.columnId);
    const targetCardList = event.currentTarget;
    const targetColumn = state.columns.find(col => col.id === column.id);

    const cardIndex = sourceColumn.cards.findIndex(c => c === data.card);
    const [card] = sourceColumn.cards.splice(cardIndex, 1);

    // Get the target card index
    const targetCard = event.target.closest('.card');
    if (targetCard) {
      const targetCardIndex = Array.from(targetCardList.children).indexOf(targetCard);
      targetColumn.cards.splice(targetCardIndex, 0, card);
    } else {
      targetColumn.cards.push(card);
    }

    saveState();
    renderBoard();
  };

  column.cards.forEach(card => {
    cardList.appendChild(createCardElement(card, column));
  });

  const addCardButton = document.createElement('button');
  addCardButton.className = 'add-card-button';
  addCardButton.textContent = 'Add another card';
  addCardButton.onclick = () => {
    const cardText = prompt('Enter card text');
    if (cardText) {
      column.cards.push({ text: cardText });
      saveState();
      renderBoard();
    }
  };

  columnElement.appendChild(cardList);
  columnElement.appendChild(addCardButton);
  return columnElement;
};

const renderBoard = () => {
  board.innerHTML = '';
  state.columns.forEach(column => {
    board.appendChild(createColumnElement(column));
  });
};

renderBoard();
