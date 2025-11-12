// src/features/EmployeesAdmin.jsx
import React from "react";
import { Card, Input } from "../components/ui";
import { STAFF_PHOTOS, T } from "../utils/constants";

export default function EmployeesAdmin({ lang, t, me, empForm, setEmpForm, savingEmp, addEmployee, empList, removeEmployee }){
  return (
    <>
      <Card>
        <div className="text-lg font-semibold mb-3">{t.addEmployee}</div>
        <form onSubmit={addEmployee} className="grid sm:grid-cols-2 gap-4 text-sm">
          <div><label className="font-medium">{t.fullname}</label><Input value={empForm.fullname} onChange={e=>setEmpForm(s=>({...s,fullname:e.target.value}))} placeholder="Sobirov Doston" required/></div>
          <div><label className="font-medium">{t.empUsername}</label><Input value={empForm.username} onChange={e=>setEmpForm(s=>({...s,username:e.target.value}))} placeholder="doston" required/></div>
          <div><label className="font-medium">{t.empPassword}</label><Input type="text" value={empForm.password} onChange={e=>setEmpForm(s=>({...s,password:e.target.value}))} placeholder="parol" required/></div>
          <div><label className="font-medium">{t.photoUrl}</label><Input type="url" value={empForm.photoUrl} onChange={e=>setEmpForm(s=>({...s,photoUrl:e.target.value}))} placeholder="https://...jpg (ixtiyoriy)"/></div>
          <div><label className="font-medium">{t.empRole}</label>
            <select className="mt-1 w-full rounded-xl border px-3 py-2" value={empForm.role} onChange={e=>setEmpForm(s=>({...s,role:e.target.value}))}>
              <option value="employee">{t.employee}</option>
              <option value="admin">{t.admin}</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button disabled={savingEmp} className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60">{savingEmp?t.loading:t.create}</button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="text-lg font-semibold mb-3">{t.employeesList}</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-3">Rasm</th>
                <th className="py-2 pr-3">{t.fullname}</th>
                <th className="py-2 pr-3">{t.username}</th>
                <th className="py-2 pr-3">{t.role}</th>
                <th className="py-2 pr-3">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {empList.length===0 && (<tr><td colSpan={5} className="py-4 text-gray-400">{t.none}</td></tr>)}
              {empList.map(e=>(
                <tr key={e.id} className="border-t">
                  <td className="py-2 pr-3">{e.photoUrl ? <img src={e.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover"/> : "—"}</td>
                  <td className="py-2 pr-3">{e.fullname||"-"}</td>
                  <td className="py-2 pr-3">{e.username}</td>
                  <td className="py-2 pr-3">{e.role}</td>
                  <td className="py-2 pr-3">
                    <button onClick={()=>removeEmployee(e.id)} className="text-red-600 hover:underline">{t.remove}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
