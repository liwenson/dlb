local ps = require("password")
local cjson = require("cjson")

local resultMap = {}
ngx.req.read_body()
local password = ngx.req.get_post_args()["password"]
if not ps.checkPassword(password) then
	resultMap.state="fail"
	resultMap.message="密码错误！"
else
	resultMap.state="success"
	resultMap.message="登录成功"
end

ngx.say(cjson.encode(resultMap))

