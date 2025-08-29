import importlib

modules = ['app.admin.routes', 'app.admin.services', 'app.admin.schemas']
for m in modules:
    try:
        importlib.import_module(m)
        print(m + ' OK')
    except Exception as e:
        print(m + ' ERR ' + repr(e))