import requests, json
BASE='http://127.0.0.1:8000/api'
admin={'username':'admin.e2e@acme.com','password':'Password123!'}

s=requests.Session()
print('login admin')
r=s.post(f'{BASE}/auth/login', json={'username':admin['username'],'password':admin['password']})
print('login', r.status_code)
token=r.json().get('access_token')
headers={'Authorization':f'Bearer {token}'}

# 1) create package and delete it
pkg_body={'name':'TempDelete','description':'temp','total_hours':1,'price':10.0,'subject':'Test','is_active':True,'tutor_id':2}
cp=r=s.post(f'{BASE}/admin/packages', headers=headers, json=pkg_body)
print('create pkg', cp.status_code, cp.json())
pkg_id=cp.json().get('id')
del_r = s.delete(f'{BASE}/packages/{pkg_id}', headers=headers)
print('delete pkg', del_r.status_code, del_r.text)

# 2) create package, assign it, then try delete
cp2=r=s.post(f'{BASE}/admin/packages', headers=headers, json=pkg_body)
print('create pkg2', cp2.status_code, cp2.json())
pkg2=cp2.json().get('id')
assign_body={'student_id':9,'tutor_id':2,'package_id':pkg2,'custom_total_hours':1,'custom_price':10.0}
ass = s.post(f'{BASE}/admin/package-assignments', headers=headers, json=assign_body)
print('assign', ass.status_code, ass.text)
del2 = s.delete(f'{BASE}/packages/{pkg2}', headers=headers)
print('delete pkg2', del2.status_code, del2.text)
