# SVRare-js
This is an app to take the resulting sqlite db from SVRare-db and visualise the data using React and Expressjs

## Install
`yarn` to install dependencies.
Works with node V17.2.0.

One can use `nvm` to manage different versions of node.

## Customise environment
Edit `.env` to setup the environment. The React app will run on `PORT`, and the server will run on `SERVER_PORT`. `PUBLIC_PATH` is where bam/vcf files are stored. I usually use `sshfs` to mount a remote server where the files are stored. The bam/vcf files are used to visualise structural variants using `igv.js`
Since the bam/vcf files will be served with Expressjs, the path will need modification, by replacing `/path/to/files` with `http://localhost:9000/files`. In this case, you can assign `/path/to/` to `PATH_REPLACE_ORIGIN`, and `http://localhost:9000/` to `PATH_REPLACE_ORIGIN`.

## Deploy app
Simply run `yarn build`. You can also run `yarn run start` to run in development mode. However in this case the app will use `.env.local` instead of `.env` for setting up environment

## Optional
In case you have a different database makeup, use `squelize-auto` to help generate models
`./node_modules/sequelize-auto/bin/sequelize-auto -d data/svrare.sqlite -e sqlite -l ts -c src/config/database.config.ts -o src/model`

## Large bam / vcf files stored remotely
To load large bam / vcf files remotely, people usually use sshfs.
### sshfs on Mac
Recently `macfuse` stopped being open source, so brewing becomes an issue. Work around:

`brew install --cask macfuse`

`brew install gromgit/fuse/sshfs-mac`