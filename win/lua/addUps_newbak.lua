#!/usr/bin/env lua

local cjson = require "cjson"
local ps = require("password")
if not ps.checkLogin2() then
	return
end

ngx.req.read_body()
local serverName = ngx.req.get_post_args()["serverName"]
local host = ngx.req.get_post_args()["host"]
local weight = ngx.req.get_post_args()["weight"]
local op = ngx.req.get_post_args()["op"]
local upname=ngx.req.get_post_args()["upname"]
local resultMap = {}



if serverName==nil then
	resultMap["state"]="fail"
	resultMap["message"]="缺少参数serverName"
	ngx.say(cjson.encode(resultMap))
	return
end

if upname==nil then
	resultMap["state"]="fail"
	resultMap["message"]="缺少参数upname"
	ngx.say(cjson.encode(resultMap))
	return
end

if host==nil then
	resultMap["state"]="fail"
	resultMap["message"]="缺少参数host"
	ngx.say(cjson.encode(resultMap))
	return
end

if weight==nil then
	resultMap["state"]="fail"
	resultMap["message"]="缺少参数weight"
	ngx.say(cjson.encode(resultMap))
	return
end

if op==nil then
	resultMap["state"]="fail"
	resultMap["message"]="缺少参数op"
	ngx.say(cjson.encode(resultMap))
	return
end

local dynupszone = ngx.shared.dyn_ups_zone;
local jsonStr = dynupszone:get("myServers");
local serverTable1 = cjson.decode(jsonStr)

if serverTable1~=nil then
	if op=="add" then
		for key,value in pairs(serverTable1) do
			if host== value.host or serverName == value.serverName then
				resultMap["state"]="fail"
				resultMap["message"]="host或者serverName已存在"
				ngx.say(cjson.encode(resultMap))
				return
			end
		end
	end
end


--存入dict
local upss = dynupszone:get("myServers");
local upsteamTable={}

if op=="add" then
	upsteamTable = cjson.decode(upss)
	ngx.log(ngx.INFO,"===upsteamTable  ==",upsteamTable)
	-- 判断 upname 在共享区域是否存在
	if upsteamTable[upname]~=nil then
		local server=upsteamTable[upname]
		local map = {}

		-- 判断 主机是否存在
		if server[serverName] ~= nil then
		  map.state=state
		  map.health="Y"
		  map.state="on"
		  map.host=host
		  map.weight = weight
		  server[serverName]=map
		  upsteamTable[upname]=server
		else
		  map.state=state
		  map.health="Y"
		  map.state="on"
		  map.host=host
		  map.weight = weight
		  server[serverName]=map
		  upsteamTable[upname]=server
		end
	else
		local server={}
		map.state=state
		map.health=health
		map.host=host
		server[serverName]=map
		upsteamTable[upname]=server
	end

	-- cweight清0，重新分配权重
	 for k,v in pairs(upsteamTable) do
	 	v.cweight=0
	 end

else
	 upsteamTable = cjson.decode(upss)
	 for k,v in pairs(upsteamTable) do
	 	v.cweight=0
	 	if v.host == host then
	 		v.serverName = serverName
	 		v.weight = weight
	 	end
	 end
end



dynupszone:set("myServers",cjson.encode(upsteamTable))
--ngx.log(ngx.INFO,"===upss==",cjson.encode(upsteamTable))
--生成文件保存
local file = io.open("conf/proxy_new.json","w+")
local str = cjson.encode(upsteamTable)
file:write( str )
file:close()

--返回
resultMap["state"]="success"
resultMap["message"]=""
ngx.say(cjson.encode(resultMap))



