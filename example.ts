import { NanoTsDb } from "./mod.ts";

/* ===== CREATE A NEW DB INSTANCE ===== */
const pets = new NanoTsDb({ filePath: "./pets.json" }); // or 'new SimpleDB();' to create a database with the default name "pets.json"
await pets.connect(); //! Required in order to create the JSON file or retrieve saved data

/* ===== INSERT ===== */
const rover = await pets.insert({
  name: "Rover",
  type: "Dog",
  age: 4,
  trained: true,
});
await pets.save();
console.log(rover);
/*
Logs to console:
{ _id: "61bftm6keah7pj4lv03spnen", name: "Rover", type: "Dog", age: 4, trained: true }
*/

// add some more pets...
[{
  name: "Rex",
  type: "Dog",
  age: 7,
  trained: true,
}, {
  name: "Fluffy",
  type: "Dog",
  age: 0.1,
  trained: false,
}, {
  name: "Cuddles",
  type: "Cat",
  age: 10,
  trained: true,
}].forEach(async (pet) => {
  await pets.insert(pet);
});

/* ===== FIND ALL ===== */
const allPets = await pets.find();
console.log(allPets);
/*
Logs to console:
[
  {
    _id: "61bftm6keah7pj4lv03spnen",
    name: "Rover",
    type: "Dog",
    age: 4,
    trained: true,
  },
  {
    _id: "dpg8h7bi2oe65kvl1zpaci91",
    name: "Rex",
    type: "Dog",
    age: 7,
    trained: true,
  },
  {
    _id: "g1o5w3imcyao2isloysnoddg",
    name: "Fluffy",
    type: "Dog",
    age: 0.1,
    trained: false,
  },
  {
    _id: "e4xebp36gw576inr4zt7exly",
    name: "Cuddles",
    type: "Cat",
    age: 10,
    trained: true,
  },
];
*/

/* ===== FIND SOME ===== */
const dogs = await pets.find({ type: "Dog" });
console.log(dogs);
/*
Logs to console:
[
  {
    _id: "61bftm6keah7pj4lv03spnen",
    name: "Rover",
    type: "Dog",
    age: 4,
    trained: true,
  },
  {
    _id: "dpg8h7bi2oe65kvl1zpaci91",
    name: "Rex",
    type: "Dog",
    age: 7,
    trained: true,
  },
  {
    _id: "g1o5w3imcyao2isloysnoddg",
    name: "Fluffy",
    type: "Dog",
    age: 0.1,
    trained: false,
  },
];
*/

/* ===== FIND ONE ===== */
const findOne = await pets.findOne({
  name: "Rover",
});

if (findOne === undefined) console.log("Not found!");
else console.log(findOne);
/*
Logs to console:
{ _id: "61bftm6keah7pj4lv03spnen", name: "Rover", type: "Dog", age: 4, trained: true }
*/

/* ===== EXISTS ===== */
console.log(
  await pets.exists({
    name: "Rover",
  }),
); // true

/* ===== FIND ONE AND UPDATE ===== */
const updated = await pets.findOneAndUpdate({
  name: "Rover",
}, {
  age: 5,
});
await pets.save();
console.log(updated);
/*
Logs to console:
{ _id: "61bftm6keah7pj4lv03spnen", name: "Rover", type: "Dog", age: 5, trained: true }
*/

/* ===== DELETE ===== */
if (
  await pets.delete({
    name: "Rover",
  })
) {
  await pets.save();
  console.log("Successfully deleted!");
}
