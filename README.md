## Example Bertha URL
```
https://bertha.ig.ft.com/view/publish/gss/1mzkZNKncQwrVuNw5GbwMYdY3rT54N8vaGXFEhjnJoJA/data,credits,groups,options
```

## Run Server

Production:

Refer to [node-deployer](https://gitlab.com/ftchinese/node-deployer)

Development:
```
npm start
```

## NPM Commands

* `npm run model` Fetch data from bertha, transform them and write to `.tmp/*.json`.
* `npm run clean` Remove `.tmp` and `public` folder
* `npm run build-static` Build static htm files for `china-dashboard`
* `npm run build` Run `build-sass && build-js`. This is used for server automation.

## Translate

Put data in `utils/unit.json`.

## Legacy Static Page
If you prefer to continue to maintain legacy static page, take the following steps:

* Get data: `npm run models`
* Preview: `gulp serve`