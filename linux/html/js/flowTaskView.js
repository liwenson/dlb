var timer;
var vm = new Vue({
	el: "#app",
	data: {
		loading: false,
		tableData: [],
		nodes: [],
		nodeDependencies: {},
		dependencies: [],
		col: 0,
		row: 0,
		ceng: 0,
		pnode: "",
		nodeTask:{},
		deleteItems:[],
        form: {
            executionPk: -1
        },
        currentNodePk: 0,
        currentNodeId: '',
        formInfo: {
		    visible: false,
            info: {}
        },
        startEndForm: {
		    visible: false,
            info: {
                fileType: '',
                type: '',
                receiveMQ: ''
            }
        },
        techAuditVisible: false,
        processResult: '',
        butloading: false,
        progress:0
	},
	methods: {
	    refresh: function(){
            var _self = this;
            _self.loading = true;

            setTimeout(function (){
                getData("getExecutionInfo.do?executionPk="+executionPk,null,_self,function (response) {
                    _self.form.executionPk = executionPk;
                    _self.nodes = response.nodes;
                    _self.nodeDependencies = response.nodeDependencies;
                    _self.nodeTask = response.nodeTask;
                    _self.init();
                });
            }, 300);

        },
        editNode: function(nodeId) {
            var _self = this;

            if(nodeId==="startPoint" || nodeId ==="endPoint"){
                getData("getStartEndPointResult.do?type="+nodeId+"&executionPk="+executionPk,null,_self,function(response){
                    _self.startEndForm.info = response;
                    _self.startEndForm.visible = true;
                });
            }else{
                _self.currentNodeId = nodeId;
                var enodePk = _self.nodes[nodeId].nodePk;
                getData( "getExecutionNodeResult.do?enodePk="+enodePk,null,_self,function(response){
                    _self.formInfo.info = response;
                    if(response.enode_state==="running"){
                        //立刻取一次进度
                        _self.getProgress(response.enode_pk,nodeId);
                        timer = setInterval(function(){
                            //取进度
                            _self.getProgress(response.enode_pk,nodeId);
                        },10*1000);
                    }else{
                        clearInterval(timer);
                    }
                    _self.formInfo.visible = true;
                });
            }
        },
        closeWinaaa: function(){
	        var _self = this;
            clearInterval(timer);
            _self.formInfo.visible = false;

        },
        getProgress: function(enodePk,nodeId){
            //取任务进度
            var _self = this;
            //getData中传入空对象，防止底层loading效果出现
            var obj = {};
            getData("getProgress.do?enodePk="+enodePk,null,obj,function(response){
                _self.progress = response.progress;
                if(response.state!=1){
                    _self.refresh();
                    _self.editNode(nodeId);
                }
            })
        },
        refreshNodeData: function () {
            var _self = this;
            _self.loading = false;

            getData("getFlowInfo.do?flowPk="+flowPk,null,_self,function (response) {
                _self.nodes = response.nodes;
                _self.nodeDependencies = response.nodeDependencies;
                _self.init();
            });
        },
		init: function() {
			var _self = this;
			_self.tableData = [];
			_self.ceng = 0;
			_self.col = 0;
			_self.row = 0;
			_self.pnode = "";
			_self.formatNodeData("startPoint");
			console.log("tableData===");
			console.log(_self.tableData);
			_self.formatNodeIndex("startPoint", 0,1);
			_self.renderHtml();
			_self.binEvent();

		},
		formatNodeData: function(nodeName) {
			//格式化nodes数据为table
			var _self = this;
			var depNode = _self.nodeDependencies[nodeName];
			depNode.forEach(function(node, i) {
				_self.tableData.push(node);
				_self.formatNodeData(node);
			});
		},
		formatNodeIndex: function(nodeName, ceng,depth) {
			//nodes节点加序号,行号
			var _self = this;
			_self.tableData.forEach(function(node, i) {
				if (ceng == 0) {
					if(_self.nodes[node].parentNode==""){
						ceng=1;
					}else{
						ceng = _self.nodes[_self.nodes[node].parentNode].index; //父节点的序号
					}										
				}
				if (node == "endPoint") {
					depth++;
					ceng = 0;
				} else {
					pnode = node;
					ceng++;
					_self.nodes[node].index = ceng;
					_self.nodes[node].row=depth;
				}
			});
		},
		renderHtml: function() {
			//生成表格
			var _self = this;
			_self.computeColRow();			
			var table = document.querySelector("#wfs-table");
			table ? table.innerHTML = "" : (table = document.createElement("table")).setAttribute("id", "wfs-table");
			var htmlNode = document.createDocumentFragment();
			var firstRow = true;
			var firstCol = false;
			var td = _self.createNodeTaskHtml("startPoint","startPoint");
			var n = 1;
			var tableData = _self.tableData;
			tableData.forEach(function(node, i) {

				if (node == "endPoint") {
					n = n + 1;
					//补足空列
					for (m = n; m < (_self.col); m++) {
						td = td + _self.createNodeHtml("emptyM"); //中间的空
					}

					if (firstRow) {
						td = td + _self.createNodeTaskHtml("endPoint","endPoint"); //首行尾部
						firstRow = false;
					} else {
						td = td + _self.createNodeHtml("endEmpty"); //空的尾部
					}

					var tr = document.createElement("tr");
					tr.innerHTML = td;
					htmlNode.appendChild(tr);
					td = _self.createNodeHtml("empty"); //下行头部,空头部
					n = 1; //计数从1开始
					firstCol = true; //置下一个首列标志
				} else {
					n++;
					if (firstCol) {
						n = _self.nodes[_self.nodes[node].parentNode].index + 2 //取首列的序号
						firstCol = false;
						//补足首列前面的列
						for (m = 2; m < n; m++) {
							td = td + _self.createNodeHtml("empty"); //前空
						}
					}
					td = td + _self.createNodeTaskHtml(node, _self.nodes[node].taskType);

				}
			});
			table.appendChild(htmlNode);
		},
		createNodeHtml: function(nodeName){
			//创建空白节点
			if(nodeName=="startPoint" || nodeName=="endPoint"){
				td="<td><div class=\"line\" style=\"height: 50px;\"></div> <div id=\"activityStart\" class=\"wfn-info Start\"><span class=\"node-type \">"+nodeName+"</span> <span class=\"wfn-add-btn wfn-opt-btn\">加</span> <span class=\"wfn-delete-btn wfn-opt-btn\"></span> <span class=\"wfn-edit-btn wfn-opt-btn\">编</span> <ul class=\"wfn-add-ul\"><li data-type=\"Analysis\" class=\"wfn-add-item\">分析</li> <li data-type=\"Transcode\" class=\"wfn-add-item\">转码</li> <li data-type=\"Snapshot\" class=\"wfn-add-item\">截图</li> <li data-type=\"PackageTotal\" class=\"wfn-add-item\">打包</li> <li data-type=\"Censor\" class=\"wfn-add-item\">审核</li></ul></div></td>"
			}else if(nodeName=="empty"){
				td="<td class=\"empty\"><div class=\"line\"></div></td>";
			}else if(nodeName=="endEmpty"){
				td="<td width=\"130px\" class=\"empty\"><div class=\"line endline\" style=\"height: 50px;\"></div></td>";
			}else if(nodeName=="emptyM"){
				td="<td><div class=\"line\"></div></td>";
			}else{
				td="<td><div class=\"line\" style=\"height: 50px;\"></div> <div id=\"ANALYSIS_1514251744005\" class=\"wfn-info Analysis \"><span class=\"node-type \">"+nodeName+"</span> <span class=\"wfn-add-btn wfn-opt-btn\">加</span> <span class=\"wfn-delete-btn wfn-opt-btn\">删</span> <span class=\"wfn-edit-btn wfn-opt-btn\">编</span> <ul class=\"wfn-add-ul\"><li data-type=\"Transcode\" class=\"wfn-add-item\">转码</li></ul></div></td>";
			}			
			return td;
		},
		createNodeTaskHtml: function(nodeId,nodeType){
			//创建任务节点html
			var _self = this;
			td="";
			var nodeName = _self.nodeTask[nodeType].nodeTaskName;
			var nodeState = _self.nodes[nodeId].nodeState;
			if(nodeState==="success"){
			    nodeState="success";
            }else if( nodeState === "fail"){
			    nodeState = "Fail";
            }else if( nodeState === "wait"){
			    nodeState = "Ready";
            }else if( nodeState === "running"){
			    nodeState="Running";
            }
			if(nodeId==="startPoint" || nodeId==="endPoint"){
				td="<td><div class=\"line\" style=\"height: 50px;\"></div> <div id=\""+nodeId+"\" class=\"wfn-info instance-node "+nodeState+"\"><span class=\"node-type "+nodeState+"\">"+
				    nodeName+"</span> <span class=\"wfn-lookup-btn wfn-opt-btn\">查看</span>";
			}else{
				var depth = _self.computeBrotherDepth(nodeId);
				var baseNodeType = _self.nodes[nodeId].taskType;

                td="<td><div class=\"line\" style=\"height: "+ (depth*50) + "px;\"></div> <div id=\""+nodeId+"\" class=\"wfn-info instance-node "+nodeState+" \"><span class=\"node-type "+nodeState+" \">"+
                    nodeName+"</span><span class=\"wfn-lookup-btn wfn-opt-btn\">查看</span></div></td>"
				
				   
			}
			return td;
		},
		createNextNodeHtml: function(nodeType){
			//添加子节点
			var _self = this;
			var nextNodeTyps = _self.nodeTask[nodeType].nextTaskType;
			var items = nextNodeTyps.split(",");
			var html = "<ul class=\"wfn-add-ul\">";
			items.forEach(function(item,i){
				if(item=="") return false;
				var itemName = _self.nodeTask[item].nodeTaskName;
				html+="<li data-type=\""+item+"\" class=\"wfn-add-item\">"+itemName+"</li>";
			});
			html+="</ul></div></td>";
			return html;
		},
		createNodeHtml_old: function(nodeName){
			if(nodeName=="startPoint" || nodeName=="endPoint"){
				td="<td>"+nodeName+"</td>"
			}else if(nodeName=="empty"){
				td="<td>空</td>";
			}else if(nodeName=="endEmpty"){
				td="<td>后空</td>";
			}else if(nodeName=="emptyM"){
				td="<td>线空</td>";
			}else{
				td="<td>"+nodeName+"</td>";
			}			
			return td;
		},
		computeBrotherDepth: function(nodeId){
			//计算当前节点与哥哥节点的深度
			var _self = this;
			var parentNodeId = _self.nodes[nodeId].parentNode;
			var parent = _self.nodeDependencies[parentNodeId];
			var brotherNode="";
			depth = 1;
			parent.forEach(function(node,i){
				if(node===nodeId){
					if(brotherNode===""){
						depth = 1;						
					}else{
						depth =  _self.nodes[nodeId].row - _self.nodes[brotherNode].row;
					}
					return false;
				}else{
					brotherNode = node;
				}				
			});
			return depth;
		},
		computeColRow: function(){
			//计算总列数、行数
			var _self = this;			
			_self.col = 0;
			_self.row = 0;
			var n = 1;
			var maxn = 0;
			var newRowFlag=false;
			//取行数和列数
			var tableData = _self.tableData;
			tableData.forEach(function(node, i) {
				n++;
				if (node === "endPoint") {
					if (n > maxn) {
						maxn = n;						
					}
					_self.row++;
					newRowFlag = true;
				}else{
					if(newRowFlag){
						n= _self.nodes[ _self.nodes[node].parentNode ].index +2 ;     //取父节点序号
						newRowFlag=false;
					}
				}
				
			});
			_self.col = maxn;
			console.log("col:" + maxn + "row:" + _self.row);
		},
		binEvent: function(){
			//绑定事件
			var _self = this;
            $(".wfn-lookup-btn").on("click",function(e){
                var nodeId = $(e.target.parentNode).attr("id");
                _self.editNode(nodeId);
            });
		},
        onBack: function(){
		    history.back();
        },
        formatFileType: function(fileType){
		    if(fileType=="video"){
		        return "视频";
            }else if(fileType=="audio"){
		        return "音频";
            }else if(fileType=="picture"){
		        return "图片";
            }else{
		        return "其它";
            }
        },
        formatState: function(state){
            if( state==="wait"){
                return "<font color='#a9a9a9'>等待</font>";
            }else if(state==="running"){
                return "<i class='el-icon-loading' style='color:#00C3A8'></i>&nbsp;<font color='blue'>进行中</font>";
            }else if(state==="success"){
                return "<i class='el-icon-success' style='color:#00C3A8'></i>&nbsp;<font color='00FF00'>成功</font>";
            }else if(state==="fail"){
                return "<i class='el-icon-warning' style='color:#F88E85'>&nbsp;<font color='#FF0000'>失败</font>"
            }
        },
        formatState2: function(state){
	        if( state == "0"){
	            return "<font color='#00FF00'>通过</font>";
            }else if( state=="1"){
                return "<font color='#CCCCCC'>部分警告</font>";
            }else{
	            return "<font color='#FF0000'>不通过</font>";
            }
        },
        formatTaskType: function(nodeTaskType){
            var _self = this;
            if( _self.nodeTask[nodeTaskType] != null){
                return _self.nodeTask[nodeTaskType].nodeTaskName;
            }else{
                return "";
            }
        },
        formatOut: function(urlPath,state){
	        if(state==="success"){
	            return urlPath;
            }else{
	            return "";
            }
        },
        formmatMQ: function(receiveMQ){
            if(receiveMQ==null){
                return "用户未设置接收MQ消息";
            }else{
                if(receiveMQ==="Y"){
                    return "接收成功！";
                }else{
                    return "接收失败！"
                }
            }
        },
        getTechAuit: function(enodePk){
	        var _self = this;
	        _self.butloading = true;
	        var url = "getTechAudit.do?enodePk="+enodePk;
	        getData(url,null,_self,function(response){
                _self.techAuditVisible = true;
                _self.processResult = response.processResult;
                _self.butloading=false;
            });
        },
        doretry: function(enodePk){
	        var _self = this;
	        _self.butloading=true;
	        var url = "doRetry.do?enodePk="+enodePk;
            getData(url,null,_self,function(response){
                if(response.state=="success"){
                    _self.$message(response.message);
                    _self.formInfo.visible=false;
                    _self.refresh();
                }else{
                    _self.$message(response.message);
                }
                _self.butloading=false;
             });
        }
	},
	created: function() {
		var _self = this;
        _self.loading = true;
        getData("getExecutionInfo.do?executionPk="+executionPk,null,_self,function (response) {
           _self.form.executionPk = executionPk;
            _self.nodes = response.nodes;
            _self.nodeDependencies = response.nodeDependencies;
            _self.nodeTask = response.nodeTask;
            _self.init();
        });
	}
});


