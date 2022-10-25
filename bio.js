const csvjson = require('csvjson')
const fs = require('fs')
const process = require('process')

class Biofile {
  constructor(name, sex, age, height, weight) {
    this.name = name[0].toUpperCase() + name.substring(1).toLowerCase()
    this.sex = sex.toUpperCase()
    this.age = Number(age)
    this.height = Number(height)
    this.weight = Number(weight)
  }

  isNameValid() {
    return typeof this.name === 'string'
  }

  isSexValid() {
    return typeof this.sex === 'string'
        && this.sex.length === 1
        && 'FM'.includes(this.sex.toUpperCase())
  }

  isAgeValid() {
    return !Number.isNaN(this.age) && this.age >= 18
  }

  isHeightValid() {
    return !Number.isNaN(this.height) && this.height > 0
  }

  isWeightValid() {
    return !Number.isNaN(this.weight) && this.weight > 0
  }

  checkValues() {
    let invalid = []

    if (!this.isNameValid()) {
      invalid = [...invalid, 'name']
    }

    if (!this.isSexValid()) {
      invalid = [...invalid, 'sex']
    }

    if (!this.isAgeValid()) {
      invalid = [...invalid, 'age']
    }

    if (!this.isHeightValid()) {
      invalid = [...invalid, 'height']
    }

    if (!this.isWeightValid()) {
      invalid = [...invalid, 'weight']
    }

    return invalid.length ? invalid.join(', ') : 'ok'
  }
}

const createBioStatFromData = (name, sex, age, height, weight) => {
  const newBioSat = new Biofile(name, sex, age, height, weight)
  const check = newBioSat.checkValues()

  if (check !== 'ok') {
    console.log(`The following values are invalid: ${check}`)
    return false
  }

  return true
}

const args = process.argv.slice(2)
const readCsv = (path) => {
  const data = fs.readFileSync(path, { encoding: 'utf8' })
  const options = {
    delimiter: ',',
    quote: '"',
  }
  return csvjson.toObject(data, options)
}
const csvArray = readCsv('./biostats.csv')
let csvMap = new Map(csvArray.map((elem) => [elem.name, elem]))
const writeData = (csvFileMap) => {
  const options = {
    delimiter: ',',
    wrap: false,
    headers: 'key',
  }
  fs.writeFileSync('biostats.csv', csvjson.toCSV(Array.from(csvFileMap.values()), options), (err) => {
    if (err) {
      console.error(err)
    }
  })
}

const isExisting = (mapbio, name) => {
  const storedData = mapbio.get(name)
  if (storedData === undefined) {
    console.log(`Account does not exist ${name}`)
    process.exit(0)
  }
  return storedData
}

const createData = (mapbio, bioobject) => {
  const storedData = mapbio
  if (mapbio.get(bioobject.name) === undefined) {
    storedData.set(bioobject.name, bioobject)
    console.log(`Biofile is created ${bioobject.name}`)
  } else {
    console.log('Account exist')
    process.exit(0)
  }
  return storedData
}
const readData = (name, mapbio) => {
  isExisting(mapbio, name)
  return mapbio.get(name)
}
const updateData = (mapbio, bioobject) => {
  isExisting(mapbio, bioobject.name)
  return mapbio.set(bioobject.name, bioobject)
}
const deleteData = (name, mapbio) => {
  isExisting(mapbio, name)
  return mapbio.delete(name)
}
if (args[0] === '-c') {
  const [, name, sex, age, height, weight] = args
  const createObject = new Biofile(name, sex, age, height, weight)

  if (createBioStatFromData(name, sex, age, height, weight) === true) {
    csvMap = createData(csvMap, createObject)
    writeData(csvMap)
  }
} else if (args[0] === '-r') {
  const name = args[1]
  const csvFindArray = readData(name, csvMap)
  console.log(`name: ${csvFindArray.name}\nsex: ${csvFindArray.sex === 'F' ? 'Female' : 'Male'} \nage: ${csvFindArray.age}\nheight: ${csvFindArray.height} in or ${(csvFindArray.height / 2.205).toFixed(2)} cm \nweight: ${csvFindArray.weight} lbs or ${csvFindArray.weight * 2.54} kg`)
} else if (args[0] === '-u') {
  const [, name, sex, age, height, weight] = args
  const createObject = new Biofile(name, sex, age, height, weight)

  if (createBioStatFromData(name, sex, age, height, weight) === true) {
    csvMap = updateData(csvMap, createObject)
    writeData(csvMap)
  }
} else if (args[0] === '-d') {
  const name = args[1]
  deleteData(name, csvMap)
  writeData(csvMap)
}
