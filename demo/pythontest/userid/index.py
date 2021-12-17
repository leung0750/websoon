

def main(event):
    print(event["key1"],event["key2"])
    return event["key1"]+event["key2"]

def test():
    return "hello"