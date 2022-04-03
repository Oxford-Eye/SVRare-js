# SVRare-js
This is an app to take the resulting sqlite db and visualise the data using React and Expressjs

## Usage
1. `yarn` to install dependencies
2. Use `squelize-auto` to help generate models
`./node_modules/sequelize-auto/bin/sequelize-auto -d data/svrare.sqlite -e sqlite -l ts -c src/config/database.config.ts -o src/model`
