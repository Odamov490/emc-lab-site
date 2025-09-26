import React from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // DEMO: email/parol tekshiruvisiz kirib ketadi
    navigate("/"); // kirgandan keyin bosh sahifaga qaytaramiz
  };

  return (
    <div style={{minHeight:"100vh", display:"grid", placeItems:"center"}}>
      <form onSubmit={handleSubmit} style={{width:320, padding:24, border:"1px solid #e5e7eb", borderRadius:16, background:"#fff"}}>
        <h1 style={{margin:0, marginBottom:12}}>Kirish</h1>
        <label style={{display:"block", fontSize:12, marginBottom:6}}>Email</label>
        <input type="email" required style={{width:"100%", padding:10, borderRadius:10, border:"1px solid #e5e7eb"}} />

        <label style={{display:"block", fontSize:12, margin:"12px 0 6px"}}>Parol</label>
        <input type="password" required style={{width:"100%", padding:10, borderRadius:10, border:"1px solid #e5e7eb"}} />

        <button type="submit" style={{marginTop:14, width:"100%", padding:10, borderRadius:10, background:"#111827", color:"#fff"}}>
          Kirish
        </button>

        <button type="button" onClick={() => navigate("/")} style={{marginTop:10, width:"100%", padding:10, borderRadius:10}}>
          Bosh sahifaga qaytish
        </button>
      </form>
    </div>
  );
}
