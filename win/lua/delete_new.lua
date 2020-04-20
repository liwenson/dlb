#!/usr/bin/env lua

local cjson = require "cjson"
local ps = require("password")
if not ps.checkLogin2() then
	return
end

local loadName = ngx.req.get_uri_args()["loadName"]
local hostName = ngx.req.get_uri_args()["hostName"]
local resultMap = {}

if loadName == nil then
	resultMap["state"]="fail"
  resultMap["message"]="缺少参数loadName"
  ngx.log(ngx.INFO,"===upss==",cjson.encode(loadName))
	ngx.say(cjson.encode(resultMap))
	return
end

if hostName == nil then
	resultMap["state"]="fail"
	resultMap["message"]="缺少参数hostName"
	ngx.say(cjson.encode(resultMap))
	return
end


-- 删除table中的元素
local function removeElementByKey(tbl,key)
  --新建一个临时的table
  local tmp ={}

  --把每个key做一个下标，保存到临时的table中，转换成{1=a,2=c,3=b}
  --组成一个有顺序的table，才能在while循环准备时使用#table
  for i in pairs(tbl) do
      table.insert(tmp,i)
  end

  local newTbl = {}
  --使用while循环剔除不需要的元素
  local i = 1
  while i <= #tmp do
      local val = tmp [i]
      if val == key then
          --如果是需要剔除则remove
          table.remove(tmp,i)
        else
          --如果不是剔除，放入新的tabl中
          newTbl[val] = tbl[val]
          i = i + 1
        end
      end
  return newTbl
end


local dynupszone = ngx.shared.dyn_ups_zone;
local upss = dynupszone:get("myServers")

local server={}
local new_upss={}
--解析upss,去掉host
--i=#serverTable   获取serverTable的长度
local UPTable = cjson.decode(upss)
if UPTable ~= nil then
	for k,v in pairs(UPTable) do
		if k == loadName then
			local serverTable=UPTable[k]
			new_upss=removeElementByKey(serverTable,hostName)
			UPTable[k]=new_upss
		end
	end
end

--把table转为字串，保存
local upss_string = cjson.encode(UPTable)
ngx.shared.dyn_ups_zone:set("myServers",upss_string)

--保存文件
local file = io.open("conf/proxy_new.json","w+")
file:write( cjson.encode(UPTable) )
file:close()

resultMap["state"]="success"
resultMap["message"]=""
ngx.say(cjson.encode(resultMap))

