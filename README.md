## Example Bertha URL
```
https://bertha.ig.ft.com/view/publish/gss/1mzkZNKncQwrVuNw5GbwMYdY3rT54N8vaGXFEhjnJoJA/data,credits,groups,options
```

To see the original bertha data structure, run `npm run bertha`.

To see the final data structure fed to template, run `npm run dashboard`.

## Run

Compile static assets first:
```
gulp watch
```

Then
```
DEBUG=nums:server nodemon app.js
```

Open browser `localhost:3000`

## See the data structure

Data produced by bertha:

```
npm run bertha
```

Data converted from bertha:

```
npm run models
```

Data used for big numbers:

```
npm run datasets
```

Final json file are put in `public` directory.

## Translate

Put data in `translation/unit.json`.