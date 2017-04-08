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

## Bust Cache

```
localhost:3000/__operations/refresh
```

This is purge cache both on our server and bertha. It will force bertha to fetch a fresh copy of data on Google Sheets, and the fetched data will be immediately cached on our server.