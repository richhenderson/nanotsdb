# nanoTsDb

NanoTsDb is a tiny JSON based database in Typescript for Deno based on [SimpleDB](https://deno.land/x/simpledb), but since the repository for that is no longer available and some of the types were causing me some errors, I have made some changes.

## How to use

```ts
import { NanoTsDb } from 'https://deno.land/x/nanotsdb@v1.1.0/mod.ts';
const db = new NanoTsDb();
await db.connect();
```

When calling `new NanoTsDb()` you can pass an optional config object as an argument (see examples below).

```ts
{
  filePath: string; // If omitted, a file will be created called db.json
  autosave: boolean; // Default to false
}
```

### Required flags

Ensure you run with the flags: `deno run --allow-read=./ --allow-write=./ myApp.ts`

### Example without autosave

```ts
import { NanoTsDb } from 'https://deno.land/x/nanotsdb@v1.1.0/mod.ts';

/* ===== CREATE A NEW DB INSTANCE ===== */
const pets = new NanoTsDb({ filePath: './pets.json' });
await pets.connect(); //! Required in order to create the JSON file or retrieve saved data

/* ===== INSERT ===== */
const rover = await pets.insertOne({
  name: 'Rover',
  type: 'Dog',
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
await pets.insertMany([
  {
    name: 'Rex',
    type: 'Dog',
    age: 7,
    trained: true,
  },
  {
    name: 'Fluffy',
    type: 'Dog',
    age: 0.1,
    trained: false,
  },
  {
    name: 'Cuddles',
    type: 'Cat',
    age: 10,
    trained: true,
  },
]);
await pets.save();

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
const dogs = await pets.find({ type: 'Dog' });
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
  name: 'Rover',
});

if (findOne === undefined) console.log('Not found!');
else console.log(findOne);
/*
Logs to console:
{ _id: "61bftm6keah7pj4lv03spnen", name: "Rover", type: "Dog", age: 4, trained: true }
*/

/* ===== EXISTS ===== */
console.log(
  await pets.exists({
    name: 'Rover',
  })
); // true

/* ===== FIND ONE AND UPDATE ===== */
const updated = await pets.findOneAndUpdate(
  {
    name: 'Rover',
  },
  {
    age: 5,
  }
);
await pets.save();
console.log(updated);
/*
Logs to console:
{ _id: "61bftm6keah7pj4lv03spnen", name: "Rover", type: "Dog", age: 5, trained: true }
*/

/* ===== DELETE ===== */
if (
  await pets.delete({
    name: 'Rover',
  })
) {
  await pets.save();
  console.log('Successfully deleted!');
}
```

### Example with autosave

By passing `autosave: true` into the constructor, there is no need to call `.save()` as it will save automatically whenever changes are made.

```ts
import { NanoTsDb } from 'https://deno.land/x/nanotsdb@v1.1.0/mod.ts';

/* ===== CREATE A NEW DB INSTANCE ===== */
const pets = new NanoTsDb({
  filePath: './pets.json',
  autosave: true,
});
await pets.connect(); //! Required in order to create the JSON file or retrieve saved data

/* ===== INSERT ===== */
const rover = await pets.insert({
  name: 'Rover',
  type: 'Dog',
  age: 4,
  trained: true,
});
console.log(rover);
/*
Logs to console:
{ _id: "61bftm6keah7pj4lv03spnen", name: "Rover", type: "Dog", age: 4, trained: true }
*/

// add some more pets...
await pets.insertMany([
  {
    name: 'Rex',
    type: 'Dog',
    age: 7,
    trained: true,
  },
  {
    name: 'Fluffy',
    type: 'Dog',
    age: 0.1,
    trained: false,
  },
  {
    name: 'Cuddles',
    type: 'Cat',
    age: 10,
    trained: true,
  },
]);

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
const dogs = await pets.find({ type: 'Dog' });
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
  name: 'Rover',
});

if (findOne === undefined) console.log('Not found!');
else console.log(findOne);
/*
Logs to console:
{ _id: "61bftm6keah7pj4lv03spnen", name: "Rover", type: "Dog", age: 4, trained: true }
*/

/* ===== EXISTS ===== */
console.log(
  await pets.exists({
    name: 'Rover',
  })
); // true

/* ===== FIND ONE AND UPDATE ===== */
const updated = await pets.findOneAndUpdate(
  {
    name: 'Rover',
  },
  {
    age: 5,
  }
);
console.log(updated);
/*
Logs to console:
{ _id: "61bftm6keah7pj4lv03spnen", name: "Rover", type: "Dog", age: 5, trained: true }
*/

/* ===== DELETE ===== */
if (
  await pets.delete({
    name: 'Rover',
  })
) {
  console.log('Successfully deleted!');
}
```

## Disclaimer

This is fine for prototyping a quick proof of concept but you should probably use a real database for production applications.
