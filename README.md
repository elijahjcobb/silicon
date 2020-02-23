# silicon
***silicon*** is a [MongoDB](https://www.mongodb.com/) driver. It wraps the official driver
provided by MongoDB found [here on NPM](https://www.npmjs.com/package/mongodb). silicon simplifies many processes by
providing a type-safe object-oriented wrapper of the MongoDB driver. Also included in silicon is a powerful type-safe
query driver.

## Pages
View [the wiki](https://github.com/elijahjcobb/silicon/wiki) for more information.

## Example
Create an interface for what types your class contains.
```typescript
interface UserProps { name: string; age: number; }
```
Create a class by extending `SiObject<T extends object>` and use your interface.
```typescript
class User extends SiObject<UserProps> {

    public constructor() { super("table-name"); }
	
}
```
Populate the `props` object on a new instance of your class by using the `props` property on your class. It will
contain all the saved properties for your object. 
```typescript
const user: User = new User();

user.props.name = "Elijah";
user.props.age = 20;
```
Communicate with the database from your object by calling methods it contains.
```typescript
await user.create();
await user.update();
await user.update("name");
await user.fetch();
await user.delete();
```

[see more examples...](https://github.com/elijahjcobb/silicon/wiki/Example)
## Features

### Prototyping
Like the example above, you can very easily create an object and use it without having to directly talk to a database.
To view more information on how you can do prototyping, view the [object page](https://github.com/elijahjcobb/silicon/wiki/Object).

### Queries
You can make type-safe queries using the `SiQuery` class. Do helpful things like `count()`, `find()`, `exists()` and
much more. View the [query page](https://github.com/elijahjcobb/silicon/wiki/Query) for more information.

### Type-Safety
Everything is type-safe when you program in [TypeScript](https://www.typescriptlang.org/). Your class properties, and
even queries are all using type checking. So you cannot query for a key that does not exist, try and get a value for an
invalid property name, and much more.

## About

### Language
All of hydrogen is written in [TypeScript](https://www.typescriptlang.org/). If you do not know how to use TypeScript
don't worry. It is completely compatible with JavaScript.

### Why?
I started this package to use in all my different projects. This is sort of a V2 to a package I wrote in 2018.
I took everything I learned from the original package and used it. I named it hydrogen because I think element
names are cool and hydrogen is kind of a building block for different bonds.

### Author/Maintainer
My name is [Elijah Cobb](https://elijahcobb.com/). I am a computer science student at
[Michigan Technological University](https://mtu.edu). I have worked for a few start ups, one right out of high school.
I am now the back-end developer for a few small projects and so this package is sort of the base of all my projects.
When I need a feature I add it to this package.