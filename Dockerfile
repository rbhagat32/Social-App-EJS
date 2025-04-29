# this file is used to build the docker image for the app
FROM node
WORKDIR /app

# copy package.json and package-lock.json to the working directory
COPY package* .
# docker works in layers and caches the build of each layer
# after one layer is found to be changed, it will rebuild the image from that layer onwards
# so if we directly copy the whole source code, it will rebuild the image every time we change a file in the code
# so it will run npm install every time we change a file in the code
# but it is not required
# we should run npm install only if pagekage.json or package-lock.json is changed
# so we copy only package.json and package-lock.json first
# and then run npm install
RUN npm install
# then we copy the rest of the code
COPY . .
# this way, if we change a file in the code, it will not run npm install again
# because everything till the COPY . . layer is cached

EXPOSE 3000

# all above files are run when the image is built
# the below CMD command is run when the container is started from the image

CMD ["npm", "start"]
# CMD ["npm", "run", "dev"]