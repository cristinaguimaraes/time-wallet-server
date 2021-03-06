const services = require('../services/services.js')
const commoditiesBC = require('../blockchain/commoditiesBC.js')
const usersDb = require('./usersDb');
const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
  database: process.env.DB_NAME,
  user:process.env.DB_USER,
  password:process.env.DB_PASS
})

exports.createTask = (ctx) => {
  const taskId = services.generateCode();
  ctx.request.body.taskId = taskId;
  ctx.request.body.userAsk = ctx.user.userId;
  ctx.request.body.userDo = "";
  ctx.request.body.status = 'Submitted';
  const query = connection.query(`INSERT into tasks SET ?`, ctx.request.body, (error) => {
    if (error) throw error;
  })

}

exports.updateTask = (ctx) => {
  const taskId = ctx.params.taskId;
  const fields = Object.keys(ctx.request.body)
  fields.forEach((key)=> {

    // if (key==="status" & fields[key] ==="User Requested") {
    //   const query = connection.query(`SELECT usersRequesting FROM tasks WHERE taskId = "${taskId}"`, (error, results) => {
    //     if (error) throw error;
    //     let newValue = results[0].usersRequesting.isnull()? [ctx.user.userId]:results[0].usersRequesting.push(ctx.user.userId);
    //     const query = connection.query(`UPDATE tasks SET usersRequesting = "${newValue}" WHERE taskId = "${taskId}"`, (error) => {
    //       if (error) throw error;
    //     })
    //   })
    // } else {
    //   const query = connection.query(`UPDATE tasks SET ${key} = "${ctx.request.body[key]}" WHERE taskId = "${taskId}"`, (error) => {
    //     if (error) throw error;
    // })}

    const query = connection.query(`UPDATE tasks SET ${key} = "${ctx.request.body[key]}" WHERE taskId = "${taskId}"`, (error) => {
        if (error) throw error;
    })
    if (key==="status" & ctx.request.body[key] === "Request Accepted") {
      const query = connection.query(`SELECT userAsk, userDo, time FROM tasks WHERE taskId = "${taskId}"`,  async(error, results) => {
        if (error) throw error;
        const walletUserAsk = await usersDb.getWalletId(results[0].userAsk);
        const walletUserDo = await usersDb.getWalletId(results[0].userDo);
        const amount = Number(results[0].time);
        commoditiesBC.payUser(ctx, walletUserAsk.walletId, walletUserDo.walletId, amount);
        connection.query(`UPDATE users SET balance = balance +${amount} where userId ="${results[0].userDo}"`, (error) => {
            if (error) throw error;
        })
        connection.query(`UPDATE users SET balance = balance -${amount} where userId ="${results[0].userAsk}"`, (error) => {
            if (error) throw error;
        })

      })
    }
  })
  ctx.status = 200;
}

exports.deleteTask = (ctx) => {
  const taskId = ctx.params.taskId;
  //ctx.body will be an object with the field to update
  const query = connection.query(`DELETE from tasks WHERE taskId = ${taskId}`, (error) => {
    if (error) throw error;

  })
}

exports.getMyAskTasks = (ctx) => {
  const userId = ctx.user.userId;
  return new Promise((resolve, reject) => {
    const query = connection.query(`SELECT * from tasks WHERE userAsk = "${userId}"`, (error, results) => {
      if (error) throw error;
      resolve(results);
    })
  })
}

exports.getMyDoTasks = (ctx) => {
  const userId = ctx.user.userId;
  return new Promise((resolve, reject) => {
    const query = connection.query(`SELECT * from tasks WHERE userDo = "${userId}"`, (error, results) => {
      if (error) throw error;
      resolve(results);
    })
  })
}

exports.searchTasks = (ctx) => {
  const userId = ctx.user.userId;
  return new Promise((resolve, reject) => {
    const query = connection.query(`SELECT * from tasks WHERE userAsk <> "${userId}" AND status = "Submitted"`, (error, results) => {
      if (error) throw error;
      resolve(results);
    })
  })

}
