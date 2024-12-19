/**
 * Checks if the load more button is visible, and clicks it
 */
async function checkAllOpen(){
    const loadButton = document.getElementById("load_more_button")
    if(loadButton === null){
        return
    }
    while(true){
        const buttonVisible = loadButton.checkVisibility()
        if(buttonVisible){
            loadButton.click()
            await new Promise(res => setTimeout(res, 7000))
        }
        else{
            return
        }
    }
}

/**
 * Gets the rows from the table
 * @returns {Array<any>} An array that contains each row element
 */
async function getTableRows(){
try{
const tableRows = document.getElementsByClassName("wallet_table_row")
if(tableRows.length === 0){
    return []
}
const tableRowArr = Array.from(tableRows)

const filteredRows = tableRowArr.filter(row => {
    const typeElement = row.getElementsByClassName("wht_type ")
    if(typeElement && typeElement[0].children){
        if(typeElement[0].children[0].textContent === "Purchase")
        return row
    }
})

return filteredRows
}
catch(error){
    console.log(error)
    return []
}
}

function isGiftCardPurchase(walletChangeElement){
    try{
    walletChangeStr = walletChangeElement[0].innerText
    if(walletChangeStr){
        return walletChangeStr.includes("+")
    }
    return false
    } catch(error){
        console.log(error)
        return false
    }
}

async function getValues(rows){
    try{
        const valueStrings = rows.map(row => {
            const totalValueElement = row.getElementsByClassName("wht_total")
            const walletChangeElement = row.getElementsByClassName("wht_wallet_change")

            if(totalValueElement && !isGiftCardPurchase(walletChangeElement)){
                if(totalValueElement[0].className !== "wht_total wht_refunded"){
                    return totalValueElement[0].innerText
                }
            }
        }).filter(e => e !== undefined)

        return valueStrings
    } catch(error){
        console.log(error)
        return []
}
}

async function getValuesByCurrency(valueStrings){
    /* currencies = ["€", "R$"] */
    currencies = [{symbol: "€", name: "EUR"},{symbol: "R$", name: "BRL"}]
    valueArr = []
    try{
        for(const currency of currencies){
            const values = []

            for(valueStr of valueStrings){
                if(valueStr.includes(currency.symbol)){
                    let adjustedStr = valueStr.replace(/[^0-9,]/gi, "")
                    adjustedStr = adjustedStr.replace(/,/gi, ".")

                    if(!isNaN(adjustedStr)){
                        values.push(parseFloat(adjustedStr))
                    }
                }
            }
            
            const totalValue = values.reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0,
            );

            valueArr.push({currency: currency, values: values, totalValue: totalValue.toFixed(2)})
        }
        return valueArr
    } catch(error){
        for(currency of currencies){
            valueArr.push({currency: currency, values: [], totalValue: 0})
        }
        return valueArr
    }
}

async function getTotalPurchaseCosts(){
    await checkAllOpen()
    const rows = await getTableRows()
    const valueStrings = await getValues(rows)
    const valueObjects = await getValuesByCurrency(valueStrings)
    
    console.clear()
    console.log("-".repeat(30))
    console.log("TOTAL:")
    valueObjects.forEach(e => {
        console.log(`${e.totalValue}${e.currency.name}`)
    })
    console.log("-".repeat(30))
}

await getTotalPurchaseCosts()