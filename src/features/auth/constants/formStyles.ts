import { disabledFormControlClassName } from "@/lib/styles/disabled-field";

export const AUTH_FORM_INPUT_CLASS_NAME = `
  h-12 w-full rounded-2xl border border-white/40 bg-white/95 px-4 text-base text-slate-900 shadow-sm outline-none transition
  placeholder:text-sm placeholder:text-slate-400
  focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-300/50
  aria-[invalid=true]:border-red-300 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-200
  ${disabledFormControlClassName}
`;

export const AUTH_TOKEN_DIGIT_INPUT_CLASS_NAME = `
  h-14 w-14 rounded-2xl border border-white/40 bg-white/95 px-0 text-center text-base font-semibold tracking-wide text-slate-900 shadow-sm outline-none transition
  placeholder:text-sm placeholder:text-slate-400
  focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-300/50
  aria-[invalid=true]:border-red-300 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-200
  ${disabledFormControlClassName}
`;
