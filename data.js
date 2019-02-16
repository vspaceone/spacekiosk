const MongoClient = require('mongodb').MongoClient;


class DB {
    constructor(connectionString){
        this.client = new MongoClient(connectionString)
    }

    async createAccount(tagID){
        await this.client.connect()

        const db = this.client.db("spacekiosk")

        await db.collection("accounts").insertOne({
            tagID: tagID,
            credit: 0
        })
    }

    async getAccountByTagID(tagID){
        await this.client.connect()
            .catch((err) => {
                console.log("Catched: " + err)
                throw "Error connecting to DB"
            });

        const db = this.client.db("spacekiosk")

        const accounts = await db.collection("accounts").find({
            tagID: tagID
        }).toArray()

        if (accounts.length != 1){
            return null
        }

        return accounts[0]
    }

    async updateCredit(tagID, amount){
        await this.client.connect()

        const db = this.client.db("spacekiosk")

        const accounts = await db.collection("accounts").updateOne({tagID:tagID},
            {$inc:{credit:amount}})

        return await this.getAccountByTagID(tagID)
    }

    async getAccounts(){
        await this.client.connect()

        const db = this.client.db("spacekiosk")

        const accounts = await db.collection("accounts").find().toArray()

        return accounts
    }
}

exports.DB = DB