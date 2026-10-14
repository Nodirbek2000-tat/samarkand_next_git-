// Plain module (no "use client") so the server layout can inline the script as a string.
export const THEME_KEY = "ys-theme";

/** Runs in <head> before first paint so the saved theme never flashes. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
