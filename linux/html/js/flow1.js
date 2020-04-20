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
            flowId:'',
            flowName: '',
            fileType: '',
            recevieMQ: false
        },
        forms:{
            startPoint: {
                visible: false,
                form: {
                    fileType: ''
                }
            },
            transcode: {
                visible: false,
                form: {
                    templet: '',
                    storeAccessType: '',
                    storeId:'',
                    storePath:'',
                    regist:'Y',
                    registType:'p'
                },
                oldform:{}
            },
            mediamove: {
                visible: false,
                form: {
                    storeAccessType: '',
                    storeId: '',
                    storePath: '',
                    moveType: 'copy',
                    checkMd5: 'Y',
                    register: '',
                    registerType: ''
                },
                oldfrom: {}
            },
            getframe: {
                visible: false,
                form: {
                    getFrameType: 'percent',
                    count: 10,
                    storeAccessType: '',
                    storeId: '',
                    storePath: '',
                    setcover: 'Y',
                    picWidth: 800,
                    picHeight: 450,
                    regist: 'Y'
                },
                oldform: {}
            },
            technologyaudit: {
                visible: false,
                form: {
                    templet: '',
                    dealOnNoPass: 'ignore'
                },
                oldform: {}
            },
            endPoint: {
                visible: false,
                form: {
                    recevieMQ: 'N'
                },
                oldform: {}
            },
            default: {
                visible: false
            }
        },
        rules:{
            flowId:[
                {
                    required: true, message: '请输入流程Id', trigger: 'blur'
                },
                {
                    min: 6, max: 32, message: '长度在 6 到 32 个字符', trigger: 'blur'
                }
            ],
            flowName:[
                {
                    required: true, message: '请输入流程名称', trigger: 'blur'
                },
                {
                    min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur'
                }
            ]
        },
        rules_transcode:{
            templet: [
                {
                    required: true, message: '请选择模板', trigger: 'blur'
                }
            ],
            storeAccessType: [
                {
                    required: true, message: '请选择访问方式', trigger: 'blur'
                }
            ],
            storeId: [
                {
                    required: true, message: '请选择存储', trigger: 'blur'
                }
            ],
            storePath: [
                {
                    required: true, message: '请输入路径', trigger: 'blur'
                },
                {
                    max: 300, message: '长度最多300个字符', trigger: 'blur'
                }
            ]
        },
        rules_mediamove:{
            templet: [
                {
                    required: true, message: '请选择模板', trigger: 'blur'
                }
            ],
            storeAccessType: [
                {
                    required: true, message: '请选择访问方式', trigger: 'blur'
                }
            ],
            storeId: [
                {
                    required: true, message: '请选择存储', trigger: 'blur'
                }
            ],
            storePath: [
                {
                    required: true, message: '请输入路径', trigger: 'blur'
                },
                {
                    max: 300, message: '长度最多300个字符', trigger: 'blur'
                }
            ]
        },
        rules_getframe:{
            templet: [
                {
                    required: true, message: '请选择模板', trigger: 'blur'
                }
            ],
            storeAccessType: [
                {
                    required: true, message: '请选择访问方式', trigger: 'blur'
                }
            ],
            storeId: [
                {
                    required: true, message: '请选择存储', trigger: 'blur'
                }
            ],
            storePath: [
                {
                    required: true, message: '请输入路径', trigger: 'blur'
                },
                {
                    max: 300, message: '长度最多300个字符', trigger: 'blur'
                }
            ]
        },
        rules_technologyaudit:{
            templet: [
                {
                    required: true, message: '请选择模板', trigger: 'blur'
                }
            ]
        },
        rules_endPoint:{
        },
        templateList: {},
        storeList:[],
        accessList:[],
        currentNodePk: 0,
        currentNodeId: ''
	},
	methods: {
		addNode: function(nodeId) {
			var _self = this;			
			if( $("#"+nodeId).hasClass("list-open") ){
				$("#"+nodeId).removeClass("list-open");
			}else{
				$("#"+nodeId).addClass("list-open");
			}
		},
		addItem: function(nodeId,nodeType){
			var _self = this;
			var url = "addNodeItem.do";
			parentNodePk = _self.nodes[nodeId].nodePk;
			var data={
			    parentNodePk: parentNodePk,
                nodeType: nodeType,
                flowPk: flowPk
			};
			getData(url,data,_self,function(response){
				if(response.state=="error"){
				    _self.$message(response.message);
                }else{
                    _self.refreshNodeData();
                }
			});
		},
		editNode: function(nodeId) {
			var _self = this;
            _self.currentNodeId = nodeId;
			_self.currentNodePk = _self.nodes[nodeId].nodePk;
			var nodeTaskType = _self.nodes[nodeId].taskType;
			if( _self.nodes[nodeId].params == ""){
                _self.forms[nodeTaskType].form = _self.forms[nodeTaskType].oldform; //默认值
            }else{
                _self.forms[nodeTaskType].form = JSON.parse(_self.nodes[nodeId].params);
            }
			_self.forms[nodeTaskType].visible = true;
		},
        dialogSave: function(formname,ruleForm){
            //保存参数
            var _self = this;
           _self.$refs[ruleForm].validate(function(valid){
                if(valid){
                    var paramJsonStr = JSON.stringify(_self.forms[formname].form);
                    data = {
                        params: paramJsonStr,
                        nodePk: _self.currentNodePk
                    };
                    postData("updateFlowNodeParams.do",data,_self,function(response){
                        if(response.state=="error"){
                            _self.$message("发生错误："+response.message);
                        }else{
                            _self.nodes[_self.currentNodeId].params = paramJsonStr;
                            _self.forms[formname].visible=false;
                            _self.refreshNodeData();
                        }
                    })
                }
            });
        },
		deleteNode: function(nodeId){
			var _self = this;
			_self.$confirm('此操作将永久删除该节点, 是否继续?', '提示', {
			  confirmButtonText: '确定',
			  cancelButtonText: '取消',
			  type: 'warning'
			}).then(				
				function(){
				    var nodePk = _self.nodes[nodeId].nodePk;
					var url = "deleteNodeItem.do?nodePk="+nodePk;
					getData(url,null,_self,function(response){
						var parentNode = _self.nodes[nodeId].parentNode;						
						//删除父节点里的子节点
						var parentNodes = _self.nodeDependencies[parentNode];
						parentNodes.forEach(function(node,i){
							if(node == nodeId){
								parentNodes.splice(i,1); //删除此节点
								return false;
							}
						});
						if(parentNodes.length==0){
							//如果子节点为空,则加endPoint
							parentNodes.push("endPoint");
						}
						
						//递归删除所有字节点
						_self.deleteItems=[nodeId];
						_self.deleteSubNode(nodeId);
						_self.deleteItems.forEach(function(item,i){
							delete _self.nodes[item];
							delete _self.nodeDependencies[item];
						});
						
						delete _self.nodeDependencies[nodeId]; //删除本节点
						console.log(_self.nodeDependencies);
						console.log(_self.nodes);
						_self.init();
					});
					
				}
			).catch(function(){});		
		},
		deleteSubNode: function(nodeId){
			var _self = this;
			if(nodeId=="endPoint") return;
			subNodes = _self.nodeDependencies[nodeId];
			subNodes.forEach(function(item,i){
				if(item!="endPoint"){
					_self.deleteItems.push(item);
					_self.deleteSubNode(item);
				}				
			});			
		},
        refreshNodeData: function () {
            var _self = this;
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
			var nodeParams = _self.nodes[nodeId].params;
			var nodeParamsState =  (nodeParams==="" || nodeParams==="{}")? "nofinish": "finished";
			if(nodeId=="startPoint"){
				td="<td><div class=\"line\" style=\"height: 50px;\"></div> <div id=\""+nodeId+"\" class=\"wfn-info "+nodeParamsState+"\"><span class=\"node-type \">"+
				    nodeName+"</span> <span class=\"wfn-add-btn wfn-opt-btn\">加</span> <span class=\"wfn-delete-btn wfn-opt-btn\"></span> <span class=\"wfn-edit-btn wfn-opt-btn\">编</span>"+
					_self.createNextNodeHtml(nodeType);
			}else if(nodeId=="endPoint"){
				td="<td><div class=\"line\" style=\"height: 50px;\"></div> <div id=\""+nodeId+"\" class=\"wfn-info "+nodeParamsState+"\"><span class=\"node-type \">"+
				    nodeName+"</span><span class=\"wfn-delete-btn wfn-opt-btn\"></span> <span class=\"wfn-edit-btn wfn-opt-btn\">编</span>"+
					_self.createNextNodeHtml(nodeType);
			}else{
				var depth = _self.computeBrotherDepth(nodeId);
				var baseNodeType = _self.nodes[nodeId].taskType;
				if( _self.nodeTask[baseNodeType].nextTaskType==""){
					td="<td><div class=\"line\" style=\"height: "+ (depth*50) + "px;\"></div> <div id=\""+nodeId+"\" class=\"wfn-info "+nodeParamsState+" \"><span class=\"node-type \">"+
                        nodeName+"</span><span class=\"wfn-delete-btn wfn-opt-btn\">删</span> <span class=\"wfn-edit-btn wfn-opt-btn\">编</span></div></td>"
				}else{
					td="<td><div class=\"line\" style=\"height: "+ (depth*50) + "px;\"></div> <div id=\""+nodeId+"\" class=\"wfn-info "+nodeParamsState+" \"><span class=\"node-type \">"+
                        nodeName+"</span> <span class=\"wfn-add-btn wfn-opt-btn\">加</span> <span class=\"wfn-delete-btn wfn-opt-btn\">删</span> <span class=\"wfn-edit-btn wfn-opt-btn\">编</span>"+
					   _self.createNextNodeHtml(nodeType);
				}
				
				   
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
				if(node==nodeId){
					if(brotherNode==""){
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
				if (node == "endPoint") {
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
			$(".wfn-edit-btn").on("click",function(e){
				var nodeId = $(e.target.parentNode).attr("id");
				_self.editNode(nodeId);
			});
			
			$(".wfn-delete-btn").on("click",function(e){
				var nodeId = $(e.target.parentNode).attr("id");
				_self.deleteNode(nodeId);
			});
			
			$(".wfn-add-btn").on("click",function(e){
				var nodeId = $(e.target.parentNode).attr("id");
				_self.addNode(nodeId);
			});
			
			$(".wfn-add-item").on("click",function(e){
				var nodeId = $(e.target.parentNode.parentNode).attr("id");
				var nodeType = $(e.target).attr("data-type");
				_self.addItem(nodeId,nodeType);
			});
		},
        onBack: function(){
		    history.back();
        },
        onSave: function () {
            var _self = this;
            if( _self.form.flowName == ""){
                _self.$message("请输入流程名称");
                return;
            }
            var data = {
                "flowPk": flowPk,
                "flowName": _self.form.flowName
            };
            postData("saveNodeInfo.do",data,_self,function (response) {
                if(response.state=="error"){
                    _self.$message(response.message);
                }else{
                    _self.$message("保存成功！");
                }
            })
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
        }
	},
	created: function() {
		var _self = this;
        getData("getFlowInfo.do?flowPk="+flowPk,null,_self,function (response) {
           _self.form.flowId = response.flowInfo.flow_id;
           _self.form.flowName = response.flowInfo.flow_name;
            _self.nodes = response.nodes;
            _self.nodeDependencies = response.nodeDependencies;
            _self.nodeTask = response.nodeTask;
            _self.init();
        });

        getData("getTempLateList.do",null,_self,function(response){
            _self.templateList = response;
        });

        getData("getStorageList.do",null,_self,function(response){
            _self.storeList = response;
        });

        getData("getAccessList.do",null,_self,function(response){
            _self.accessList = response;
        });

        //oldform默认值赋值
        for( item in _self.forms ){
            _self.forms[item].oldform = _self.forms[item].form;
        }
	}
});


