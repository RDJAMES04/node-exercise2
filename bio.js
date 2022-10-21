const csvjson = require('csvjson')
const fs = require('fs')
const process = require('process')
class Biofile {
    constructor (name, sex, age, height, weight){
        this.name = name
        this.sex = sex
        this.age = age
        this.height = height
        this.weight = weight
    }
}
const args = process.argv.slice(2)
const readCsv = (path) => {
    const data = fs.readFileSync(path, { encoding : 'utf8'}) 
    let options = {
      delimiter : ',', 
      quote     : '"',
    }
    return csvjson.toObject(data,options)
}
const csvArray = readCsv('biostats.csv')
let csvMap = new Map(csvArray.map((elem) => [elem.name, elem] ))
const writeData = (csvMap) => {
    let options = {
        delimiter   : ",",
        wrap        : false,
        headers: "key"
    }
    fs.writeFileSync('biostats.csv',csvjson.toCSV(Array.from(csvMap.values()), options), err => {
        if (err) {
          console.error(err)
        }
      })
}
const createData = (mapbio, bioobject) => {
    let storedData = mapbio
    storedData.set(bioobject.name,bioobject)
    return storedData
}
const readData = (name,mapbio) => {
    return mapbio.get(name)
}
const updateData = (mapbio, bioobject) => {
    return mapbio.set(bioobject.name,bioobject)
}
const deleteData = (name,mapbio) => {
    return mapbio.delete(name)
}
if (args[0] === '-c'){
    const [, name,sex,age,height,weight] = args
    const createObject = new Biofile(name,sex,age,height, weight)
    csvMap = createData(csvMap, createObject)
    writeData (csvMap)
}else if(args[0] === '-r'){
    const name = args[1]
    let csvFindArray = readData(name,csvMap)
    console.log(`name: ${csvFindArray.name} \nsex: ${csvFindArray.sex} \nage: ${csvFindArray.age}\nheight: ${csvFindArray.height} in or ${(csvFindArray.height / 2.205).toFixed(2)} cm \nweight: ${csvFindArray.weight} lbs or ${csvFindArray.weight * 2.54} kg`)
}else if(args[0] === '-u'){
    const [, name,sex,age,height,weight] = args
    const createObject = new Biofile(name, sex, age, height, weight)
    csvMap = updateData(csvMap,createObject)
    writeData (csvMap)
}else if(args[0] === '-d'){
    const name = args[1]
    deleteData (name, csvMap)
    writeData (csvMap) 
}
