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
const data = fs.readFileSync('biostats.csv', { encoding : 'utf8'}) 
let options = {
  delimiter : ',', 
  quote     : '"',
}
const csvArray = csvjson.toObject(data,options)
const writeData = (csvArray) => {
    let options = {
        delimiter   : ",",
        wrap        : false,
        headers: "key"
    }
    fs.writeFileSync('biostats.csv',csvjson.toCSV(csvArray, options), err => {
        if (err) {
          console.error(err)
        }
      })
}
if (args[0] === '-c'){
    const [, name,sex,age,height,weight] = args
    const createObject = new Biofile(name,sex,age,height, weight)
    csvArray.push(createObject)
    writeData (csvArray)
    console.log(csvArray)
   

}else if(args[0] === '-r'){
    const name = args[1]
    let csvFindArray = csvArray.filter(filters => filters.name === name)
    console.log(`name: ${csvFindArray[0].name} \nsex: ${csvFindArray[0].sex} \nage: ${csvFindArray[0].age}\nheight: ${csvFindArray[0].height} in or ${(csvFindArray[0].height / 2.205).toFixed(2)} cm \nweight: ${csvFindArray[0].weight} lbs or ${csvFindArray[0].weight * 2.54} kg`)
}else if(args[0] === '-u'){
    const [, name,sex,age,height,weight] = args
    let csvFindArray = csvArray.filter(filters => filters.name !== name)
    const createObject = new Biofile(name, sex, age, height, weight)
    csvFindArray.push(createObject)
    writeData (csvFindArray)
    console.log(csvFindArray)
}else if(args[0] === '-d'){
    const name = args[1]
    let csvArrayCopy = csvArray.filter(bio => bio.name !== name)
    writeData (csvArrayCopy) 
}
