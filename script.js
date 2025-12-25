let players = JSON.parse(localStorage.getItem('yahtzee_players')) || [];
let activePlayerIndex = 0;

const categories = [
    { name: "Assi (1)", section: "upper", diceVal: 1 },
    { name: "Due (2)", section: "upper", diceVal: 2 },
    { name: "Tre (3)", section: "upper", diceVal: 3 },
    { name: "Quattro (4)", section: "upper", diceVal: 4 },
    { name: "Cinque (5)", section: "upper", diceVal: 5 },
    { name: "Sei (6)", section: "upper", diceVal: 6 },
    { name: "TOTALE SUP.", section: "upper-total", readonly: true },
    { name: "BONUS (+35)", section: "bonus", readonly: true },
    { name: "Tris", section: "lower" },
    { name: "Poker", section: "lower" },
    { name: "Full House (25)", section: "lower", fixedValue: 25 },
    { name: "Scala Piccola (30)", section: "lower", fixedValue: 30 },
    { name: "Scala Grande (40)", section: "lower", fixedValue: 40 },
    { name: "Yahtzee (50)", section: "lower", fixedValue: 50 },
    { name: "Chance", section: "lower" },
    { name: "YAHTZEE BONUS", section: "lower", isYahtzeeBonus: true },
    { name: "TOTALE FINALE", section: "grand-total", readonly: true }
];

function renderTable() {
    const headerRow = document.getElementById('header-row');
    const tableBody = document.getElementById('table-body');
    if(!headerRow || !tableBody) return;

    headerRow.innerHTML = '<th>Categorie</th>';
    tableBody.innerHTML = '';

    players.forEach((player, pIdx) => {
        const turns = countFilledCells(pIdx);
        const isActive = activePlayerIndex === pIdx ? 'active-player-col' : '';
        headerRow.innerHTML += `
            <th onclick="setActivePlayer(${pIdx})" class="${isActive}">
                <div class="player-head">
                    <span>${player}</span>
                    <span class="turn-counter">${turns >= 13 ? "✅" : turns + "/13"}</span>
                    <button onclick="deletePlayer(${pIdx})" class="btn-del">X</button>
                </div>
            </th>`;
    });

    categories.forEach((cat, catIdx) => {
        let row = `<tr><td>${cat.name}</td>`;
        players.forEach((_, pIdx) => {
            const savedValue = localStorage.getItem(`score-${pIdx}-${catIdx}`) || '';
            const isActive = activePlayerIndex === pIdx ? 'active-player-col' : '';
            
            if (cat.readonly) {
                row += `<td id="cell-${pIdx}-${catIdx}" class="cell-readonly ${isActive}">0</td>`;
            } else if (cat.diceVal) {
                // LOGICA SMART PARTE ALTA
                const score = parseInt(savedValue) || 0;
                const numDice = savedValue === '' ? 0 : score / cat.diceVal;
                row += `<td class="${isActive}">
                    <button class="smart-input-btn ${score > 0 ? 'active' : ''}" onclick="cycleUpperScore(${pIdx}, ${catIdx}, ${cat.diceVal})">
                        ${score === 0 && savedValue !== '' ? '0' : (score || '---')}
                        <span>${numDice > 0 ? numDice + ' dadi' : ''}</span>
                    </button>
                </td>`;
            } else if (cat.isYahtzeeBonus) {
                const count = parseInt(savedValue) || 0;
                row += `<td class="${isActive}"><button class="btn-yahtzee-bonus ${count > 0 ? 'active' : ''}" onclick="addYahtzeeBonus(${pIdx}, ${catIdx})">${count > 0 ? 'x' + count : '---'}</button></td>`;
            } else if (cat.fixedValue) {
                row += `<td class="${isActive}"><button class="btn-fixed ${savedValue !== '' ? 'active' : ''}" onclick="toggleFixedScore(${pIdx}, ${catIdx}, ${cat.fixedValue})">${savedValue === '' ? '---' : savedValue}</button></td>`;
            } else {
                row += `<td class="${isActive}"><input type="number" value="${savedValue}" oninput="saveScore(${pIdx}, ${catIdx}, this.value)" class="score-input"></td>`;
            }
        });
        tableBody.innerHTML += row + `</tr>`;
    });
    calculateAll();
}

// Incrementa il punteggio parte alta: 1 dado -> 2 -> 3 -> 4 -> 5 -> 0 -> svuota
function cycleUpperScore(pIdx, catIdx, diceVal) {
    const currentRaw = localStorage.getItem(`score-${pIdx}-${catIdx}`);
    let newVal;

    if (currentRaw === null || currentRaw === '') newVal = diceVal; // 1 dado
    else {
        const currentScore = parseInt(currentRaw);
        const currentDice = currentScore / diceVal;
        if (currentDice < 5) newVal = (currentDice + 1) * diceVal;
        else if (currentDice === 5 && currentScore !== 0) newVal = 0; // Segna zero
        else newVal = ''; // Svuota
    }

    localStorage.setItem(`score-${pIdx}-${catIdx}`, newVal);
    renderTable();
}

function countFilledCells(pIdx) {
    let filled = 0;
    categories.forEach((cat, catIdx) => {
        if (!cat.readonly && !cat.isYahtzeeBonus) {
            const val = localStorage.getItem(`score-${pIdx}-${catIdx}`);
            if (val !== null && val !== '') filled++;
        }
    });
    return filled;
}

function setActivePlayer(i) {
    activePlayerIndex = i;
    renderTable();

    // Scroll automatico corretto
    setTimeout(() => {
        const container = document.querySelector('.table-container');
        const activeHeaders = document.querySelectorAll('.active-player-col');
        
        if (activeHeaders.length > 0 && container) {
            const activeCol = activeHeaders[0];
            const categoriesWidth = 145; // Corrisponde alla larghezza min-width nel CSS
            const paddingSafety = 10;    // Piccolo margine extra per non appiccicarlo al bordo

            // Calcoliamo la posizione: posizione della colonna meno la larghezza della parte fissa
            const scrollTarget = activeCol.offsetLeft - categoriesWidth - paddingSafety;

            container.scrollTo({ 
                left: Math.max(0, scrollTarget), // Evita valori negativi
                behavior: 'smooth' 
            });
        }
    }, 100);
}

function toggleFixedScore(pIdx, catIdx, val) {
    const curr = localStorage.getItem(`score-${pIdx}-${catIdx}`);
    let newVal = (curr === null || curr === '') ? val : (parseInt(curr) === val ? 0 : '');
    localStorage.setItem(`score-${pIdx}-${catIdx}`, newVal);
    renderTable();
}

function saveScore(pIdx, catIdx, value) {
    const trimmedValue = value.trim();
    if (trimmedValue === '') {
        localStorage.removeItem(`score-${pIdx}-${catIdx}`);
    } else {
        localStorage.setItem(`score-${pIdx}-${catIdx}`, trimmedValue);
    }
    renderTable();
}

function addYahtzeeBonus(pIdx, catIdx) {
    let count = (parseInt(localStorage.getItem(`score-${pIdx}-${catIdx}`)) || 0) + 1;
    if (count > 3) count = 0;
    localStorage.setItem(`score-${pIdx}-${catIdx}`, count);
    renderTable();
}

function calculateAll() {
    players.forEach((player, pIdx) => {
        let upper = 0, lower = 0, yBonus = 0;
        categories.forEach((cat, catIdx) => {
            const val = parseInt(localStorage.getItem(`score-${pIdx}-${catIdx}`)) || 0;
            if (cat.readonly) return;
            if (cat.isYahtzeeBonus) yBonus = val * 100;
            else if (cat.section === 'upper') upper += val;
            else lower += val;
        });
        const bonus = upper >= 63 ? 35 : 0;
        const total = upper + bonus + lower + yBonus;
        
        const cU = document.getElementById(`cell-${pIdx}-6`);
        const cB = document.getElementById(`cell-${pIdx}-7`);
        const cF = document.getElementById(`cell-${pIdx}-16`);

        if(cU) cU.innerText = upper;
        if(cB) cB.innerHTML = bonus > 0 ? bonus : `${bonus} <span class="dist-bonus">-${63-upper}</span>`;
        if(cF) cF.innerText = total;
    });
    updateLeaderboard();
}

function updateLeaderboard() {
    const bar = document.getElementById('status-bar');
    const text = document.getElementById('winner-text');
    if (!players.length) return;
    
    let scores = players.map((name, i) => {
        let total = 0;
        categories.forEach((cat, catIdx) => {
            if (cat.name === "TOTALE FINALE") {
                const cell = document.getElementById(`cell-${i}-${catIdx}`);
                total = cell ? parseInt(cell.innerText) : 0;
            }
        });
        return { name, score: total };
    });

    scores.sort((a, b) => b.score - a.score);
    if (scores[0].score > 0) {
        text.innerHTML = `🏆 <strong>${scores[0].name}</strong>: ${scores[0].score} pt`;
        bar.style.background = "#27ae60";
    }
}

function addNewPlayer() {
    const input = document.getElementById('player-name');
    if (input && input.value.trim()) {
        players.push(input.value.trim());
        localStorage.setItem('yahtzee_players', JSON.stringify(players));
        input.value = ""; renderTable();
    }
}

function deletePlayer(i) {
    if (confirm("Eliminare giocatore?")) {
        players.splice(i, 1);
        localStorage.setItem('yahtzee_players', JSON.stringify(players));
        renderTable();
    }
}

function resetGame() {
    if (confirm("Iniziare una nuova partita? I punteggi verranno azzerati ma i giocatori saranno preservati.")) {
        // Cancella solo i punteggi, non i giocatori
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('score-')) {
                localStorage.removeItem(key);
            }
        });
        activePlayerIndex = 0;
        renderTable();
    }
}

renderTable();