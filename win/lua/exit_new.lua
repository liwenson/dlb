local ps = require("password")
local cjson = require("cjson")

local resultMap = {}
ngx.req.read_body()

ps.exit()

resultMap.state="success"
resultMap.message=""
ngx.say(cjson.encode(resultMap))

