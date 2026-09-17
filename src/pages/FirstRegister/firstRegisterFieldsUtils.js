// Constantes usadas pelos átomos de FirstRegisterFields.jsx — mesma paleta de
// pages/Register/registerFieldsUtils.js (as duas etapas do cadastro
// compartilham a identidade visual), mas mantida em arquivo próprio: cada
// pasta de recurso tem seus próprios átomos/utils, sem import cruzado entre
// FirstRegister/ e Register/ (mesma convenção de ContractForm vs Register).
export const inputClassName =
  "h-11 w-full rounded-md bg-slate-100 px-4 text-base font-medium text-gray-500 outline-none placeholder:text-gray-500 focus:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60";
export const labelClassName = "text-sm font-medium text-slate-600";
export const primaryButtonClassName =
  "rounded-full bg-neutral-900 px-6 py-4 text-center font-dm-sans text-base font-bold text-gray-50 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";
export const secondaryButtonClassName =
  "rounded-full border border-neutral-900 px-6 py-4 text-center font-dm-sans text-base font-bold text-neutral-900 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40";
