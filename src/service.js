const engineRoot = ENGINE_PATH + '/lifekit-role';

const Sequelize = require('sequelize');
const datasource = require(engineRoot + '/src/config/datasource.json');
const sequelize = new Sequelize(
  datasource.database,
  datasource.username,
  datasource.password,
  datasource);

let Role = sequelize.import(engineRoot + '/src/model/role.js');
let User = sequelize.import(engineRoot + '/src/model/user.js');
let RoleEngine = sequelize.import(engineRoot + '/src/model/roleEngine.js');
let UserRole = sequelize.import(engineRoot + '/src/model/userRole.js');
let Engine = sequelize.import(engineRoot + '/src/model/engine.js');
let EngineAuth = sequelize.import(engineRoot + '/src/model/engineAuth.js');
Engine.hasMany(EngineAuth);

sequelize.sync({ force: false }).then(function() {
  console.log("角色模块数据结构初始化成功");
}).catch(function(err) {
  console.log("角色模块数据结构初始化失败: %s", err);
});

function service(net) {

  this.roleManage = async function(ctx) { 
    try {
      let [rows,engines] = await [
        User.findAll(),
        Engine.findAll({include: [EngineAuth]})
      ] ;
      return ctx.render("lifekit-role/web/roleManage/index.ejs", { userRows: rows,engines:engines });
    } catch (e) {
      console.log(e);
      return ctx.render("lifekit-role/web/roleManage/index.ejs", {});
    } 
  } 

  //模块列表
  this.engineManage = async function(ctx) {
    let engineList = await Engine.findAll();
    return ctx.render("lifekit-role/web/engineManage/list.ejs", {rows:engineList});
  }

  this.engineDetailView = async function(ctx,parms){
    let id = parms?parms.id:"";
    try {
      let eng = await Engine.findById(id);
      let auths = await EngineAuth.findAll({where:{engineId:id}});
      return ctx.render("lifekit-role/web/engineManage/addOrEdit.ejs", {engine:eng,auths:auths});
    } catch (e) {
      console.log(e);
      return ctx.render("lifekit-role/web/engineManage/addOrEdit.ejs", {});
    } 
  }

  this.getUserList = async function(ctx) {
    try {
      let rows = await User.findAll();
      return ctx.render("lifekit-role/web/roleManage/userList.ejs", { rows: rows });
    } catch (e) {
      console.log(e);
      return ctx.render("lifekit-role/web/roleManage/userList.ejs", {});
    }
  }

  this.saveEngine = async function(ctx, engineObj) {
    try {
      let id = engineObj.id;
      if (id) { //更新
        await EngineAuth.destroy({ where: { engineId: id } }); //删除关联的权限
        let engineAuths = engineObj.engine_auths;
        for (let i = 0; i < engineAuths.length; i++) {
          engineAuths[i].engineId = id;
        }
        await [
          Engine.upsert(engineObj), //更新基本信息 
          EngineAuth.bulkCreate(engineAuths) //重新保存关联的权限
        ]

      } else { //新建
        await Engine.create(engineObj, { include: [EngineAuth] });
      } 
      return ctx.body = "success";
    } catch (e) {
      console.log(e);
      return ctx.body = "fail";
    } 
  }

  this.deleteEngine = async function (ctx, parms) {
    try {
      await [  //删除组件
        Engine.destroy({ where: { id: parms } }),
        EngineAuth.destroy({ where: { engineId: parms } })
      ]
      return ctx.body = "success";
    } catch (e) {
      console.log(e);
      return ctx.body = "fail";
    }  
  } 

  //检查昵称是否被其他用户使用
  this.checkNcAgain = async function(ctx, parms) {
    let id = ctx.session.user.get("id");
    try {
      var rows = await user.findAll({ where: { name: parms, id: { $ne: id } } });
      if (rows.length > 0) {
        return ctx.body = JSON.stringify({ 'valid': false });
      } else {
        return ctx.body = JSON.stringify({ 'valid': true });
      }
    } catch (e) {
      console.error(e);
      return ctx.body = JSON.stringify({ 'valid': false });
    }
  };

}
module.exports = service;