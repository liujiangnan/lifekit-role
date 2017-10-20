var frame = new skyframe(); //获取对象 

$(function(){ 
  $('#roleManage').bind('click',function(){
    $(this).addClass("active");
    $("#engineManage").removeClass("active"); 
    frame.init({ //初始化
      id:"center",
      container:$("#centerFrame"),
      engine:"lifekit-role/roleManage"
    });
  });
  $('#engineManage').bind('click',function(){
    $(this).addClass("active");
    $("#roleManage").removeClass("active"); 
    frame.init({ //初始化
      id:"center",
      container:$("#centerFrame"),
      engine:"lifekit-role/engineManage"
    });
  });
});

$('#roleManage').trigger('click');