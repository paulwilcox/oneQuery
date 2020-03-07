
/*
    jsFiddle paging:

    anushree
   - https://stackoverflow.com/questions/19605078/
        how-to-use-pagination-on-html-tables
   - https://jsfiddle.net/u9d1ewsh
*/

export function addPagerToTables(
    tables, 
    rowsPerPage = 10, 
    aTagMax = 10,
    pageInputThreshold = null
) {

    tables = 
        typeof tables == "string"
        ? document.querySelectorAll(tables)
        : tables;

    for (let table of Array.from(tables)) 
        addPagerToTable(table, rowsPerPage, aTagMax, pageInputThreshold);

}

export function addPagerToTable(
    table, 
    rowsPerPage = 10, 
    aTagMax = 10,
    pageInputThreshold = null
) {

    table.rowsPerPage = rowsPerPage;
    table.aTagMax = aTagMax;
    let pages = numPages(table);
    pageInputThreshold = pageInputThreshold || aTagMax;

    if(pages == 1)
        return;

    let colCount = 
        [...table.querySelector('tr').cells]
        .reduce((a,b) => a + parseInt(b.colSpan), 0);

    table.createTFoot().insertRow().innerHTML = `
        <td colspan=${colCount}>
            <div class="oneQueryPageDiv"></div>
        </td>
    `;

    let pageDiv = table.querySelector('.oneQueryPageDiv');
    insertPageLinks(pageDiv, pages);
    //insertPageInput(pageDiv, pages, pageInputThreshold);
    //addPageInputListeners(table);

    changeToPage(table, 1, /*rowsPerPage,*/ pages/*, aTagMax*/);

}

export function addAnchorClickEvents () {

    if (document.hasAnchorClickEvents)
        return;

    document.addEventListener('click', e => {
        if (!e.target.classList.contains('.oneQueryAnchor'))
            return;
        anchorOnClick(e);
    });

    document.hasAnchorClickEvents = true;

}

function anchorOnClick(e) {

    let table = e.target.closest('.oneQueryTable')
    let cPage = currentPage(table);
    let pages = numPages(table);
    let hasLt = e.target.innerHTML.substring(0,3) == '&lt';
    let hasGt = e.target.innerHTML.substring(0,3) == '&gt';
    let rel = e.target.rel;

    let toPage = 
        (hasLt && cPage == 1) ? pages
        : (hasGt && cPage == pages) ? 1
        : (hasLt && rel < 0) ? cPage - 1
        : (hasGt && rel < 0) ? cPage + 1
        : parseInt(rel) + 1;

    changeToPage(
        table, 
        toPage,  
        //rowsPerPage,
        pages/*,
        aTagMax*/
    );
    
}

function insertPageLinks(pageDiv, numPages, aTagMax) {

    let insertA = (rel,innerHtml) =>
        pageDiv.insertAdjacentHTML(
            'beforeend',
            `<a href='#' rel="${rel}" class='.oneQueryAnchor'>${innerHtml}</a> ` 
        );

    insertA(0,'<');
    insertA(-1,'<');

    for(let page = 1; page <= numPages; page++) 
        insertA(page - 1,page);

    insertA(-1,'>');
    insertA(numPages - 1,'>');

}
/*
function insertPageInput(pageDiv, numPages, pageInputThreshold) {

    if (numPages < pageInputThreshold)
        return;

    pageDiv.insertAdjacentHTML(
        'beforeend',
        `
            <br/>
            <div class='oneQueryPageInputDiv' style='display:none;'>
                <div contenteditable='true' class='oneQueryPageInput'>1</div>
                <button class='oneQueryPageInputSubmit'></button>
            </div>
            <label class='oneQueryPageRatio'>${numPages} pages</label>
        `
    );

}
*/
function showInputDiv (tbl, show) {
    if (!tbl.tFoot.querySelector('.oneQueryPageInputDiv'))
        return;
    tbl.tFoot.querySelector('.oneQueryPageInputDiv').style.display = show ? 'inline-block' : 'none';
    tbl.tFoot.querySelector('.oneQueryPageRatio').style.display = show ? 'none' : 'inline-block';
}
/*
function addPageInputListeners (table) {

    if (!table.tFoot.querySelector('.oneQueryPageInputDiv'))
        return;

    let listen = (selector, event, callback) => 
        table.querySelector(selector)
            .addEventListener(event, callback); 

    table.addEventListener(
        'mouseleave',
        e => {
            showInputDiv(e.target, false);
            table.querySelector('.oneQueryPageInput').innerHTML = "";
        }
    );

    listen(
        '.oneQueryPageRatio',
        'mouseenter',
        e => showInputDiv(table, true)
    );

    listen(
        '.oneQueryPageRatio', 
        'click',
        e => showInputDiv(table, true)
    );

    listen(
        '.oneQueryPageInput',
        'mouseenter',
        e => table.querySelector('.oneQueryPageInput').innerHTML = ""
    );

    listen(
        '.oneQueryPageInputSubmit',
        'click',
        e => {

            let pInput = table.querySelector('.oneQueryPageInput');
            let desiredPage = parseInt(pInput.innerHTML);

            if (isNaN(desiredPage)) {
                pInput.innerHTML = "";
                return;
            }

            changeToPage(
                table,
                desiredPage,
                rowsPerPage,
                numPages,
                pageButtonDeviation
            );

        }

    );    

}
*/
function changeToPage(
    table, 
    page, 
    //rowsPerPage, 
    numPages/*, 
    aTagMax*/
) {

    let startItem = (page - 1) * table.rowsPerPage;
    let endItem = startItem + table.rowsPerPage;
    let pageAs = table.querySelectorAll('.oneQueryPageDiv a');
    let tBodyRows = [...table.tBodies].reduce((a,b) => a.concat(b)).rows;

    for (let pix = 0; pix < pageAs.length; pix++) {

        let a = pageAs[pix];
        let aText = pageAs[pix].innerHTML;
        let aPage = parseInt(aText);

        if (page == aPage)
            a.classList.add('active');
        else 
            a.classList.remove('active');

        a.style.display =
            (
                    aPage > page - Math.ceil(table.aTagMax / 2.0) 
                && aPage < page + Math.ceil(table.aTagMax / 2.0)
            )
            || isNaN(aPage) 
            ? 'inline-block'
            : 'none';

        for (let trix = 0; trix < tBodyRows.length; trix++) 
            tBodyRows[trix].style.display = 
                (trix >= startItem && trix < endItem)
                ? 'table-row'
                : 'none';  

    }

}

function currentPage (table) {
    return parseInt(
        table.querySelector('.oneQueryPageDiv a.active').innerHTML
    );
}

function numPages (table) {
    let tBodyRows = table.querySelectorAll(':scope > tBody > tr');
    return Math.ceil(tBodyRows.length/table.rowsPerPage);
}