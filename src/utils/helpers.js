// src/utils/helpers.js
import { ORG_LIST, STATUS_TOLOV, STATUS_HOLAT, QIZIL_ZONA } from "./constants";

export const emptyApp = { appNum:"", org:ORG_LIST[0], product:"", client:"", pay:STATUS_TOLOV[0], flow:STATUS_HOLAT[0], red:QIZIL_ZONA[1], note:"" };

export function validateApp(app){
  const errors=[];
  if(!app.appNum?.trim()) errors.push("Ariza raqami majburiy.");
  if(!/^\d{3,}$/.test(app.appNum.trim())) errors.push("Ariza raqami faqat raqam va kamida 3 belgidan iborat bo‘lsin.");
  if(!app.product?.trim()) errors.push("Mahsulot majburiy.");
  if(!app.client?.trim()) errors.push("Mijoz maydoni majburiy.");
  if(!ORG_LIST.includes(app.org)) errors.push("Organ noto‘g‘ri.");
  if(!STATUS_TOLOV.includes(app.pay)) errors.push("To‘lov statusi noto‘g‘ri.");
  if(!STATUS_HOLAT.includes(app.flow)) errors.push("Holat noto‘g‘ri.");
  if(!QIZIL_ZONA.includes(app.red)) errors.push("Qizil zona noto‘g‘ri.");
  return errors;
}

export const formatDT=(ts)=>{ try{ return ts?.toDate ? ts.toDate().toLocaleString() : "-"; }catch{return "-";} };
