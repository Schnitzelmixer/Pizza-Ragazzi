function createHighscoreTable(tableData) {

    /*Variablen für die einzelnen Tabellenbestandteile   */
    const table = document.createElement('table');
    const tableBody = document.createElement('tbody');
    const tableHead = document.createElement('thead');

    /*erstellt die Titel/Beschriftung*/
    const rowHead = document.createElement('tr');
    const cellHeadRank = document.createElement('th');
    cellHeadRank.appendChild(document.createTextNode("Rang"));
    rowHead.appendChild(cellHeadRank);
    const cellHeadName = document.createElement('th');
    cellHeadName.appendChild(document.createTextNode("Name"));
    rowHead.appendChild(cellHeadName);
    const cellHeadScore = document.createElement('th');
    cellHeadScore.appendChild(document.createTextNode("Punkte"));
    rowHead.appendChild(cellHeadScore);
    tableHead.appendChild(rowHead);

    /*Sortiert die Tabelle nach Punktewerten*/
    tableData.sort(sortFunction);

    function sortFunction(a, b) {
        let aInt = parseInt(a[1], 10);
        let bInt = parseInt(b[1], 10);
        if (aInt === bInt) {
            return 0;
        } else {
            return (aInt > bInt) ? -1 : 1;
        }
    }

    /*Iteriert über das 2D Array*/
    tableData.forEach(function (rowData, index) {
        const row = document.createElement('tr');

        const cellRank = document.createElement('th');
        cellRank.appendChild(document.createTextNode(index + 1));
        row.appendChild(cellRank);

        rowData.forEach(function (cellData) {
            const cell = document.createElement('td');
            cell.appendChild(document.createTextNode(cellData));
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
    table.appendChild(tableHead);
    table.appendChild(tableBody);
    document.body.appendChild(table);
}

function getTableData() {
    fetch("/highscore/getTableData")
        .then(result => result.json())
        .then(result => createHighscoreTable(result));
}

