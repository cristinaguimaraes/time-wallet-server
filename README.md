# Time Wallet (Server)

This is the repo for the server and blockchain network for Time Wallet. For more information on the app or instructions on setting up the client side, please see [time-wallet-client](https://github.com/redspanner/time-wallet-client)

# Running the Backend

## Prerequisite
- [npm] (https://www.npmjs.com/)  
- [mySql] (https://www.mysql.com/)
- [Node] (https://nodejs.org/en/)
- [Docker](https://www.docker.com/)
- [Hyperledger Composer](https://hyperledger.github.io/composer/installing/development-tools.html)
* to install composer cli
  `npm install -g composer-cli`
* to install composer-rest-server
  `npm install -g composer-rest-server`
* to install generator-hyperledger-composer
  `npm install -g generator-hyperledger-composer`

## Steps
  1. [Clone the repo](#1-clone-the-repo)
  2. [Setup Fabric](#2-setup-fabric)
  3. [Generate the Business Network     Archive](#3-generate-the-business-network-archive)
  4. [Deploy to Fabric](#4-deploy-to-fabric)
  5. [Set up mySql](#5-clone-the-repo)

## 1. Clone the Repo

  Clone the `time-wallet-server code` locally. In a terminal, run:

  `git clone https://github.com/cristinaguimaraes/time-wallet-server.git`

## 2. Setup Fabric

This command will kill and remove all running containers, and should remove all previously created HyperLedger Fabric chaincode images:

```none
docker kill $(docker ps -q)
docker rm $(docker ps -aq)
docker rmi $(docker images dev-* -q)
```

Set Hyperledger Fabric version to v1.0:

`export FABRIC_VERSION=hlfv1`

All the scripts will be in the directory `/fabric-tools`.  Start fabric and create peer admin card:

```
cd fabric-tools/
./downloadFabric.sh
./startFabric.sh
./createPeerAdminCard.sh
```

## 3. Generate the Business Network Archive

Next generate the Business Network Archive (BNA) file from the root directory:

```
cd ../time-currency-network/
composer archive create -t dir -n
```
## 4. Deploy to Fabric

Now we can deploy the network to Hyperledger Fabric. First the Hyperledger Composer chaincode needs to be installed on the peer. Then the business network archive (.bna) must be sent to the peer, and a new participant, identity and associated card m2

```
composer runtime install -c PeerAdmin@hlfv1 -n time-currency-network

composer network start --card PeerAdmin@hlfv1 --networkAdmin admin --networkAdminEnrollSecret adminpw --archiveFile time-currency-network@0.0.1.bna --file networkadmin.card
```

## 5. Set up mySql

In the terminal, run:

```
mysql --password -u root
```

When prompted, enter the mySql password.

## 6. Run the server

In a new tab in the terminal, run:
```
npm install
nodemon
```

## 7. You're ready to set up the front end!

Navigate to [time-wallet-client](https://github.com/redspanner/time-wallet-client) and follow the instructions in the README.md to finish the setup and run the application.
