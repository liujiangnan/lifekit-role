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
      let roles = await Role.findAll();
      return ctx.render("lifekit-role/web/roleManage/list.ejs", { roles: roles });
    } catch (e) {
      console.log(e);
      return ctx.render("lifekit-role/web/roleManage/list.ejs", {});
    }
  }

  this.roleManage1 = async function(ctx) {
    try {
      let [rows, engines] = await Promise.all([
        User.findAll(),
        Engine.findAll({ include: [EngineAuth] })
      ]);
      return ctx.render("lifekit-role/web/roleManage/index.ejs", { userRows: rows, engines: engines });
    } catch (e) {
      console.log(e);
      return ctx.render("lifekit-role/web/roleManage/index.ejs", {});
    }
  }

  this.roleDetail = async function(ctx, id) {
    try {
      let role = await Role.findById(id);
      return ctx.render("lifekit-role/web/roleManage/addOrEdit.ejs", { role: role });
    } catch (e) {
      console.log(e);
      return ctx.render("lifekit-role/web/roleManage/addOrEdit.ejs", {});
    }
  }

  this.saveRole = async function(ctx, parms) {
    try {
      let id = parms.id;
      if (id) { //更新   
        await Role.upsert(parms); //更新基本信息   
      } else { //新建
        await Role.create(parms);
      }
      return ctx.body = "success";
    } catch (e) {
      console.log(e);
      return ctx.body = "fail";
    }
  }

  //模块列表
  this.engineManage = async function(ctx) {
    let engineList = await Engine.findAll();
    return ctx.render("lifekit-role/web/engineManage/list.ejs", { rows: engineList });
  }

  this.engineDetailView = async function(ctx, parms) {
    let id = parms ? parms.id : "";
    try {
      let eng = await Engine.findById(id);
      let auths = await EngineAuth.findAll({ where: { engineId: id } });
      return ctx.render("lifekit-role/web/engineManage/addOrEdit.ejs", { engine: eng, auths: auths });
    } catch (e) {
      console.log(e);
      return ctx.render("lifekit-role/web/engineManage/addOrEdit.ejs", {});
    }
  }

  this.getUserList = async function(ctx, roleId) {
    try {
      let rows = await User.findAll();
      let checked = await UserRole.findAll({ attributes: ["user_id"], where: { role_id: roleId } }); 
      return ctx.render("lifekit-role/web/roleManage/userList.ejs", { userRows: rows, checked: checked });
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
        await Promise.all([
          Engine.upsert(engineObj), //更新基本信息 
          EngineAuth.bulkCreate(engineAuths) //重新保存关联的权限
        ]);
      } else { //新建
        await Engine.create(engineObj, { include: [EngineAuth] });
      }
      return ctx.body = "success";
    } catch (e) {
      console.log(e);
      return ctx.body = "fail";
    }
  }


  this.deleteRole = async function(ctx, parms) {
    try {
      await Promise.all([ //删除角色及关联信息
        Role.destroy({ where: { id: parms } }),
        UserRole.destroy({ where: { role_id: parms } }),
        RoleEngine.destroy({ where: { role_id: parms } })
      ]);
      return ctx.body = "success";
    } catch (e) {
      console.log(e);
      return ctx.body = "fail";
    }
  }

  this.deleteEngine = async function(ctx, parms) {
    try {
      await [ //删除组件
        Engine.destroy({ where: { id: parms } }),
        EngineAuth.destroy({ where: { engineId: parms } })
      ]
      return ctx.body = "success";
    } catch (e) {
      console.log(e);
      return ctx.body = "fail";
    }
  }


}
module.exports = service;