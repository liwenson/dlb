#!/usr/bin/env lua

local cjson = require "cjson"
local ps = require("password")
if not ps.checkLogin2() then
	return
end

local loadName = ngx.req.get_uri_args()["loadName"]
local hostName = ngx.req.get_uri_args()["hostName"]
-- local ip = ngx.req.get_uri_args()["ip"]
local state = ngx.req.get_uri_args()["state"]
local resultMap = {}


ngx.log(ngx.INFO,"===loadName==",cjson.encode(loadName))
ngx.log(ngx.INFO,"===hostName==",cjson.encode(hostName))
ngx.log(ngx.INFO,"===state==",cjson.encode(state))

if hostName==nil then
	resultMap["state"]="fail"
	resultMap["message"]="缺少参数hostName"
	ngx.say(cjson.encode(resultMap))
	return
end

if loadName==nil then
	resultMap["state"]="fail"
	resultMap["message"]="缺少参数loadName"
	ngx.say(cjson.encode(resultMap))
	return
end

-- if ip==nil then
-- 	resultMap["state"]="fail"
-- 	resultMap["message"]="缺少参数ip"
-- 	ngx.say(cjson.encode(resultMap))
-- 	return
-- end

if state==nil then
	resultMap["state"]="fail"
	resultMap["message"]="缺少参数state"
	ngx.say(cjson.encode(resultMap))
	return
end

local upss = ngx.shared.dyn_ups_zone:get("myServers")
local UPTable = cjson.decode(upss)

ngx.log(ngx.INFO,"===state==",cjson.encode(state))

if state == "on" then
	for key,value in pairs(UPTable) do
		if (key == loadName) then
			for k,v in pairs(value) do
				v.cweight=0
				if ( hostName == k ) then
					v.state="on"
				end
			end
		end
	end
else
  ngx.log(ngx.INFO,"===UPTable==",cjson.encode("OFFFFFF "))
	for key,value in pairs(UPTable) do
		if (key == loadName) then
			for k,v in pairs(value) do
				v.cweight=0
				if ( hostName == k ) then
					v.state="off"
				end
			end
		end
	end
end

ngx.log(ngx.INFO,"===UPTable==",cjson.encode(UPTable))


local upss_string = cjson.encode(UPTable)
ngx.shared.dyn_ups_zone:set("myServers",upss_string)
--保存文件
local file = io.open("../conf/proxy_new.json","w+")
file:write( cjson.encode(UPTable) )
file:close()

resultMap["state"]="success"
resultMap["message"]=""
ngx.say(cjson.encode(resultMap))

