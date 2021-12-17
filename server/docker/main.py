
import sys
import json
import importlib
import time
import base64

fid = sys.argv[3]
model = importlib.import_module("CloudFunc."+fid)
context = {
    "id":fid,
    "group":sys.argv[2],
    "author":sys.argv[1],
    "memory_limit_in_mb":24,
    "time_limit_in_ms":2000,
    "timestrap":int(time.time())
}
event = base64.b64decode(sys.argv[4]).decode("utf-8")
result = {"result":model.main(json.loads(event),context)}
print(json.dumps(result,ensure_ascii=False))
